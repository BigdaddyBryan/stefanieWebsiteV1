document.addEventListener("DOMContentLoaded", () => {
  // ===== Navbar scroll & active link =====
  const pageHeader = document.getElementById("page-header");
  const navMenuLinks = document.querySelectorAll("ul.nav-links a.nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const navbarHeight = pageHeader ? pageHeader.offsetHeight : 70;

  function handleNavbarScroll() {
    if (!pageHeader) return;
    if (window.scrollY > 50) {
      pageHeader.classList.add("scrolled");
    } else {
      pageHeader.classList.remove("scrolled");
    }
  }

  function highlightActiveLink() {
    let currentId = "";
    const scrollPos =
      window.scrollY + navbarHeight + Math.min(50, window.innerHeight / 3);
    sections.forEach((s) => {
      const top = s.offsetTop,
        h = s.offsetHeight;
      if (scrollPos >= top && scrollPos < top + h) {
        currentId = s.id;
      }
    });
    // Hero fallback
    if (
      sections.length &&
      window.scrollY < sections[0].offsetTop - navbarHeight - 50 &&
      sections[0].id === "hero"
    ) {
      currentId = "hero";
    }
    navMenuLinks.forEach((a) => {
      a.classList.toggle(
        "active-link",
        a.getAttribute("href") === `#${currentId}`
      );
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      handleNavbarScroll();
      highlightActiveLink();
    },
    { passive: true }
  );
  handleNavbarScroll();
  highlightActiveLink();

  // ===== Mobile nav =====
  const hamburger = document.querySelector(".hamburger-menu");
  const navLinksContainer = document.querySelector("ul.nav-links");

  if (hamburger && navLinksContainer) {
    const toggleNav = () => {
      const isOpen = navLinksContainer.classList.toggle("active");
      hamburger.classList.toggle("active", isOpen);
      // ARIA
      hamburger.setAttribute("aria-expanded", String(isOpen));
      hamburger.setAttribute(
        "aria-label",
        isOpen ? "Sluit hoofdmenu" : "Open hoofdmenu"
      );
      navLinksContainer.setAttribute("aria-hidden", String(!isOpen));
      if (isOpen) {
        // move focus to first link for keyboard users
        navLinksContainer.querySelector("a.nav-link")?.focus();
      } else {
        hamburger.focus();
      }
    };
    hamburger.addEventListener("click", toggleNav);

    // Close on link click
    navLinksContainer.querySelectorAll("a.nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (navLinksContainer.classList.contains("active")) {
          navLinksContainer.classList.remove("active");
          hamburger.classList.remove("active");
          hamburger.setAttribute("aria-expanded", "false");
          hamburger.setAttribute("aria-label", "Open hoofdmenu");
        }
      });
    });
  }

  // ===== Footer year =====
  const currentYearSpan = document.getElementById("currentYear");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // ===== Testimonial carousel =====
  const carouselWrapper = document.querySelector(
    ".testimonial-carousel-wrapper"
  );
  const track = document.querySelector(".testimonial-track");
  const nextButton = document.querySelector(".carousel-btn.next");
  const prevButton = document.querySelector(".carousel-btn.prev");
  const dotsContainer = document.querySelector(".carousel-dots");

  if (track && track.children.length > 0) {
    const slides = Array.from(track.children);
    let currentSlideIndex = 0;
    let autoScrollInterval;
    const AUTOSCROLL_DELAY = 7000;

    function updateSlidePosition() {
      const carousel = document.querySelector(".testimonial-carousel");
      if (!carousel) return;
      const viewportWidth = carousel.offsetWidth;
      const active = slides[currentSlideIndex];
      if (!active) return;
      const cs = getComputedStyle(active);
      const w = active.offsetWidth;
      const ml = parseFloat(cs.marginLeft);
      const mr = parseFloat(cs.marginRight);
      const step = w + ml + mr;
      const centerOffset = (viewportWidth - w) / 2;
      const total = currentSlideIndex * step + ml;
      const x = centerOffset - total;
      track.style.transform = `translateX(${x}px)`;
      slides.forEach((s, i) => {
        const isActive = i === currentSlideIndex;
        s.classList.toggle("active", isActive);
        s.setAttribute("aria-hidden", String(!isActive));
      });
      updateDots();
    }

    function createDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "dot";
        dot.setAttribute("aria-label", `Ga naar review ${i + 1}`);
        dot.addEventListener("click", () => {
          goToSlide(i);
          restartAuto();
        });
        dotsContainer.appendChild(dot);
      });
      updateDots();
    }
    function updateDots() {
      if (!dotsContainer) return;
      [...dotsContainer.children].forEach((d, i) =>
        d.classList.toggle("active", i === currentSlideIndex)
      );
    }
    function goToSlide(i) {
      currentSlideIndex = (i + slides.length) % slides.length;
      updateSlidePosition();
    }
    function next() {
      goToSlide(currentSlideIndex + 1);
    }
    function prev() {
      goToSlide(currentSlideIndex - 1);
    }
    function startAuto() {
      stopAuto();
      autoScrollInterval = setInterval(next, AUTOSCROLL_DELAY);
    }
    function stopAuto() {
      clearInterval(autoScrollInterval);
    }
    function restartAuto() {
      stopAuto();
      startAuto();
    }

    nextButton?.addEventListener("click", () => {
      next();
      restartAuto();
    });
    prevButton?.addEventListener("click", () => {
      prev();
      restartAuto();
    });

    carouselWrapper?.addEventListener("mouseenter", stopAuto);
    carouselWrapper?.addEventListener("mouseleave", startAuto);
    carouselWrapper?.addEventListener("focusin", stopAuto);
    carouselWrapper?.addEventListener("focusout", startAuto);

    createDots();
    requestAnimationFrame(updateSlidePosition);
    startAuto();

    let resizeTimeout;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateSlidePosition, 200);
      },
      { passive: true }
    );
  } else {
    nextButton && (nextButton.style.display = "none");
    prevButton && (prevButton.style.display = "none");
    dotsContainer && (dotsContainer.style.display = "none");
  }

  // ===== Modals (ESC + klik buiten + inline close) =====
  const openModalButtons = document.querySelectorAll(".open-modal-btn");
  const closeModalButtons = document.querySelectorAll(".close-modal-btn");
  const closeModalInlineButtons = document.querySelectorAll(
    ".close-modal-inline-btn"
  );
  const modals = document.querySelectorAll(".modal");
  let pageScrollTop = 0;

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("active");
    // prevent body jump when scrollbars hide
    pageScrollTop = window.scrollY;
    document.body.style.top = `-${pageScrollTop}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    const focusEl = modal.querySelector(".close-modal-btn");
    focusEl?.focus();
    trapFocus(modal);
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, pageScrollTop);
  }

  openModalButtons.forEach((btn) => {
    btn.addEventListener("click", () =>
      openModal(document.querySelector(btn.dataset.modalTarget))
    );
  });
  closeModalButtons.forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.closest(".modal")));
  });
  closeModalInlineButtons.forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.closest(".modal")));
  });
  modals.forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal(m);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.active").forEach(closeModal);
    }
  });

  // basic focus trap for modals
  function trapFocus(root) {
    const focusable = root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function handle(e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    root.addEventListener("keydown", handle);
  }

  // ===== Scroll animaties =====
  const toReveal = document.querySelectorAll(".animate-on-scroll");
  if (toReveal.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.animationDelay || "0s";
            entry.target.style.transitionDelay = delay;
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    toReveal.forEach((el) => io.observe(el));
  }

  // ===== Over Mij: Collapsible toggle =====
  const aboutToggle = document.getElementById("about-toggle");
  const aboutMore = document.getElementById("about-more");
  if (aboutToggle && aboutMore) {
    const setOpen = (open) => {
      aboutToggle.setAttribute("aria-expanded", String(open));
      if (open) {
        aboutMore.hidden = false;
        // force reflow to allow transition
        // eslint-disable-next-line no-unused-expressions
        aboutMore.offsetHeight;
        // add a short-lived class to trigger subtle glow
        aboutMore.classList.add("opening");
        aboutMore.classList.add("is-open");
        const removeOpening = () => {
          aboutMore.classList.remove("opening");
          aboutMore.removeEventListener("transitionend", removeOpening);
        };
        aboutMore.addEventListener("transitionend", removeOpening);
      } else {
        aboutMore.classList.remove("is-open");
        const onEnd = (e) => {
          if (e.propertyName === "grid-template-rows") {
            aboutMore.hidden = true;
            aboutMore.removeEventListener("transitionend", onEnd);
          }
        };
        aboutMore.addEventListener("transitionend", onEnd);
      }
    };
    aboutToggle.addEventListener("click", () => {
      const open = aboutToggle.getAttribute("aria-expanded") === "true";
      setOpen(!open);
    });
  }
});
