document.addEventListener("DOMContentLoaded", function () {
  // --- Navbar Functionaliteit ---
  const pageHeader = document.getElementById("page-header");
  const navMenuLinks = document.querySelectorAll("ul.nav-links a.nav-link"); // Preciezere selector
  const sections = document.querySelectorAll("main section[id]");
  const navbarHeight = pageHeader ? pageHeader.offsetHeight : 70; // Dynamische hoogte of fallback

  function handleNavbarScroll() {
    if (pageHeader) {
      // Controleer of pageHeader bestaat
      if (window.scrollY > 50) {
        // Verander 50 naar gewenste scrollafstand
        pageHeader.classList.add("scrolled");
      } else {
        pageHeader.classList.remove("scrolled");
      }
    }
  }

  // Functie voor actieve link markering bij scrollen
  function highlightActiveLink() {
    let currentSectionId = "";
    // Gebruik een kleine offset om de detectie te verbeteren wanneer een sectie net in beeld komt
    const scrollPosition =
      window.scrollY + navbarHeight + Math.min(50, window.innerHeight / 3);

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      // Controleer of de scrollpositie binnen de grenzen van de sectie valt
      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        currentSectionId = section.getAttribute("id");
      }
    });

    // Speciale behandeling voor de hero sectie als deze bovenaan staat
    if (
      sections.length > 0 &&
      window.scrollY < sections[0].offsetTop - navbarHeight - 50 &&
      sections[0].id === "hero"
    ) {
      currentSectionId = "hero";
    }

    navMenuLinks.forEach((link) => {
      link.classList.remove("active-link");
      // Controleer of de href van de link (na de #) overeenkomt met de huidige sectie ID
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active-link");
      }
    });
  }

  // Event listeners voor scrollen
  window.addEventListener("scroll", () => {
    handleNavbarScroll();
    highlightActiveLink();
  });
  // Initiele check bij laden van de pagina
  handleNavbarScroll();
  highlightActiveLink();

  // --- Mobiele Navigatie ---
  const hamburger = document.querySelector(".hamburger-menu");
  const navLinksContainer = document.querySelector("ul.nav-links"); // Preciezere selector

  if (hamburger && navLinksContainer) {
    hamburger.addEventListener("click", () => {
      navLinksContainer.classList.toggle("active");
      hamburger.classList.toggle("active");
    });

    // Sluit mobiel menu wanneer op een link wordt geklikt
    navLinksContainer.querySelectorAll("a.nav-link").forEach((link) => {
      // Specifieker naar .nav-link
      link.addEventListener("click", () => {
        if (navLinksContainer.classList.contains("active")) {
          navLinksContainer.classList.remove("active");
          hamburger.classList.remove("active");
        }
      });
    });
  }

  // --- Footer Actueel Jaar ---
  const currentYearSpan = document.getElementById("currentYear");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --- Testimonial Carousel ---
  const carouselWrapper = document.querySelector(
    ".testimonial-carousel-wrapper"
  );
  const track = document.querySelector(".testimonial-track");
  const slides = Array.from(track ? track.children : []);
  const nextButton = document.querySelector(".carousel-btn.next");
  const prevButton = document.querySelector(".carousel-btn.prev");
  const dotsContainer = document.querySelector(".carousel-dots");

  if (track && slides.length > 0) {
    let currentSlideIndex = 0;
    let autoScrollInterval;
    const AUTOSCROLL_DELAY = 7000;

    function updateSlidePosition() {
      const carousel = document.querySelector(".testimonial-carousel");
      if (!carousel) return;

      const viewportWidth = carousel.offsetWidth;
      const activeSlide = slides[currentSlideIndex];
      if (!activeSlide) return;

      const slideStyle = getComputedStyle(activeSlide);
      const slideWidth = activeSlide.offsetWidth;
      const marginLeft = parseFloat(slideStyle.marginLeft);
      const slideWidthWithMargin =
        slideWidth + marginLeft + parseFloat(slideStyle.marginRight);

      const targetOffsetForActiveSlide = (viewportWidth - slideWidth) / 2;
      const totalOffsetToActiveSlideEdge =
        currentSlideIndex * slideWidthWithMargin + marginLeft;

      let finalTransformX =
        targetOffsetForActiveSlide - totalOffsetToActiveSlideEdge;

      track.style.transform = `translateX(${finalTransformX}px)`;

      slides.forEach((slide, index) => {
        slide.classList.toggle("active", index === currentSlideIndex);
      });

      updateDots();
    }

    function createDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.classList.add("dot");
        if (index === currentSlideIndex) {
          dot.classList.add("active");
        }
        dot.setAttribute("aria-label", `Ga naar review ${index + 1}`);
        dot.addEventListener("click", () => {
          goToSlide(index);
          restartAutoScroll();
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.children;
      Array.from(dots).forEach((dot, index) => {
        dot.classList.toggle("active", index === currentSlideIndex);
      });
    }

    function goToSlide(slideIndex) {
      currentSlideIndex = (slideIndex + slides.length) % slides.length;
      updateSlidePosition();
    }

    function nextSlide() {
      goToSlide(currentSlideIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentSlideIndex - 1);
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollInterval = setInterval(nextSlide, AUTOSCROLL_DELAY);
    }

    function stopAutoScroll() {
      clearInterval(autoScrollInterval);
    }

    function restartAutoScroll() {
      stopAutoScroll();
      startAutoScroll();
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        nextSlide();
        restartAutoScroll();
      });
    }
    if (prevButton) {
      prevButton.addEventListener("click", () => {
        prevSlide();
        restartAutoScroll();
      });
    }

    if (carouselWrapper) {
      carouselWrapper.addEventListener("mouseenter", stopAutoScroll);
      carouselWrapper.addEventListener("mouseleave", startAutoScroll);
      carouselWrapper.addEventListener("focusin", stopAutoScroll);
      carouselWrapper.addEventListener("focusout", startAutoScroll);
    }

    if (slides.length > 0) {
      createDots();
      requestAnimationFrame(() => {
        updateSlidePosition();
      });
      startAutoScroll();
    }

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateSlidePosition();
      }, 250);
    });
  } else {
    if (nextButton) nextButton.style.display = "none";
    if (prevButton) prevButton.style.display = "none";
    if (dotsContainer) dotsContainer.style.display = "none";
  }

  // --- Modal Functionaliteit ---
  const openModalButtons = document.querySelectorAll(".open-modal-btn");
  const closeModalButtons = document.querySelectorAll(".close-modal-btn");
  const closeModalInlineButtons = document.querySelectorAll(
    ".close-modal-inline-btn"
  );
  const modals = document.querySelectorAll(".modal");

  function openModal(modal) {
    if (modal == null) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    if (modal == null) return;
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.querySelector(button.dataset.modalTarget);
      openModal(modal);
    });
  });

  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal");
      closeModal(modal);
    });
  });

  closeModalInlineButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal");
      closeModal(modal);
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // --- Scroll Animaties voor Secties ---
  const scrollAnimatedElements =
    document.querySelectorAll(".animate-on-scroll");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.animationDelay || "0s";
          entry.target.style.transitionDelay = delay;
          entry.target.classList.add("is-visible");
        } else {
          // entry.target.classList.remove("is-visible"); // Voor herhaalde animatie
          // entry.target.style.transitionDelay = '0s';
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  scrollAnimatedElements.forEach((el) => {
    observer.observe(el);
  });
});
