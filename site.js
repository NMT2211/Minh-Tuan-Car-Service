(function () {
  const root = document.documentElement;
  const header = document.querySelector(".header");
  const toTop = document.querySelector(".to-top");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function ensureResponsiveHeaderControls() {
    if (!header) {
      return {
        nav: null,
        menuToggle: null,
      };
    }

    const navWrap = header.querySelector(".nav-wrap");
    const nav = header.querySelector(".nav");
    if (!navWrap || !nav) {
      return {
        nav,
        menuToggle: null,
      };
    }

    let headerActions = navWrap.querySelector(".header-actions");
    const phoneButton = navWrap.querySelector(".phone-btn");

    if (!headerActions) {
      headerActions = document.createElement("div");
      headerActions.className = "header-actions";

      if (phoneButton) {
        headerActions.appendChild(phoneButton);
      }

      navWrap.insertBefore(headerActions, nav);
    }

    let menuToggle = headerActions.querySelector(".menu-toggle");
    if (!menuToggle) {
      menuToggle = document.createElement("button");
      menuToggle.type = "button";
      menuToggle.className = "menu-toggle";
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Mở menu điều hướng");
      menuToggle.innerHTML = "<span></span><span></span><span></span>";
      headerActions.appendChild(menuToggle);
    }

    if (!nav.id) {
      nav.id = "primary-nav";
    }

    nav.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-controls", nav.id);

    return { nav, menuToggle };
  }

  const { nav: primaryNav, menuToggle } = ensureResponsiveHeaderControls();
  const navLinks = Array.from((primaryNav || document.querySelector(".nav"))?.querySelectorAll("a") || []);
  const heroCarWrap = document.querySelector(".hero-car-wrap");
  const aboutCars = document.querySelector(".about-cars");
  const sectionLinks = navLinks.filter((link) => {
    const href = link.getAttribute("href");
    return href && href.startsWith("#") && href.length > 1 && document.querySelector(href);
  });
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const revealRegistry = new Set();

  function setMenuOpen(nextState) {
    if (!header || !menuToggle || !primaryNav) return;

    const isMobileMenu = window.innerWidth <= 1023;
    const shouldOpen = Boolean(nextState) && isMobileMenu;

    header.classList.toggle("menu-open", shouldOpen);
    document.body.classList.toggle("menu-open", shouldOpen);
    menuToggle.setAttribute("aria-expanded", String(shouldOpen));
    primaryNav.setAttribute("aria-hidden", String(!shouldOpen && isMobileMenu));
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function initMenu() {
    if (!header || !menuToggle || !primaryNav) return;

    menuToggle.addEventListener("click", () => {
      setMenuOpen(!header.classList.contains("menu-open"));
    });

    primaryNav.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (window.innerWidth > 1023) return;
      if (!header.classList.contains("menu-open")) return;
      if (header.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeMenu();
    });
  }

  function setCurrentNav(currentId) {
    navLinks.forEach((link) => {
      if (!link.classList.contains("active")) {
        link.classList.remove("is-current");
      }
    });

    if (!currentId) return;

    const currentLink = sectionLinks.find((link) => link.getAttribute("href") === `#${currentId}`);
    if (currentLink && !currentLink.classList.contains("active")) {
      currentLink.classList.add("is-current");
    }
  }

  function updateHeaderState() {
    const scrolled = window.scrollY > 14;
    if (header) {
      header.classList.toggle("is-scrolled", scrolled);
    }
    if (toTop) {
      toTop.classList.toggle("is-visible", window.scrollY > 320);
    }
  }

  function updateActiveSection() {
    if (!sections.length) return;

    const headerOffset = header ? header.offsetHeight + 56 : 120;
    let currentId = sections[0].id;

    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - headerOffset) {
        currentId = section.id;
      }
    });

    setCurrentNav(currentId);
  }

  function registerReveal(element, options = {}) {
    if (!element || revealRegistry.has(element)) return;

    revealRegistry.add(element);
    element.classList.add("reveal-item");

    if (typeof options.delay === "number") {
      element.style.setProperty("--reveal-delay", `${options.delay}ms`);
    }

    if (options.distance) {
      element.style.setProperty("--reveal-item-distance", options.distance);
    }
  }

  function registerSequence(elements, options = {}) {
    const items = Array.from(elements).filter(Boolean);
    const step = options.step ?? 90;
    const start = options.start ?? 0;

    items.forEach((element, index) => {
      registerReveal(element, {
        delay: start + index * step,
        distance: options.distance,
      });
    });
  }

  function registerGroupedChildren(selector, options = {}) {
    document.querySelectorAll(selector).forEach((group) => {
      registerSequence(Array.from(group.children), options);
    });
  }

  function registerSelectorSequence(selector, options = {}) {
    registerSequence(document.querySelectorAll(selector), options);
  }

  function configureReveals() {
    registerSelectorSequence(".hero-content > .pill, .hero-content > h1, .hero-content > .hero-desc", {
      step: 90,
    });
    registerGroupedChildren(".features", { step: 70 });
    registerGroupedChildren(".hero-actions", { step: 95 });
    registerReveal(document.querySelector(".search-box"), {
      delay: 40,
      distance: "22px",
    });

    registerGroupedChildren(".section-title", { step: 70 });
    registerGroupedChildren(".service-grid", { step: 80 });
    registerSelectorSequence(".area-box > span, .area-box > h2, .area-box > p", {
      step: 70,
    });
    registerGroupedChildren(".chips", { step: 45 });
    registerGroupedChildren(".stats", { step: 70 });
    registerGroupedChildren(".commit-grid", { step: 80 });

    registerSelectorSequence(".about-copy > *", { step: 75 });
    registerReveal(document.querySelector(".brand-image"), {
      delay: 40,
      distance: "22px",
    });
    registerSelectorSequence(".brand-content > .section-mini, .brand-content > h2, .brand-content > p", {
      step: 75,
    });
    registerGroupedChildren(".brand-features", { step: 75 });
    registerSelectorSequence(".numbers-intro > *", { step: 75 });
    registerGroupedChildren(".numbers-cards", { step: 80 });
    registerGroupedChildren(".service-summary-grid", { step: 80 });
    registerGroupedChildren(".fleet-tabs", { step: 65 });
    registerGroupedChildren(".fleet-cards", { step: 90 });
    registerGroupedChildren(".reasons-grid", { step: 65 });
    registerGroupedChildren(".pricing-points", { step: 80 });
    registerGroupedChildren(".faq-grid", { step: 80 });

    registerReveal(document.querySelector(".cta-box > img"), {
      delay: 50,
      distance: "24px",
    });
    registerSelectorSequence(".cta-copy > h2, .cta-copy > p", { step: 75, start: 90 });
    registerGroupedChildren(".cta-actions", { step: 95 });
    registerGroupedChildren(".footer-grid", { step: 85 });
  }

  function isInInitialViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top <= window.innerHeight * 0.88 && rect.bottom >= 0;
  }

  function showReveal(element) {
    if (!element) return;
    element.classList.add("reveal-visible");
  }

  function lockMediaInteractions() {
    document.querySelectorAll("img").forEach((image) => {
      image.setAttribute("draggable", "false");
      image.addEventListener("dragstart", (event) => {
        event.preventDefault();
      });
    });
  }

  function prepareDriveIn(element) {
    if (!element) return;
    element.classList.add("drive-in-ready");
  }

  function activateDriveIn(element, delay = 0) {
    if (!element || element.classList.contains("drive-in-active")) return;
    prepareDriveIn(element);
    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        element.classList.add("drive-in-active");
      });
    }, delay);
  }

  function scheduleDriveIn(element, delay = 0) {
    if (!element) return;
    // Keep drive-in disabled on small screens, but allow it on desktop
    // even when the OS/browser requests reduced motion.
    if (window.innerWidth <= 767) return;

    // Apply the off-screen starting state immediately so the vehicle
    // does not flash in place before the drive-in animation begins.
    prepareDriveIn(element);

    const start = () => activateDriveIn(element, delay);

    if (document.readyState === "complete") {
      start();
      return;
    }

    window.addEventListener("load", start, { once: true });
  }

  function initRevealObserver() {
    configureReveals();

    const revealItems = Array.from(revealRegistry);
    if (!revealItems.length) return;

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(showReveal);
      return;
    }

    root.classList.add("reveal-enabled");
    // Force the hidden state to paint before we reveal items, so the transition is visible.
    document.body.offsetHeight;

    const initialItems = revealItems.filter(isInInitialViewport);
    if (initialItems.length) {
      window.setTimeout(() => {
        initialItems.forEach((item) => {
          window.requestAnimationFrame(() => {
            showReveal(item);
          });
        });
      }, 80);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          window.requestAnimationFrame(() => {
            showReveal(entry.target);
          });
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealItems.forEach((item) => {
      if (!initialItems.includes(item)) {
        observer.observe(item);
      }
    });

    if (typeof reduceMotionQuery.addEventListener === "function") {
      reduceMotionQuery.addEventListener("change", () => {
        updateHeaderState();
      });
    }
  }

  function scrollToHash(hash) {
    if (!hash || hash === "#") {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
      return;
    }

    const target = document.querySelector(hash);
    if (!target) return;

    const headerOffset = header ? header.offsetHeight + 18 : 0;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: targetTop,
      behavior: "auto",
    });
  }

  function initHashNavigation() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute("href");
      const target = href === "#" ? document.body : document.querySelector(href);
      if (!target && href !== "#") return;

      event.preventDefault();
      scrollToHash(href);
      closeMenu();

      if (href && href !== "#") {
        history.replaceState(null, "", href);
      }
    });
  }

  function init() {
    lockMediaInteractions();
    initMenu();
    closeMenu();
    initRevealObserver();
    scheduleDriveIn(heroCarWrap, 140);
    scheduleDriveIn(aboutCars, 180);
    initHashNavigation();
    updateHeaderState();
    updateActiveSection();

    window.addEventListener(
      "scroll",
      () => {
        updateHeaderState();
        updateActiveSection();
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1023) {
        closeMenu();
      }
      updateHeaderState();
      updateActiveSection();
    });
  }

  init();
})();
