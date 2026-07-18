/* ==========================================================================
   LOONMARS SPACE LAB — SCRIPT
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("siteHeader");

  /* ---------------- Keep --header-h in sync with the real header size ----
     This means the hero and page-header top spacing always adapts, no
     matter how large or small the logo (.brand-logo / .footer-logo in
     styles.css) is set to. */
  function updateHeaderHeight() {
    var h = header.offsetHeight;
    if (h > 0) {
      document.documentElement.style.setProperty("--header-h", h + "px");
    }
  }
  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight, { passive: true });
  window.addEventListener("load", updateHeaderHeight);
  // Logo images may finish loading slightly after first paint, which can
  // change the header's height — re-measure once they're ready too.
  document.querySelectorAll(".brand-logo").forEach(function (img) {
    if (img.complete) return;
    img.addEventListener("load", updateHeaderHeight);
  });

  /* ---------------- Header shrink on scroll ----------------
     The "active" nav link itself is set per-page directly in the HTML
     (see the class="active" attribute on the current page's nav link),
     since each page is now a separate file rather than an anchor target. */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));

  function onScroll() {
    if (window.scrollY > 12) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  var menuToggle = document.getElementById("menuToggle");
  var mainNav = document.getElementById("mainNav");

  function closeMenu() {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------------- Starfield canvas ---------------- */
  var canvas = document.getElementById("starfield");
  var ctx = canvas.getContext("2d");
  var stars = [];
  var starCount = 140;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeStars() {
    stars = [];
    for (var i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.1 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.005
      });
    }
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twinkle = prefersReducedMotion ? 0 : Math.sin(time * s.speed + s.phase) * 0.35;
      var alpha = Math.max(0, Math.min(1, s.baseAlpha + twinkle));
      ctx.beginPath();
      ctx.fillStyle = "rgba(243, 245, 249, " + alpha + ")";
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!prefersReducedMotion) {
      requestAnimationFrame(drawStars);
    }
  }

  resizeCanvas();
  makeStars();
  requestAnimationFrame(drawStars);

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeCanvas();
      makeStars();
      if (prefersReducedMotion) drawStars(0);
    }, 150);
  });

  /* ---------------- Contact form (only present on contacto.html) ---------------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.classList.remove("error");

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !message) {
        status.textContent = "Por favor preencha todos os campos obrigatórios.";
        status.classList.add("error");
        return;
      }
      if (!emailPattern.test(email)) {
        status.textContent = "Por favor insira um email válido.";
        status.classList.add("error");
        return;
      }

      /* ------------------------------------------------------------------
         NOTE FOR EDITING:
         This form currently only validates and shows a confirmation message.
         To actually receive messages, connect it to a backend or a service
         such as Formspree, EmailJS, or your own API endpoint. Example with
         Formspree:

         fetch("https://formspree.io/f/YOUR_FORM_ID", {
           method: "POST",
           headers: { "Accept": "application/json" },
           body: new FormData(form)
         }).then(...);
         ------------------------------------------------------------------ */

      status.textContent = "Mensagem enviada com sucesso. Entraremos em contacto em breve.";
      form.reset();
    });
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();