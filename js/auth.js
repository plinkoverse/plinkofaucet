// Auth System Logic

class AuthSystem {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('plink_user')) || null;
        this.modal = document.getElementById('auth-modal');
        this.captchaCode = '';
        
        this.init();
    }

    init() {
        this.updateUI();
        this.setupListeners();
        
        // Auto-show login if strictly required, but for now it's optional
    }

    setupListeners() {
        // Modal Toggles
        document.querySelectorAll('.open-auth').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('login');
            });
        });

        const closeBtn = document.getElementById('close-auth');
        if(closeBtn) closeBtn.addEventListener('click', () => this.hideModal());

        // Forms
        const loginForm = document.getElementById('login-form');
        if(loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        const registerForm = document.getElementById('register-form');
        if(registerForm) registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        const kycForm = document.getElementById('kyc-form');
        if(kycForm) kycForm.addEventListener('submit', (e) => this.handleKYC(e));

        // Switchers
        document.getElementById('to-register')?.addEventListener('click', () => this.switchView('register'));
        document.getElementById('to-login')?.addEventListener('click', () => this.switchView('login'));
        
        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());

        // Captcha Refresh
        document.getElementById('captcha-canvas')?.addEventListener('click', () => this.drawCaptcha());
    }

    showModal(view) {
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.switchView(view);
            this.drawCaptcha();
        }
    }

    hideModal() {
        if (this.modal) this.modal.style.display = 'none';
    }

    switchView(view) {
        document.querySelectorAll('.auth-view').forEach(el => el.style.display = 'none');
        document.getElementById(`view-${view}`).style.display = 'block';
    }

    drawCaptcha() {
        const canvas = document.getElementById('captcha-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Generate Code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        this.captchaCode = '';
        for(let i=0; i<6; i++) this.captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));

        // Background
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Noise
        for(let i=0; i<50; i++) {
            ctx.strokeStyle = `rgba(0, 210, 255, ${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        // Text
        ctx.font = 'bold 24px Courier New';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Jitter text
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate((Math.random()-0.5) * 0.2);
        ctx.fillText(this.captchaCode, 0, 0);
        ctx.restore();
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        const captcha = document.getElementById('login-captcha').value;

        if (captcha.toUpperCase() !== this.captchaCode) {
            alert("Invalid CAPTCHA");
            this.drawCaptcha();
            return;
        }

        // Simulate 2FA
        const code = Math.floor(100000 + Math.random() * 900000);
        const userCode = prompt(`[MOCK EMAIL 2FA] Your code is: ${code}\nEnter code to verify:`);
        
        if (userCode !== String(code)) {
            alert("Invalid 2FA Code");
            return;
        }

        // Mock Login Success
        this.user = {
            email: email,
            kycStatus: 'unverified',
            id: 'PLINK-' + Math.floor(Math.random()*1000000)
        };
        this.saveUser();
        this.hideModal();
        alert("Login Successful!");
    }

    handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        
        // Mock Register
        this.user = {
            email: email,
            kycStatus: 'unverified',
            id: 'PLINK-' + Math.floor(Math.random()*1000000)
        };
        this.saveUser();
        this.hideModal();
        alert("Registration Successful! Please complete KYC in your profile.");
        window.location.href = 'profile.html';
    }

    handleKYC(e) {
        e.preventDefault();
        // Simulate upload
        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Verifying...";
        btn.disabled = true;

        setTimeout(() => {
            this.user.kycStatus = 'verified';
            this.saveUser();
            alert("KYC Documents Verified Successfully!");
            window.location.reload();
        }, 2000);
    }

    saveUser() {
        localStorage.setItem('plink_user', JSON.stringify(this.user));
        this.updateUI();
    }

    logout() {
        this.user = null;
        localStorage.removeItem('plink_user');
        window.location.href = 'index.html';
    }

    updateUI() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        // Check if profile link exists
        let profileLink = document.getElementById('nav-profile');
        
        if (this.user) {
            if (!profileLink) {
                const a = document.createElement('a');
                a.id = 'nav-profile';
                a.href = 'profile.html';
                a.className = 'nav-link';
                a.innerText = 'PROFILE';
                a.style.color = 'var(--accent)';
                nav.appendChild(a);
            }
            
            // Hide login buttons if any (though we used a generic class)
            document.querySelectorAll('.auth-only-guest').forEach(el => el.style.display = 'none');
        } else {
            if (profileLink) profileLink.remove();
            document.querySelectorAll('.auth-only-guest').forEach(el => el.style.display = 'block');
        }
    }
}

// Init
const auth = new AuthSystem();
