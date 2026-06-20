(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupScrollButtons() {
    document.querySelectorAll("[data-scroll-left]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-left"));
        if (target) {
          target.scrollBy({ left: -420, behavior: "smooth" });
        }
      });
    });
    document.querySelectorAll("[data-scroll-right]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-right"));
        if (target) {
          target.scrollBy({ left: 420, behavior: "smooth" });
        }
      });
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupLocalFilter() {
    document.querySelectorAll("[data-local-filter]").forEach(function (form) {
      var input = form.querySelector("input");
      var scope = form.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      if (!input || !cards.length) {
        return;
      }
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.textContent
          ].join(" "));
          card.classList.toggle("hidden-by-filter", query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function movieResultTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a href=\"./" + escapeHtml(movie.file) + "\" class=\"movie-link\">" +
      "<div class=\"poster-wrap\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"score-badge\">" + escapeHtml(movie.score) + "</span>" +
      "</div>" +
      "<div class=\"movie-info\">" +
      "<h3>" + escapeHtml(movie.title) + "</h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-meta\">" +
      "<span>" + escapeHtml(movie.region) + "</span>" +
      "<span>" + escapeHtml(movie.type) + "</span>" +
      "<span>" + escapeHtml(movie.year) + "</span>" +
      "</div>" +
      "<div class=\"movie-tags\">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function setupSearchPage() {
    var resultBox = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    if (!resultBox || !status || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q") || "");
    var panelInput = document.querySelector(".search-panel input[name='q']");
    if (panelInput) {
      panelInput.value = params.get("q") || "";
    }
    if (!query) {
      resultBox.innerHTML = window.SEARCH_MOVIES.slice(0, 24).map(movieResultTemplate).join("");
      status.textContent = "热门内容已展示，可输入关键词进一步筛选。";
      return;
    }
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" "));
      return text.indexOf(query) !== -1;
    }).slice(0, 120);
    if (!matches.length) {
      resultBox.innerHTML = "";
      status.textContent = "没有找到匹配内容，可尝试更换关键词。";
      return;
    }
    resultBox.innerHTML = matches.map(movieResultTemplate).join("");
    status.textContent = "已展示匹配内容。";
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupScrollButtons();
    setupSearchForms();
    setupLocalFilter();
    setupSearchPage();
  });
})();
