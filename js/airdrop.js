function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function loadAirdropData() {
  fetch('data/airdrop.json')
    .then(res => res.json())
    .then(data => {
      document.getElementById('round').textContent = data.airdrop_round;
      document.getElementById('start').textContent = formatDate(data.start_date);
      document.getElementById('end').textContent = formatDate(data.end_date);
      document.getElementById('total').textContent = data.total_tokens.toLocaleString();
    });
}

document.getElementById('connectBtn').addEventListener('click', () => {
  alert('MetaMask connection coming soon!');
});

loadAirdropData();
