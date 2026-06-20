(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector(".js-menu-toggle");
    var panel = document.querySelector(".js-mobile-menu");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector(".hero-carousel");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
          slide.setAttribute("aria-hidden", i === current ? "false" : "true");
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function start() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      show(0);
      start();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var empty = document.querySelector(".empty-filter");
    var activeValue = "all";

    function textOf(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-category")
      ].join(" ").toLowerCase();
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var q = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var shown = 0;
      cards.forEach(function (card) {
        var category = card.getAttribute("data-category") || "";
        var type = card.getAttribute("data-type") || "";
        var text = textOf(card);
        var chipMatch = activeValue === "all" || category === activeValue || type === activeValue;
        var queryMatch = !q || text.indexOf(q) !== -1;
        var visible = chipMatch && queryMatch;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var qParam = params.get("q");
      if (qParam) {
        filterInput.value = qParam;
      }
      filterInput.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeValue = chip.getAttribute("data-filter-value") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        applyFilter();
      });
    });
    applyFilter();

    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      if (!video || !cover) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var prepared = false;
      var hlsInstance = null;

      function begin() {
        if (!stream) {
          return;
        }
        cover.classList.add("is-hidden");
        video.controls = true;
        if (!prepared) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            prepared = true;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            prepared = true;
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = stream;
            prepared = true;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      cover.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
