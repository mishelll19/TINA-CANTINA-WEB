document.addEventListener('DOMContentLoaded', () => {
 
  /* ---------- LOADER ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    // Pequeño margen para que la animación no se sienta abrupta
    setTimeout(() => loader.classList.add('is-hidden'), 500);
  });
  // Fallback por si el evento load tarda (recursos externos lentos)
  setTimeout(() => loader.classList.add('is-hidden'), 3500);
 
  /* ---------- NAVBAR: cambia de apariencia al hacer scroll ---------- */
  const navbar = document.getElementById('navbar');
  const toggleScrolledClass = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  toggleScrolledClass();
  window.addEventListener('scroll', toggleScrolledClass, { passive: true });
 
  /* ---------- MENÚ MÓVIL ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
 
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
 
  // Cierra el menú móvil al elegir un enlace
  document.querySelectorAll('.nav-link, .navbar__cta').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
 
  /* ---------- ENLACE ACTIVO SEGÚN LA SECCIÓN VISIBLE (One Page) ---------- */
  // Sitio de una sola página: el enlace del menú se marca como activo según
  // la sección que esté visible en el viewport mientras el usuario hace scroll.
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionIds = Array.from(navLinks)
    .map(link => link.getAttribute('href'))
    .filter(href => href && href.startsWith('#'))
    .map(href => href.slice(1));

  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const setActiveLinkByHash = (hash) => {
    navLinks.forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === hash);
    });
  };

  if (sections.length) {
    if ('IntersectionObserver' in window) {
      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveLinkByHash(`#${entry.target.id}`);
          }
        });
      }, { rootMargin: '0px 0px -60% 0px', threshold: 0 });

      sections.forEach(section => navObserver.observe(section));
    }

    // Estado inicial al cargar la página (respeta el hash de la URL si existe)
    setActiveLinkByHash(window.location.hash || '#inicio');
  }

  /* ---------- MARCA EL ENLACE ACTIVO AL HACER CLIC (respuesta instantánea) ---------- */
  // El desplazamiento suave lo maneja el CSS (scroll-behavior: smooth y
  // scroll-padding-top definidos en estilos.css); aquí solo sincronizamos
  // el estado visual del menú apenas el usuario elige una sección.
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        setActiveLinkByHash(href);
      }
    });
  });
 
  /* ---------- REVEAL ON SCROLL (Fade/Slide/Zoom) ---------- */
  const revealTargets = document.querySelectorAll(
    '.fade-in, .reveal-up, .reveal-left, .reveal-right, .reveal-zoom'
  );
 
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
 
    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback sin soporte de IntersectionObserver
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }
 
  /* ---------- CONTADOR DE ESTADÍSTICAS (Historia) ---------- */
  const statNumbers = document.querySelectorAll('.stat__number');
 
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1400;
    const startTime = performance.now();
 
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
 
  if ('IntersectionObserver' in window && statNumbers.length) {
    const statObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
 
    statNumbers.forEach(el => statObserver.observe(el));
  }
 
  /* ---------- TABS DEL MENÚ (y de Bebidas) ----------
     Cada bloque ".menu-tabs" + ".menu-panels" (hermano inmediato) forma un
     grupo independiente. Así, la sección Menú y la sección Bebidas pueden
     convivir en la misma página sin que cambiar de pestaña en una afecte
     a la otra. El comportamiento para una página con un solo grupo de tabs
     es exactamente el mismo que antes. */
  document.querySelectorAll('.menu-tabs').forEach(tabsGroup => {
    const panelsGroup = tabsGroup.nextElementSibling;
    if (!panelsGroup || !panelsGroup.classList.contains('menu-panels')) return;

    const groupTabs = tabsGroup.querySelectorAll('.menu-tab');
    const groupPanels = panelsGroup.querySelectorAll('.menu-panel');

    groupTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;

        groupTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        groupPanels.forEach(panel => {
          const isTarget = panel.id === targetId;
          panel.classList.toggle('active', isTarget);
          panel.hidden = !isTarget;
        });
      });
    });
  });
 
  /* ---------- PARALLAX SUTIL EN EL HERO ---------- */
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY;
      if (offset < window.innerHeight) {
        heroBg.style.transform = `translateY(${offset * 0.35}px) scale(1.05)`;
      }
    }, { passive: true });
  }
 
  /* ---------- BOTÓN VOLVER ARRIBA ---------- */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
 
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
 
  /* ---------- AÑO DINÁMICO EN EL FOOTER ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
 
  /* ---------- LLUVIA DE GALLITOS (solo página principal) ----------
     Se ejecuta únicamente al cargar o recargar index.html: el contenedor
     #lluviaGallos solo existe en esa página, así que en el resto del sitio
     este bloque no hace nada. Genera entre 25 y 40 gallitos con tamaño,
     velocidad, duración y posición horizontal aleatorios, y los elimina
     del DOM al terminar su caída para no dejar nodos residuales. */
  const lluviaGallos = document.getElementById('lluviaGallos');
  const prefersReducedMotionGallos = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (lluviaGallos && !prefersReducedMotionGallos) {
    const GALLITO_IMAGES = [
      'imagenes/gallitos/gallito-gold.png',
      'imagenes/gallitos/gallito-wine.png',
      'imagenes/gallitos/gallito-teal.png',
      'imagenes/gallitos/gallito-magenta.png',
    ];

    const TOTAL_GALLITOS = Math.floor(Math.random() * (40 - 25 + 1)) + 25; // entre 25 y 40

    for (let i = 0; i < TOTAL_GALLITOS; i++) {
      const gallito = document.createElement('img');
      gallito.className = 'gallito';
      gallito.src = GALLITO_IMAGES[Math.floor(Math.random() * GALLITO_IMAGES.length)];
      gallito.alt = '';
      gallito.setAttribute('aria-hidden', 'true');

      const size = Math.random() * (46 - 20) + 20; // tamaño entre 20 y 46px
      const duration = Math.random() * (7 - 3.5) + 3.5; // duración entre 3.5s y 7s
      const delay = Math.random() * 1.4; // pequeño escalonado de entrada
      const leftPos = Math.random() * 100; // posición horizontal aleatoria (0-100%)
      const flip = Math.random() < 0.5 ? -1 : 1; // variación de orientación

      gallito.style.left = `${leftPos}vw`;
      gallito.style.width = `${size}px`;
      gallito.style.height = 'auto';
      gallito.style.animationDuration = `${duration}s`;
      gallito.style.animationDelay = `${delay}s`;
      gallito.style.transform = `scaleX(${flip})`;

      // Elimina cada gallito del DOM en cuanto termina su propia animación
      gallito.addEventListener('animationend', () => gallito.remove());

      lluviaGallos.appendChild(gallito);
    }

    // Red de seguridad: si por algún motivo 'animationend' no dispara en
    // algún elemento, se limpia el contenedor completo poco después de que
    // el gallito más lento debería haber terminado.
    setTimeout(() => {
      lluviaGallos.innerHTML = '';
    }, 9000);
  }

  /* ---------- MICROINTERACCIONES PREMIUM (v2 rediseño) ----------
     Bloque añadido sin modificar la lógica anterior: tilt 3D suave en
     tarjetas y efecto "magnético" en botones. Se desactiva en pantallas
     táctiles y para personas que prefieren menos movimiento. */
  const prefersFinePointer = window.matchMedia('(pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  if (prefersFinePointer && !prefersReducedMotion) {
 
    // Tilt 3D sutil en tarjetas (pilares y especialidades)
    const tiltCards = document.querySelectorAll('.pillar-card, .spec-card');
    tiltCards.forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
 
    // Efecto magnético leve en botones sólidos
    const magneticButtons = document.querySelectorAll('.btn--wine, .btn--gold, .btn--teal');
    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.25}px) translateY(-4px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
 
});
 
 
/* ==========================================================================
   TINA CANTINA — gallery.js
   Lightbox de la galería: apertura, navegación, cierre y accesibilidad
   ========================================================================== */
 
