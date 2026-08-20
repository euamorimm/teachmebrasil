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
       Funciona para .razoes_grid y .depoimentos_grid:
       duplica los elementos para crear un loop continuo
       y anima vía CSS transform, pausando al pasar el mouse.

       NOTA: se guarda el rafId en el propio elemento
       (trackEl._carouselRAF) para poder cancelarlo antes
       de reiniciar el carrusel — evita que dos loops de
       animación corran a la vez sobre el mismo elemento
       cuando se agrega un nuevo comentario (esto causaba
       que el carrusel de testimonios "temblara").
    ══════════════════════════════════════════════ */

    function initCarousel(trackEl, speed) {
        // Si ya había un loop de animación corriendo en este elemento, se cancela
        if (trackEl._carouselRAF) {
            cancelAnimationFrame(trackEl._carouselRAF);
            trackEl._carouselRAF = null;
        }

        // Duplica los hijos para crear el efecto de loop
        const items = Array.from(trackEl.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            trackEl.appendChild(clone);
        });

        let pos     = 0;
        let paused  = false;
        const totalW = () => trackEl.scrollWidth / 2; // la mitad = original

        const tick = () => {
            if (!paused) {
                pos += speed;
                if (pos >= totalW()) pos = 0; // reinicia sin salto
                trackEl.style.transform = `translateX(-${pos}px)`;
            }
            trackEl._carouselRAF = requestAnimationFrame(tick);
        };
        trackEl._carouselRAF = requestAnimationFrame(tick);

        // Pausa al pasar el mouse (solo se agrega el listener una vez)
        const wrapper = trackEl.parentElement;
        if (!wrapper._carouselHoverBound) {
            wrapper.addEventListener('mouseenter', () => { paused = true; });
            wrapper.addEventListener('mouseleave', () => { paused = false; });
            wrapper._carouselHoverBound = true;
        }

        // Pausa si la pestaña no está visible (ahorra CPU)
        document.addEventListener('visibilitychange', () => {
            paused = document.hidden;
        });
    }

    // Razones: velocidad 0.4 px/frame (~24px/s a 60fps)
    const razoesGrid = document.querySelector('.razoes_grid');
    if (razoesGrid) initCarousel(razoesGrid, 0.4);

    // Testimonios: velocidad 0.35 px/frame (un poco más lento)
    const depGrid = document.querySelector('.depoimentos_grid');
    if (depGrid) initCarousel(depGrid, 0.35);


    /* ══════════════════════════════════════════════
       ─── 9. COMENTARIOS CON localStorage ───
       Formulario de nuevo comentario + renderización
       de los comentarios guardados en la grilla de
       testimonios.
    ══════════════════════════════════════════════ */

    const STORAGE_KEY = 'tmb_comentarios';

    // ── Carga los comentarios guardados
    function loadComments() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    // ── Guarda el arreglo en localStorage
    function saveComments(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }

    // ── Crea el HTML de una tarjeta de testimonio
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

    // ── Inyecta los comentarios guardados en la grilla (ANTES de los clones del carrusel)
    function renderComments() {
        const grid = document.querySelector('.depoimentos_grid');
        if (!grid) return;

        // Elimina tarjetas de usuario anteriores (para no duplicar al re-renderizar)
        grid.querySelectorAll('.comentario_usuario').forEach(el => el.remove());

        // Inserta al comienzo de la grilla
        const comments = loadComments();
        const frag = document.createDocumentFragment();
        comments.forEach(c => frag.prepend(buildCard(c)));
        grid.prepend(frag);
    }

    renderComments();

    // ── Formulario de nuevo comentario
    const form = document.getElementById('form_comentario');
    if (form) {
        // Renderización de las estrellas interactivas
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

        // Contador de caracteres del textarea
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
            todos.unshift(novo); // el más reciente primero
            saveComments(todos);

            // Muestra el mensaje de éxito
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

            // Vuelve a renderizar y reinicializa el carrusel de testimonios
            // (hay que reiniciarlo porque se agregaron nodos nuevos)
            const grid = document.querySelector('.depoimentos_grid');
            if (grid) {
                // Elimina los clones antiguos
                grid.querySelectorAll('[aria-hidden="true"]').forEach(el => el.remove());
                renderComments();
                // Reinicializa el carrusel con los elementos nuevos
                // (initCarousel ya cancela el loop anterior por sí mismo)
                initCarousel(grid, 0.35);
            }
        });
    }

});