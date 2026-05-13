(function () {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".header");
  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.querySelector(".nav-panel");
  const navBackdrop = document.querySelector(".nav-backdrop");
  const toTop = document.querySelector(".to-top");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const navLinks = Array.from(document.querySelectorAll(".nav a"));
  const heroCarWrap = document.querySelector(".hero-car-wrap");
  const aboutCars = document.querySelector(".about-cars");
  const revealRegistry = new Set();
  const sectionLinks = navLinks.filter((link) => {
    const href = link.getAttribute("href");
    return href && href.startsWith("#") && href.length > 1 && document.querySelector(href);
  });
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function prefersReducedMotion() {
    return reduceMotionQuery.matches;
  }

  function isDesktop() {
    return window.innerWidth >= 1024;
  }

  function getScrollBehavior() {
    return prefersReducedMotion() ? "auto" : "smooth";
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

  function openNav() {
    if (!navToggle || !navPanel || isDesktop()) return;
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Đóng menu điều hướng");
    if (header) {
      header.classList.add("menu-open");
    }
    body.classList.add("nav-open");
    if (navBackdrop) {
      navBackdrop.hidden = false;
    }
  }

  function closeNav() {
    if (!navToggle || !navPanel) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Mở menu điều hướng");
    if (header) {
      header.classList.remove("menu-open");
    }
    body.classList.remove("nav-open");
    if (navBackdrop) {
      navBackdrop.hidden = true;
    }
  }

  function toggleNav() {
    if (!navToggle) return;
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeNav();
      return;
    }
    openNav();
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

    const headerOffset = header ? header.offsetHeight + 48 : 120;
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
    registerGroupedChildren(".hero-actions", { step: 90 });
    registerReveal(document.querySelector(".search-box"), {
      delay: 40,
      distance: "22px",
    });

    registerGroupedChildren(".section-title", { step: 70 });
    registerGroupedChildren(".service-grid", { step: 80 });
    registerSelectorSequence(".area-box > span, .area-box > h2, .area-box > p", { step: 70 });
    registerGroupedChildren(".chips", { step: 45 });
    registerGroupedChildren(".stats", { step: 70 });
    registerGroupedChildren(".commit-grid", { step: 75 });

    registerSelectorSequence(".about-copy > *", { step: 75 });
    registerReveal(document.querySelector(".brand-image"), {
      delay: 40,
      distance: "22px",
    });
    registerSelectorSequence(".brand-content > .section-mini, .brand-content > h2, .brand-content > p", {
      step: 75,
    });
    registerGroupedChildren(".brand-features", { step: 70 });
    registerSelectorSequence(".numbers-intro > *", { step: 75 });
    registerGroupedChildren(".numbers-cards", { step: 75 });
    registerGroupedChildren(".service-summary-grid", { step: 80 });
    registerGroupedChildren(".fleet-tabs", { step: 65 });
    registerGroupedChildren(".fleet-cards", { step: 85 });
    registerGroupedChildren(".reasons-grid", { step: 70 });
    registerGroupedChildren(".pricing-points", { step: 75 });
    registerGroupedChildren(".faq-grid", { step: 75 });

    registerReveal(document.querySelector(".cta-box > img"), {
      delay: 50,
      distance: "24px",
    });
    registerSelectorSequence(".cta-copy > h2, .cta-copy > p", { step: 75, start: 90 });
    registerGroupedChildren(".cta-actions", { step: 90 });
    registerGroupedChildren(".footer-grid", { step: 80 });
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

  function activateDriveIn(element, delay = 0) {
    if (!element || element.classList.contains("drive-in-active") || prefersReducedMotion()) return;
    element.classList.add("drive-in-ready");
    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        element.classList.add("drive-in-active");
      });
    }, delay);
  }

  function scheduleDriveIn(element, delay = 0) {
    if (!element) return;

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

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      revealItems.forEach(showReveal);
      return;
    }

    root.classList.add("reveal-enabled");
    document.body.offsetHeight;

    const initialItems = revealItems.filter(isInInitialViewport);
    if (initialItems.length) {
      window.setTimeout(() => {
        initialItems.forEach((item) => {
          window.requestAnimationFrame(() => showReveal(item));
        });
      }, 70);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          window.requestAnimationFrame(() => showReveal(entry.target));
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
  }

  function scrollToHash(hash) {
    if (!hash) return;

    if (hash === "#") {
      window.scrollTo({
        top: 0,
        behavior: getScrollBehavior(),
      });
      return;
    }

    const target = document.querySelector(hash);
    if (!target) return;

    const headerOffset = header ? header.offsetHeight + 18 : 0;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: targetTop,
      behavior: getScrollBehavior(),
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
      closeNav();

      if (href && href !== "#") {
        history.replaceState(null, "", href);
      }
    });

    if (window.location.hash && document.querySelector(window.location.hash)) {
      window.setTimeout(() => {
        scrollToHash(window.location.hash);
      }, 60);
    }
  }

  function initNavInteractions() {
    if (navToggle) {
      navToggle.addEventListener("click", toggleNav);
    }

    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeNav);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (!isDesktop()) {
          closeNav();
        }
      });
    });
  }

  function initResponsiveReset() {
    let lastDesktopState = isDesktop();

    window.addEventListener("resize", () => {
      const desktopNow = isDesktop();
      if (desktopNow !== lastDesktopState) {
        closeNav();
        lastDesktopState = desktopNow;
      }
      updateHeaderState();
      updateActiveSection();
    });
  }

  function init() {
    lockMediaInteractions();
    initRevealObserver();
    scheduleDriveIn(heroCarWrap, 120);
    scheduleDriveIn(aboutCars, 160);
    initHashNavigation();
    initNavInteractions();
    initResponsiveReset();
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
  }

  init();
})();
