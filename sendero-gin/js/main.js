/* ============================================================
   SENDERO GIN PREMIUM — main.js
   ============================================================ */

'use strict';

/* ── Age Gate ── */
(function () {
  const gate    = document.getElementById('age-gate');
  const btnYes  = document.getElementById('age-yes');
  const btnNo   = document.getElementById('age-no');
  const btnBack = document.getElementById('age-back');
  const main    = document.getElementById('ageMain');
  const denied  = document.getElementById('ageDenied');

  if (!gate) return;

  if (sessionStorage.getItem('sendero-age-ok')) {
    gate.classList.add('hidden');
    document.body.style.overflow = '';
    return;
  }

  document.body.style.overflow = 'hidden';

  btnYes.addEventListener('click', () => {
    sessionStorage.setItem('sendero-age-ok', '1');
    gate.classList.add('hidden');
    document.body.style.overflow = '';
    initHero();
  });

  // Menor de edad: no lo saca del sitio, muestra el panel bloqueado
  btnNo.addEventListener('click', () => {
    main.hidden = true;
    denied.hidden = false;
  });

  // Por si se equivocó: vuelve a la elección
  btnBack.addEventListener('click', () => {
    denied.hidden = true;
    main.hidden = false;
  });
})();

/* ── Scroll Progress Bar ── */
(function () {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const docH   = document.documentElement.scrollHeight - window.innerHeight;
    const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

/* ── Navbar ── */
(function () {
  const nav  = document.getElementById('navbar');
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (ham && menu) {
    ham.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      ham.classList.toggle('open', isOpen);
      ham.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    menu.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        ham.classList.remove('open');
        ham.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
})();

/* ── Hero Image Load ── */
function initHero() {
  const hero = document.querySelector('.hero');
  if (hero) hero.classList.add('loaded');
}

window.addEventListener('load', () => {
  if (sessionStorage.getItem('sendero-age-ok')) initHero();
});

/* ── Scroll Reveal (Intersection Observer) ── */
(function () {
  const targets = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .reveal-stagger'
  );
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* ── Count-up Animation ── */
(function () {
  const counters = document.querySelectorAll('.count');
  if (!counters.length) return;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOutQuart(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ── Smooth Scroll for anchor links ── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id  = a.getAttribute('href');
      if (id === '#') return;
      const el  = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const offset = document.getElementById('navbar')?.offsetHeight ?? 80;
      const top    = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── Contact Form (FormSubmit AJAX) ── */
(function () {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const errorEl = document.getElementById('formError');
  if (!form) return;

  const ENDPOINT = 'https://formsubmit.co/ajax/1d67d775e00b66cc9e39b44c87b1a8bb';
  const TESTING  = window.TESTING ?? false;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setFieldError(inputEl, errorEl, msg) {
    const errorClass = inputEl.tagName === 'TEXTAREA'
      ? 'form__textarea--error'
      : 'form__input--error';
    if (msg) {
      inputEl.classList.add(errorClass);
      errorEl.textContent = msg;
      errorEl.classList.add('visible');
    } else {
      inputEl.classList.remove(errorClass);
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  function validate(nombreEl, emailEl, mensajeEl) {
    const nombreErr  = document.getElementById('nombreError');
    const emailErr   = document.getElementById('emailError');
    const mensajeErr = document.getElementById('mensajeError');

    let ok = true;

    const nombre = nombreEl.value.trim();
    if (!nombre) {
      setFieldError(nombreEl, nombreErr, 'El nombre es obligatorio.');
      ok = false;
    } else if (nombre.length < 2) {
      setFieldError(nombreEl, nombreErr, 'Ingresá al menos 2 caracteres.');
      ok = false;
    } else {
      setFieldError(nombreEl, nombreErr, '');
    }

    const email = emailEl.value.trim();
    if (!email) {
      setFieldError(emailEl, emailErr, 'El email es obligatorio.');
      ok = false;
    } else if (!EMAIL_RE.test(email)) {
      setFieldError(emailEl, emailErr, 'Ingresá un email válido.');
      ok = false;
    } else {
      setFieldError(emailEl, emailErr, '');
    }

    // Comentario opcional: solo se valida si escribieron algo
    const mensaje = mensajeEl.value.trim();
    if (mensaje && mensaje.length < 5) {
      setFieldError(mensajeEl, mensajeErr, 'Contanos un poco más o dejalo vacío.');
      ok = false;
    } else {
      setFieldError(mensajeEl, mensajeErr, '');
    }

    return ok;
  }

  const nombreEl  = form.querySelector('#nombre');
  const emailEl   = form.querySelector('#email');
  const mensajeEl = form.querySelector('#mensaje');

  // Clear field error as soon as the user starts correcting it
  [nombreEl, emailEl, mensajeEl].forEach(el => {
    el.addEventListener('input', () => {
      const errEl = document.getElementById(el.id + 'Error');
      if (errEl) setFieldError(el, errEl, '');
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validate(nombreEl, emailEl, mensajeEl)) return;

    const submitBtn = form.querySelector('.form__submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    success?.classList.remove('visible');
    errorEl?.classList.remove('visible');

    try {
      if (!TESTING) {
        const fd   = new FormData(form);
        const res  = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: fd
        });
        const data = await res.json().catch(() => ({}));
        console.log('[FormSubmit]', res.status, data);
        if (!res.ok) throw new Error('Bad response ' + res.status);
      }

      form.reset();
      if (success) success.classList.add('visible');
      setTimeout(() => success?.classList.remove('visible'), 8000);
    } catch (err) {
      console.error('[FormSubmit error]', err);
      if (errorEl) errorEl.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Mensaje';
    }
  });
})();

/* ── Parallax on Hero (subtle) ── */
(function () {
  const img = document.querySelector('.hero__image');
  if (!img || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        img.style.transform = `scale(1) translateY(${scrollY * 0.18}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ── Active nav link on scroll ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.navbar__link');
  if (!sections.length || !links.length) return;

  const navH = document.getElementById('navbar')?.offsetHeight ?? 80;

  function setActive() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - navH - 10) {
        current = sec.getAttribute('id');
      }
    });
    links.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.style.color = href === current ? 'var(--beige)' : '';
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();

/* ── Dynamic footer year ── */
(function () {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