document.addEventListener('DOMContentLoaded', () => {
 
  const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
 
  if (!galleryItems.length || !lightbox) return;
 
  let currentIndex = 0;
 
  const openLightbox = (index) => {
    currentIndex = index;
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img').alt || '';
    lightboxCaption.textContent = item.dataset.caption || '';
 
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
 
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
 
  const showImage = (step) => {
    currentIndex = (currentIndex + step + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img').alt || '';
    lightboxCaption.textContent = item.dataset.caption || '';
  };
 
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
 
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => showImage(-1));
  nextBtn.addEventListener('click', () => showImage(1));
 
  // Cerrar al hacer click fuera de la imagen
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
 
  // Navegación por teclado
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
 
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showImage(1);
    if (e.key === 'ArrowLeft') showImage(-1);
  });
 
});

  // Lluvia de gallitos al entrar a la página
  lluviaDeGallos();
 
function lluviaDeGallos(cantidad = 24, duracionTotal = 4500) {
  const contenedor = document.createElement('div');
  contenedor.className = 'lluvia-gallos';
  contenedor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(contenedor);
 
  for (let i = 0; i < cantidad; i++) {
    setTimeout(() => {
      const gallito = document.createElement('span');
      gallito.className = 'gallito';
      gallito.textContent = '🐓';
      gallito.style.left = Math.random() * 100 + 'vw';
      gallito.style.fontSize = (1.3 + Math.random() * 1.4) + 'rem';
      gallito.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      contenedor.appendChild(gallito);
      gallito.addEventListener('animationend', () => gallito.remove());
    }, (duracionTotal / cantidad) * i);
  }
 
  setTimeout(() => contenedor.remove(), duracionTotal + 4000);
}
