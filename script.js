/* ══════════════════════════════════════
   TeachMeBrasil — script.js
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── 0. ALTURA DINÁMICA DEL FOOTER ─── */
    const footer = document.getElementById('main_footer');
    const updateFooterHeight = () => {
        if (!footer) return;
        const altura = footer.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--footer-height', `${altura}px`);
    };
    updateFooterHeight();
    window.addEventListener('resize', updateFooterHeight);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateFooterHeight);
    window.addEventListener('load', updateFooterHeight);
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(updateFooterHeight);
        if (footer) ro.observe(footer);
    }


    /* ─── 1. HEADER scroll ─── */
    const header = document.getElementById('main_header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });


    /* ─── 2. MENÚ HAMBURGUESA ─── */
    const hamburger  = document.getElementById('hamburger');
    const navContent = document.getElementById('nav_content');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navContent.classList.toggle('open');
    });
    navContent.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navContent.classList.remove('open');
        });
    });


    /* ─── 3. SCROLL REVEAL ─── */
    const revealEls = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
    requestAnimationFrame(() => {
        revealEls.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight * 0.9)
                el.classList.add('visible');
        });
    });


    /* ─── 4. CONTADOR ANIMADO ─── */
    const counters = document.querySelectorAll('.numero_valor[data-count]');
    const countObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                animateCounter(e.target);
                countObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => countObserver.observe(c));

    function animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        const start  = performance.now();
        const tick   = now => {
            const p = Math.min((now - start) / 1800, 1);
            el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        };
        requestAnimationFrame(tick);
    }


    /* ─── 5. PARALLAX HERO ─── */
    const heroContent = document.querySelector('.hero_content');
    const heroOverlay = document.querySelector('.hero_overlay');
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
            if (heroContent) {
                heroContent.style.transform = `translateY(${y * 0.25}px)`;
                heroContent.style.opacity   = 1 - y / (window.innerHeight * 0.7);
            }
            if (heroOverlay)
                heroOverlay.style.opacity = 0.75 + (y / window.innerHeight) * 0.2;
        }
    }, { passive: true });


    /* ─── 6. TILT EN LAS TARJETAS DE RAZONES ─── */
    document.querySelectorAll('.razao_card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
            const y = ((e.clientY - r.top)  / r.height - 0.5) * -12;
            card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });


    /* ─── 7. ENLACE ACTIVO DEL MENÚ ─── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav_content a[href^="#"]');
    const activeLinkObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                navLinks.forEach(link => {
                    const active = link.getAttribute('href') === `#${id}`;
                    link.style.color      = active ? 'var(--branco)' : '';
                    link.style.fontWeight = active ? '700' : '';
                });
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => activeLinkObserver.observe(s));


    /* ══════════════════════════════════════════════
       ─── 8. CARRUSEL INFINITO AUTO-SCROLL ───
    ══════════════════════════════════════════════ */

    function initCarousel(trackEl, speed) {
        if (trackEl._carouselRAF) {
            cancelAnimationFrame(trackEl._carouselRAF);
            trackEl._carouselRAF = null;
        }

        const items = Array.from(trackEl.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            trackEl.appendChild(clone);
        });

        let pos     = 0;
        let paused  = false;
        const totalW = () => trackEl.scrollWidth / 2;

        const tick = () => {
            if (!paused) {
                pos += speed;
                if (pos >= totalW()) pos = 0;
                trackEl.style.transform = `translateX(-${pos}px)`;
            }
            trackEl._carouselRAF = requestAnimationFrame(tick);
        };
        trackEl._carouselRAF = requestAnimationFrame(tick);

        const wrapper = trackEl.parentElement;
        if (!wrapper._carouselHoverBound) {
            wrapper.addEventListener('mouseenter', () => { paused = true; });
            wrapper.addEventListener('mouseleave', () => { paused = false; });
            wrapper._carouselHoverBound = true;
        }

        document.addEventListener('visibilitychange', () => {
            paused = document.hidden;
        });
    }

    const razoesGrid = document.querySelector('.razoes_grid');
    if (razoesGrid) initCarousel(razoesGrid, 0.4);

    const depGrid = document.querySelector('.depoimentos_grid');
    if (depGrid) initCarousel(depGrid, 0.35);


    /* ══════════════════════════════════════════════
       ─── 9. COMENTARIOS CON localStorage ───
    ══════════════════════════════════════════════ */

    const STORAGE_KEY = 'tmb_comentarios';

    function loadComments() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveComments(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }

    function buildCard(c) {
        const card = document.createElement('div');
        card.className = 'depoimento_card comentario_usuario';
        card.innerHTML = `
            <div class="depoimento_estrelas">${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)}</div>
            <p class="depoimento_texto">"${escapeHtml(c.texto)}"</p>
            <div class="depoimento_autor">
                <div class="autor_avatar">${getInitials(c.nome)}</div>
                <div>
                    <strong>${escapeHtml(c.nome)}</strong>
                    <span>${escapeHtml(c.pais)} · ${escapeHtml(c.objetivo)}</span>
                </div>
            </div>
        `;
        return card;
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                  .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }

    function getInitials(nome) {
        return String(nome || '').trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
    }

    function renderComments() {
        const grid = document.querySelector('.depoimentos_grid');
        if (!grid) return;

        grid.querySelectorAll('.comentario_usuario').forEach(el => el.remove());

        const comments = loadComments();
        const frag = document.createDocumentFragment();
        comments.forEach(c => frag.prepend(buildCard(c)));
        grid.prepend(frag);
    }

    renderComments();

    const form = document.getElementById('form_comentario');
    if (form) {
        const starsContainer = form.querySelector('.star_input');
        let ratingValue = 5;

        if (starsContainer) {
            starsContainer.querySelectorAll('span').forEach(star => {
                star.addEventListener('mouseover', () => {
                    const v = parseInt(star.dataset.value);
                    starsContainer.querySelectorAll('span').forEach(s => {
                        s.textContent = parseInt(s.dataset.value) <= v ? '★' : '☆';
                    });
                });
                star.addEventListener('mouseleave', () => {
                    starsContainer.querySelectorAll('span').forEach(s => {
                        s.textContent = parseInt(s.dataset.value) <= ratingValue ? '★' : '☆';
                    });
                });
                star.addEventListener('click', () => {
                    ratingValue = parseInt(star.dataset.value);
                    starsContainer.querySelectorAll('span').forEach(s => {
                        s.textContent = parseInt(s.dataset.value) <= ratingValue ? '★' : '☆';
                    });
                });
            });
        }

        const textarea = form.querySelector('#c_texto');
        const charCount = form.querySelector('.char_count');
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                const len = textarea.value.length;
                charCount.textContent = `${len} / 400`;
                charCount.className = 'char_count' +
                    (len >= 400 ? ' limite' : len >= 340 ? ' quase' : '');
            });
        }

        form.addEventListener('submit', e => {
            e.preventDefault();
            const nome    = form.querySelector('#c_nome').value.trim();
            const pais    = form.querySelector('#c_pais').value.trim();
            const objetivo= form.querySelector('#c_objetivo').value.trim();
            const texto   = form.querySelector('#c_texto').value.trim();

            if (!nome || !texto) return;

            const novo = { nome, pais, objetivo, texto, rating: ratingValue,
                           ts: Date.now() };
            const todos = loadComments();
            todos.unshift(novo);
            saveComments(todos);

            const msg = form.querySelector('.form_sucesso');
            if (msg) {
                msg.style.display = 'flex';
                setTimeout(() => { msg.style.display = 'none'; }, 3500);
            }

            form.reset();
            ratingValue = 5;
            if (starsContainer)
                starsContainer.querySelectorAll('span').forEach(s => { s.textContent = '★'; });
            if (charCount) {
                charCount.textContent = '0 / 400';
                charCount.className = 'char_count';
            }

            const grid = document.querySelector('.depoimentos_grid');
            if (grid) {
                grid.querySelectorAll('[aria-hidden="true"]').forEach(el => el.remove());
                renderComments();
                initCarousel(grid, 0.35);
            }
        });
    }

});