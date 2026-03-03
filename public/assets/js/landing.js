document.addEventListener('DOMContentLoaded', () => {

    /* ══════════════════════════════════════════════════════
       COUNTDOWN TIMER
    ══════════════════════════════════════════════════════ */
    const countdownElement = document.getElementById('countdown-timer');
    let timeLeft = 2 * 60 * 60 + 59 * 60 + 43;

    const updateTimer = () => {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        countdownElement.innerText =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        if (timeLeft > 0) timeLeft--;
        else clearInterval(timerInterval);
    };
    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    /* ══════════════════════════════════════════════════════
       MODAL
    ══════════════════════════════════════════════════════ */
    const openModalBtns = document.querySelectorAll('.open-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalOverlay = document.querySelector('.modal-overlay');

    const openModal = () => {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    openModalBtns.forEach(btn => btn.addEventListener('click', e => {
        e.preventDefault();
        openModal();
    }));
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });

    /* ══════════════════════════════════════════════════════
       FORM SUBMISSION
    ══════════════════════════════════════════════════════ */
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = orderForm.querySelector('.btn-confirm');
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ جاري التأكيد...';

        const formData = {
            name: document.getElementById('full-name').value,
            phone: document.getElementById('phone-number').value,
            governorate: document.getElementById('governorate').value,
            address: document.getElementById('address').value,
            quantity: document.getElementById('quantity').value
        };

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                showSuccessMessage();
                closeModal();
                orderForm.reset();
            } else {
                alert('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('خطأ في الاتصال بالخادم.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = '✅ تأكيد الطلب';
        }
    });

    function showSuccessMessage() {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(100px);
            background:linear-gradient(135deg,#0d0d28,#1a0a3e);
            border:1px solid rgba(255,215,0,0.3); border-radius:16px;
            padding:20px 36px; color:#ffd700; font-size:1.05rem; font-weight:600;
            box-shadow:0 20px 60px rgba(255,215,0,0.15), 0 0 0 1px rgba(255,215,0,0.08);
            z-index:99999; transition:transform 0.5s cubic-bezier(.175,.885,.32,1.275), opacity 0.4s ease;
            opacity:0; text-align:center; font-family:'Tajawal',sans-serif;
        `;
        toast.innerHTML = '🌙 تم استلام طلبك بنجاح!<br><small style="color:#a0a4b8;font-size:0.85rem;">سنتواصل معك قريباً ✨</small>';
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    /* ══════════════════════════════════════════════════════
       AOS — SCROLL REVEAL WITH STAGGER
    ══════════════════════════════════════════════════════ */
    const aosElements = document.querySelectorAll('[data-aos]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger sibling elements slightly
                const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-aos]'));
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, idx * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    aosElements.forEach(el => observer.observe(el));

    /* ══════════════════════════════════════════════════════
       RIPPLE EFFECT on CTA Buttons
    ══════════════════════════════════════════════════════ */
    document.querySelectorAll('.cta-main, .nav-cta, .btn-confirm, .btn-black').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position:absolute; border-radius:50%; pointer-events:none;
                width:10px; height:10px; top:${y - 5}px; left:${x - 5}px;
                background:rgba(255,255,255,0.45);
                transform:scale(0); animation:rippleAnim 0.6s ease-out forwards;
            `;
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    });

    // Inject ripple keyframe dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleAnim {
            to { transform: scale(30); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    /* ══════════════════════════════════════════════════════
       MAGNETIC HOVER on hero CTA
    ══════════════════════════════════════════════════════ */
    const magneticBtn = document.querySelector('.cta-main');
    if (magneticBtn) {
        magneticBtn.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
            this.style.transform = `translate(${x}px, ${y}px) translateY(-4px) scale(1.03)`;
        });
        magneticBtn.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    }

    /* ══════════════════════════════════════════════════════
       NAVBAR SCROLL EFFECT
    ══════════════════════════════════════════════════════ */
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.style.background = 'rgba(4,4,15,0.92)';
            nav.style.boxShadow = '0 4px 30px rgba(255,215,0,0.08)';
        } else {
            nav.style.background = 'rgba(4,4,15,0.75)';
            nav.style.boxShadow = 'none';
        }
    }, { passive: true });

    /* ══════════════════════════════════════════════════════
       PARALLAX STARS on mouse move
    ══════════════════════════════════════════════════════ */
    const starsLayer = document.querySelector('.stars-layer');
    if (starsLayer) {
        document.addEventListener('mousemove', e => {
            const xRatio = (e.clientX / window.innerWidth - 0.5) * 20;
            const yRatio = (e.clientY / window.innerHeight - 0.5) * 20;
            starsLayer.style.transform = `translate(${xRatio * 0.3}px, ${yRatio * 0.3}px)`;
        }, { passive: true });
    }

});
