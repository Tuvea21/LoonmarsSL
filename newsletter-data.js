/* ==========================================================================
   LOONMARS SPACE LAB — NEWSLETTER PAGE DATA + INTERACTIVITY
   Only runs on newsletter.html (checks for #newsGrid before doing anything).

   HOW TO EDIT:
   - Everything shown in the news grid comes from the NEWS array below.
   - "category" must be one of: "loonmars", "espaco", "eventos" — these
     match the data-filter values on the filter buttons in newsletter.html.
   - "source" is shown as a small tag. Use "Loonmars Space Lab" for your
     own news, or the name of the outlet for external/aggregated news.
   - "photo" is a path like "images/noticia-x.jpg". Leave it as "" to keep
     the gradient placeholder.
   - The 3 items with source that are NOT "Loonmars Space Lab" below are
     PLACEHOLDER examples of external/aggregated news — replace the outlet
     name and text with real, correctly-attributed stories before publishing.
   ========================================================================== */

(function () {
  "use strict";

  var grid = document.getElementById("newsGrid");
  if (!grid) return; // Only run on newsletter.html

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

  function getFiltered() {
    return NEWS.filter(function (item) {
      var matchesFilter = activeFilter === "todas" || item.category === activeFilter;
      var haystack = (item.title + " " + item.excerpt + " " + item.source).toLowerCase();
      var matchesSearch = haystack.indexOf(searchTerm.toLowerCase()) !== -1;
      return matchesFilter && matchesSearch;
    });
  }

  function cardHTML(item, index) {
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
  }

  function render() {
    var filtered = getFiltered();
    var toShow = filtered.slice(0, visibleCount);

    grid.innerHTML = toShow.map(cardHTML).join("");

    emptyState.hidden = filtered.length > 0;
    grid.style.display = filtered.length > 0 ? "grid" : "none";

    resultsCount.textContent = filtered.length
      ? filtered.length + (filtered.length === 1 ? " resultado" : " resultados")
      : "";

    loadMoreBtn.style.display = filtered.length > visibleCount ? "inline-flex" : "none";

    // Re-trigger the site-wide scroll-reveal fade-in for freshly rendered cards
    grid.querySelectorAll(".news-card").forEach(function (card) {
      card.classList.add("in-view");
    });
  }

  searchInput.addEventListener("input", function () {
    searchTerm = searchInput.value.trim();
    visibleCount = PAGE_SIZE;
    render();
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
    render();
  });

  loadMoreBtn.addEventListener("click", function () {
    visibleCount += PAGE_SIZE;
    render();
  });

  render();
})();