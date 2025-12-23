// js/faucet.js
// IMPORTANT: configure these before deploying
const CONFIG = {
  network: 'testnet', // 'testnet' or 'mainnet'
  jettonTicker: 'PLO',
  claimAmount: '500', // human amount (string)
  decimals: 9, // typical TON Jetton decimals (adjust to your jetton)
  jettonMaster: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // TODO: your Jetton master address
  faucetContract: 'EQBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', // TODO: your faucet contract address
};

const state = {
  connected: false,
  address: null,
  lastClaimAt: null,
};

const walletStatusEl = document.getElementById('walletStatus');
const claimBtn = document.getElementById('claimBtn');
const claimStatusEl = document.getElementById('claimStatus');

function setStatus(el, msg, type = 'info') {
  el.textContent = msg;
  el.className = `status ${type}`;
}

function toAtomic(amountStr, decimals) {
  // Converts "500" with 9 decimals to atomic units
  const [whole, frac = ''] = amountStr.split('.');
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(whole + fracPadded).toString();
}

function canClaimAgain(lastClaimMillis) {
  if (!lastClaimMillis) return true;
  const now = Date.now();
  const diff = now - lastClaimMillis;
  const hours = diff / (1000 * 60 * 60);
  return hours >= 24;
}

async function initTonConnect() {
  // Init TonConnect UI
  const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://plinkofaucet.com/tonconnect-manifest.json',
    buttonRootId: 'ton-connect',
  });

  // Prefer testnet for development
  tonConnectUI.setNetwork(CONFIG.network === 'testnet' ? 'testnet' : 'mainnet');

  // Listen for connection status
  tonConnectUI.onStatusChange(async (wallet) => {
    if (wallet) {
      state.connected = true;
      state.address = wallet.account.address;
      setStatus(walletStatusEl, `Connected: ${state.address}`, 'success');
      claimBtn.disabled = false;
    } else {
      state.connected = false;
      state.address = null;
      setStatus(walletStatusEl, 'Not connected', 'warning');
      claimBtn.disabled = true;
    }
  });

  // Load last claim time from local storage (client-side guard)
  const saved = localStorage.getItem('plo:lastClaimAt');
  state.lastClaimAt = saved ? Number(saved) : null;

  // Button click -> send claim tx
  claimBtn.addEventListener('click', async () => {
    if (!state.connected) {
      setStatus(claimStatusEl, 'Please connect your wallet first.', 'warning');
      return;
    }
    if (!canClaimAgain(state.lastClaimAt)) {
      setStatus(claimStatusEl, 'Claim unavailable: wait 24 hours since your last claim.', 'error');
      return;
    }

    try {
      setStatus(claimStatusEl, 'Preparing claim transaction...', 'info');

      // Atomic value in jetton units
      const atomic = toAtomic(CONFIG.claimAmount, CONFIG.decimals);

      // NOTE: Your faucet smart contract should enforce:
      // - per-address 24h interval
      // - mint 500 PLO to claimer
      // - burn 500 PLO (1:1) in same transaction
      // - optional: track total burned and circulating supply
      //
      // Here we send a basic internal message to your faucet contract.
      // You should implement parsing of op codes / payload in the contract.

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: CONFIG.faucetContract,
            amount: '2000000', // 0.002 TON for gas; adjust as needed
            payload: b64Payload({
              op: 'CLAIM',
              ticker: CONFIG.jettonTicker,
              amountAtomic: atomic,
              decimals: CONFIG.decimals,
              network: CONFIG.network,
              // optional metadata reflection
              meta: {
                policy: '1:1 burn per claim',
                totalSupply: '24000000000.000000000', // reflect with decimals if you use 9
              },
            }),
          },
        ],
      };

      // Send transaction via TonConnect
      await TON_CONNECT_UI.sendTransaction(tx);

      // Update UI
      state.lastClaimAt = Date.now();
      localStorage.setItem('plo:lastClaimAt', String(state.lastClaimAt));

      setStatus(
        claimStatusEl,
        `Claim submitted: +${CONFIG.claimAmount} ${CONFIG.jettonTicker}. A matching ${CONFIG.claimAmount} burn is triggered on-chain.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      setStatus(claimStatusEl, `Transaction failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  });
}

// Minimal base64 payload builder (JSON → base64). Replace with TL-B/BOC payloads as needed.
function b64Payload(obj) {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)));
}

// Bootstrap
document.addEventListener('DOMContentLoaded', initTonConnect);
