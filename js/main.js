// Loading Screen
window.addEventListener('load', function() {
    var loader = document.getElementById('loader');
    if (loader) {
        setTimeout(function() {
            loader.classList.add('loaded');
            document.body.classList.add('page-ready');
        }, 800);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Page ready class for initial animations (if loader already hidden)
    if (!document.getElementById('loader')) {
        document.body.classList.add('page-ready');
    }
    var menuToggle = document.getElementById('menu-toggle');
    var mainNav = document.getElementById('main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            var isOpen = mainNav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    // Theme toggle with persistence
    var themeSwitch = document.getElementById('theme-switch');
    var root = document.documentElement;
    var storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        root.setAttribute('data-theme', storedTheme);
        if (themeSwitch) themeSwitch.checked = storedTheme === 'dark';
    } else {
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            root.setAttribute('data-theme', 'dark');
            if (themeSwitch) themeSwitch.checked = true;
        }
    }

    if (themeSwitch) {
        themeSwitch.addEventListener('change', function () {
            var next = themeSwitch.checked ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }

    // Enhanced form validation and submission
    var form = document.getElementById('contact-form');
    var statusEl = document.getElementById('form-status');
    if (form && statusEl) {
        // Input sanitization function
        function sanitizeInput(str) {
            return str.replace(/[<>]/g, '').trim();
        }
        
        // Real-time validation
        var inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                var value = sanitizeInput(input.value);
                if (input.required && !value) {
                    input.style.borderColor = '#ff4444';
                } else if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    input.style.borderColor = '#ff4444';
                } else {
                    input.style.borderColor = '';
                }
            });
            input.addEventListener('input', function() {
                input.style.borderColor = '';
            });
        });
        
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            // Validate inputs
            var name = sanitizeInput(form.querySelector('[name="name"]').value);
            var email = sanitizeInput(form.querySelector('[name="email"]').value);
            var message = sanitizeInput(form.querySelector('[name="message"]').value);
            
            if (!name || !email || !message) {
                statusEl.style.display = 'block';
                statusEl.textContent = 'Veuillez remplir tous les champs.';
                statusEl.style.color = '#ff4444';
                return;
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                statusEl.style.display = 'block';
                statusEl.textContent = 'Veuillez entrer une adresse email valide.';
                statusEl.style.color = '#ff4444';
                return;
            }
            
            statusEl.style.display = 'block';
            statusEl.style.color = '';
            statusEl.textContent = 'Envoi en cours…';

            try {
                var formData = new FormData(form);
                var action = form.getAttribute('action');
                var res = await fetch(action, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });

                if (res.ok) {
                    statusEl.textContent = '✓ Merci ! Votre message a été envoyé.';
                    statusEl.style.color = '#4caf50';
                    form.reset();
                } else {
                    statusEl.textContent = '✗ Désolé, une erreur est survenue. Réessayez.';
                    statusEl.style.color = '#ff4444';
                }
            } catch (err) {
                statusEl.textContent = '✗ Impossible de contacter le serveur. Vérifiez votre connexion.';
                statusEl.style.color = '#ff4444';
            }
        });
    }
    
    // Smooth scroll enhancement
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    var offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Scroll reveal animations
    var revealTargets = document.querySelectorAll('.reveal, .reveal-child');
    if ('IntersectionObserver' in window && revealTargets.length) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealTargets.forEach(function (el) { io.observe(el); });
    } else {
        // Fallback: show immediately
        revealTargets.forEach(function (el) { el.classList.add('in-view'); });
    }

    // Particles background for hero
    var particlesCanvas = document.getElementById('particles-canvas');
    if (particlesCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var ctx = particlesCanvas.getContext('2d');
        var particles = [];
        var DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
        var lastTime = 0;

        function sizeCanvas() {
            var rect = particlesCanvas.getBoundingClientRect();
            particlesCanvas.width = Math.floor(rect.width * DPR);
            particlesCanvas.height = Math.floor(rect.height * DPR);
            ctx.scale(DPR, DPR);
        }

        function getAccentColor() {
            var cs = getComputedStyle(document.documentElement);
            return cs.getPropertyValue('--accent').trim() || '#ffd166';
        }

        function hexToRgba(hex, alpha) {
            var c = hex.replace('#','');
            if (c.length === 3) c = c.split('').map(function(x){return x+x;}).join('');
            var r = parseInt(c.substr(0,2),16);
            var g = parseInt(c.substr(2,2),16);
            var b = parseInt(c.substr(4,2),16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
        }

        function initParticles() {
            particles = [];
            var rect = particlesCanvas.getBoundingClientRect();
            var area = rect.width * rect.height;
            var count = Math.max(80, Math.min(200, Math.floor(area / 5000)));
            var color = getAccentColor();
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * rect.width,
                    y: Math.random() * rect.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: 1 + Math.random() * 2.5,
                    a: 0.15 + Math.random() * 0.25,
                    color: color
                });
            }
        }

        function step(ts) {
            var rect = particlesCanvas.getBoundingClientRect();
            if (!lastTime) lastTime = ts;
            var dt = Math.min(32, ts - lastTime);
            lastTime = ts;

            ctx.clearRect(0, 0, rect.width, rect.height);
            var accent = getAccentColor();
            
            // Draw connections first
            ctx.strokeStyle = hexToRgba(accent, 0.15);
            ctx.lineWidth = 1;
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        var opacity = (1 - dist / 120) * 0.15;
                        ctx.strokeStyle = hexToRgba(accent, opacity);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            // Draw particles
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx * dt * 0.06;
                p.y += p.vy * dt * 0.06;
                if (p.x < -10) p.x = rect.width + 10; if (p.x > rect.width + 10) p.x = -10;
                if (p.y < -10) p.y = rect.height + 10; if (p.y > rect.height + 10) p.y = -10;
                ctx.beginPath();
                ctx.fillStyle = hexToRgba(accent, p.a);
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(step);
        }

        function onResize() {
            sizeCanvas();
            initParticles();
        }

        sizeCanvas();
        initParticles();
        requestAnimationFrame(step);
        window.addEventListener('resize', onResize);
    }
});
