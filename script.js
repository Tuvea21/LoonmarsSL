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
    var tickerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ticker-h")) || 0;
    var ticker = document.querySelector(".announce-ticker");
    if (ticker) h += tickerH;
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

  /* ---------------- Hero network canvas (only present on index.html) ----
     A lightweight "connected dots" animation for the dark hero background. */
  var heroCanvas = document.getElementById("heroNetwork");
  if (heroCanvas) {
    var hctx = heroCanvas.getContext("2d");
    var heroSection = heroCanvas.closest(".hero");
    var hDpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var NODE_COUNT = 60;
    var LINK_DIST = 140;

    function resizeHero() {
      var w = heroSection.clientWidth;
      var h = heroSection.clientHeight;
      heroCanvas.width = w * hDpr;
      heroCanvas.height = h * hDpr;
      heroCanvas.style.width = w + "px";
      heroCanvas.style.height = h + "px";
      hctx.setTransform(hDpr, 0, 0, hDpr, 0, 0);
      return { w: w, h: h };
    }

    var heroDims = resizeHero();

    function makeNodes() {
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * heroDims.w,
          y: Math.random() * heroDims.h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        });
      }
    }
    makeNodes();

    function drawHeroNetwork() {
      hctx.clearRect(0, 0, heroDims.w, heroDims.h);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > heroDims.w) n.vx *= -1;
        if (n.y < 0 || n.y > heroDims.h) n.vy *= -1;
      }

      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x;
          var dy = nodes[i].y - nodes[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            hctx.strokeStyle = "rgba(79, 214, 255, " + (0.18 * (1 - dist / LINK_DIST)) + ")";
            hctx.lineWidth = 1;
            hctx.beginPath();
            hctx.moveTo(nodes[i].x, nodes[i].y);
            hctx.lineTo(nodes[j].x, nodes[j].y);
            hctx.stroke();
          }
        }
      }

      for (var i = 0; i < nodes.length; i++) {
        hctx.beginPath();
        hctx.fillStyle = "rgba(79, 214, 255, 0.7)";
        hctx.arc(nodes[i].x, nodes[i].y, 1.8, 0, Math.PI * 2);
        hctx.fill();
      }

      if (!prefersReducedMotion) {
        requestAnimationFrame(drawHeroNetwork);
      }
    }

    requestAnimationFrame(drawHeroNetwork);

    var heroResizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(heroResizeTimer);
      heroResizeTimer = setTimeout(function () {
        heroDims = resizeHero();
        makeNodes();
        if (prefersReducedMotion) drawHeroNetwork();
      }, 150);
    });
  }

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

  /* ---------------- Newsletter form (only present on newsletter.html) ---------------- */
  var nlForm = document.getElementById("newsletterForm");
  var nlStatus = document.getElementById("newsletterStatus");

  if (nlForm && nlStatus) {
    nlForm.addEventListener("submit", function (e) {
      e.preventDefault();
      nlStatus.classList.remove("error");

      var name = nlForm.name.value.trim();
      var email = nlForm.email.value.trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email) {
        nlStatus.textContent = "Por favor preencha o nome e o email.";
        nlStatus.classList.add("error");
        return;
      }
      if (!emailPattern.test(email)) {
        nlStatus.textContent = "Por favor insira um email válido.";
        nlStatus.classList.add("error");
        return;
      }

      /* Same note as the contact form: connect this to Formspree, EmailJS,
         Mailchimp, or your own API endpoint to actually collect subscribers. */

      nlStatus.textContent = "Subscrição confirmada. Bem-vindo(a) a bordo!";
      nlForm.reset();
    });
  }

  /* ---------------- Testimonial carousel (only present on sobre.html) ----
     PLACEHOLDER CONTENT: edit the TESTIMONIALS array below with real quotes,
     names and roles from actual partners/collaborators. */
  var testimonialText = document.getElementById("testimonialText");
  var testimonialName = document.getElementById("testimonialName");
  var testimonialRole = document.getElementById("testimonialRole");
  var testimonialInitials = document.getElementById("testimonialInitials");
  var testimonialDots = document.getElementById("testimonialDots");
  var aboutPhoto = document.getElementById("aboutPhoto");

  if (testimonialText && testimonialDots) {
    /* PLACEHOLDER CONTENT: edit each entry below — put the real photo path
       in "photo" (e.g. "images/parceiro-1.jpg") to match each testimonial.
       Leave "photo" empty ("") to keep the default gradient placeholder. */
    var TESTIMONIALS = [
      {
        quote: "A colaboração com a Loonmars trouxe uma perspectiva de engenharia séria e aplicada aos nossos projectos de investigação conjunta.",
        name: "Emerson Miranda",
        role: "Instituição académica parceira",
        initials: "EM",
        photo: "images/MIRANDA2.jpg"
      },
      {
        quote: "É raro ver uma equipa tão jovem a trabalhar com este nível de rigor técnico num campo tão exigente como o espacial.",
        name: "Filipe Nyusi",
        role: "Parceiro de investimento",
        initials: "FN",
        photo: "images/filipe-nyusi1.jpg"
      },
      {
        quote: "O trabalho da Loonmars na estação terrestre abriu portas para projectos de observação da Terra que antes pareciam distantes.",
        name: "Mia couto",
        role: "Colaborador de investigação",
        initials: "MC",
        photo: "images/mia4.jpg"
      }
    ];

    var currentTestimonial = 0;

    function renderTestimonial(i) {
      var t = TESTIMONIALS[i];
      testimonialText.textContent = t.quote;
      testimonialName.textContent = t.name;
      testimonialRole.textContent = t.role;
      testimonialInitials.textContent = t.initials;
      if (aboutPhoto && t.photo) {
        aboutPhoto.style.opacity = "0";
        setTimeout(function () {
          aboutPhoto.style.backgroundImage = "url('" + t.photo + "')";
          aboutPhoto.style.opacity = "1";
        }, 200);
      }
      Array.prototype.forEach.call(testimonialDots.children, function (dot, idx) {
        dot.classList.toggle("active", idx === i);
      });
    }

    TESTIMONIALS.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Testemunho " + (i + 1));
      dot.addEventListener("click", function () {
        currentTestimonial = i;
        renderTestimonial(i);
      });
      testimonialDots.appendChild(dot);
    });

    renderTestimonial(0);

    if (!prefersReducedMotion) {
      setInterval(function () {
        currentTestimonial = (currentTestimonial + 1) % TESTIMONIALS.length;
        renderTestimonial(currentTestimonial);
      }, 6000);
    }
  }

  /* ---------------- Nav dropdown ("Sobre a Loonmars") ---------------- */
  document.querySelectorAll(".nav-dropdown-toggle").forEach(function (btn) {
    var dropdown = btn.closest(".nav-dropdown");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".nav-dropdown.open").forEach(function (d) {
      d.classList.remove("open");
      d.querySelector(".nav-dropdown-toggle").setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".nav-dropdown.open").forEach(function (d) {
        d.classList.remove("open");
      });
    }
  });

  /* ---------------- Newsletter page: news data + search/filter/pagination
     (only present on newsletter.html — checks for #newsGrid before running)

     HOW TO EDIT:
     - Everything shown in the news grid comes from the NEWS array below.
     - "category" must be one of: "loonmars", "espaco", "eventos" — these
       match the data-filter values on the filter buttons in newsletter.html.
     - "source" is shown as a small tag. Use "Loonmars Space Lab" for your
       own news, or the name of the outlet for external/aggregated news.
     - "photo" is a path like "images/noticia-x.jpg". Leave it as "" to
       keep the gradient placeholder.
     - The items below with source NOT "Loonmars Space Lab" are PLACEHOLDER
       examples of external/aggregated news — replace the outlet name and
       text with real, correctly-attributed stories before publishing. ---- */
  var newsGrid = document.getElementById("newsGrid");
  if (newsGrid) {
    var NEWS = [
      {
        title: "Programa CubeSat avança para fase de estudo de viabilidade",
        excerpt: "O nosso primeiro nanosatélite de observação da Terra entra na fase seguinte de investigação, com foco em monitorização agrícola e costeira.",
        date: "15 Jul 2026",
        category: "loonmars",
        source: "Loonmars Space Lab",
        photo: ""
      },
      {
        title: "Observação da Lua em Maputo reúne mais de 200 pessoas",
        excerpt: "Dos astros que observamos no céu, a Lua é aquele que mais prende a nossa atenção — e ficou provado no evento aberto ao público no fim de semana.",
        date: "02 Jun 2026",
        category: "eventos",
        source: "Loonmars Space Lab",
        photo: ""
      },
      {
        title: "Loonmars junta-se a rede africana de startups espaciais",
        excerpt: "Uma nova parceria para partilhar investigação e acelerar o acesso ao espaço em toda a região austral de África.",
        date: "20 Mai 2026",
        category: "loonmars",
        source: "Loonmars Space Lab",
        photo: ""
      },
      {
        title: "Continente africano regista recorde de lançamentos de nanosatélites",
        excerpt: "Vários países africanos anunciaram novos programas de pequenos satélites para observação da Terra e comunicações — exemplo de conteúdo agregado; substitua por uma notícia real e devidamente atribuída.",
        date: "12 Mai 2026",
        category: "espaco",
        source: "Órbita Hoje (exemplo — substituir)",
        photo: ""
      },
      {
        title: "Primeiro protótipo da Estação Terrestre Maputo entra em testes",
        excerpt: "Testes iniciais de receção de sinal já em curso no nosso laboratório em Maputo, com resultados promissores nas primeiras semanas.",
        date: "02 Jun 2026",
        category: "loonmars",
        source: "Loonmars Space Lab",
        photo: ""
      },
      {
        title: "Custo de acesso ao espaço continua a cair globalmente",
        excerpt: "Novos veículos de lançamento reutilizáveis reduzem o custo por quilograma em órbita — exemplo de conteúdo agregado; substitua por uma notícia real e devidamente atribuída.",
        date: "28 Abr 2026",
        category: "espaco",
        source: "Cosmos Diário (exemplo — substituir)",
        photo: ""
      },
      {
        title: "Webinar sobre arquitectura espacial reúne investigadores de 6 países",
        excerpt: "A sessão aberta sobre desafios estruturais em ambientes extremos teve participação de universidades de toda a região.",
        date: "15 Abr 2026",
        category: "eventos",
        source: "Loonmars Space Lab",
        photo: ""
      },
      {
        title: "Loonmars inicia recrutamento para bolsas de investigação 2026",
        excerpt: "Candidaturas abertas para estudantes e investigadores interessados em sistemas de satélites e arquitectura espacial.",
        date: "03 Abr 2026",
        category: "loonmars",
        source: "Loonmars Space Lab",
        photo: ""
      },
      {
        title: "Cada vez mais universidades africanas lançam cursos de engenharia espacial",
        excerpt: "O interesse pela área cresce em todo o continente, acompanhando o surgimento de novas agências espaciais nacionais — exemplo de conteúdo agregado; substitua por uma notícia real e devidamente atribuída.",
        date: "22 Mar 2026",
        category: "espaco",
        source: "Rede Espacial África (exemplo — substituir)",
        photo: ""
      },
      {
        title: "Assim nasceu a Loonmars Space Lab",
        excerpt: "A história de como um pequeno grupo de engenheiros e arquitectos em Maputo decidiu construir a primeira etapa da presença moçambicana no espaço.",
        date: "10 Mar 2026",
        category: "loonmars",
        source: "Loonmars Space Lab",
        photo: ""
      }
    ];

    var CATEGORY_LABELS = {
      loonmars: { label: "Loonmars", cls: "tag-loonmars" },
      espaco: { label: "Espaço & Mundo", cls: "tag-espaco" },
      eventos: { label: "Eventos", cls: "tag-eventos" }
    };

    var PAGE_SIZE = 6;
    var visibleCount = PAGE_SIZE;
    var activeFilter = "todas";
    var searchTerm = "";

    var searchInput = document.getElementById("newsSearch");
    var filterTabs = document.getElementById("filterTabs");
    var resultsCount = document.getElementById("resultsCount");
    var emptyState = document.getElementById("emptyState");
    var loadMoreBtn = document.getElementById("loadMoreBtn");

    var getFiltered = function () {
      return NEWS.filter(function (item) {
        var matchesFilter = activeFilter === "todas" || item.category === activeFilter;
        var haystack = (item.title + " " + item.excerpt + " " + item.source).toLowerCase();
        var matchesSearch = haystack.indexOf(searchTerm.toLowerCase()) !== -1;
        return matchesFilter && matchesSearch;
      });
    };

    var cardHTML = function (item, index) {
      var cat = CATEGORY_LABELS[item.category] || { label: item.category, cls: "" };
      var photoStyle = item.photo
        ? ' style="background-image:url(\'' + item.photo + '\')"'
        : "";
      var photoClass = item.photo ? "" : " news-photo-" + ((index % 3) + 1);
      return (
        '<a class="news-card" href="#">' +
          '<div class="news-photo' + photoClass + '"' + photoStyle + ' role="img" aria-label="' + item.title + '"></div>' +
          '<div class="news-body">' +
            '<span class="tag-badge ' + cat.cls + '">' + cat.label + '</span>' +
            '<span class="news-date mono">' + item.date + " · " + item.source + '</span>' +
            '<h3>' + item.title + '</h3>' +
            '<p>' + item.excerpt + '</p>' +
          '</div>' +
        '</a>'
      );
    };

    var renderNews = function () {
      var filtered = getFiltered();
      var toShow = filtered.slice(0, visibleCount);

      newsGrid.innerHTML = toShow.map(cardHTML).join("");

      emptyState.hidden = filtered.length > 0;
      newsGrid.style.display = filtered.length > 0 ? "grid" : "none";

      resultsCount.textContent = filtered.length
        ? filtered.length + (filtered.length === 1 ? " resultado" : " resultados")
        : "";

      loadMoreBtn.style.display = filtered.length > visibleCount ? "inline-flex" : "none";

      newsGrid.querySelectorAll(".news-card").forEach(function (card) {
        card.classList.add("in-view");
      });
    };

    searchInput.addEventListener("input", function () {
      searchTerm = searchInput.value.trim();
      visibleCount = PAGE_SIZE;
      renderNews();
    });

    filterTabs.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-tab");
      if (!btn) return;
      filterTabs.querySelectorAll(".filter-tab").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter");
      visibleCount = PAGE_SIZE;
      renderNews();
    });

    loadMoreBtn.addEventListener("click", function () {
      visibleCount += PAGE_SIZE;
      renderNews();
    });

    renderNews();
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();