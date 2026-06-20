(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
      body.classList.toggle('nav-open', menu.classList.contains('open'));
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (value) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters(root) {
    var list = root.querySelector('[data-card-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var empty = root.querySelector('[data-empty-tip]');
    var searchInput = root.querySelector('#searchInput') || root.querySelector('[data-local-filter] input');
    var categoryFilter = root.querySelector('#categoryFilter');
    var typeFilter = root.querySelector('#typeFilter');
    var yearFilter = root.querySelector('#yearFilter') || root.querySelector('[data-local-filter] select');
    var sortFilter = root.querySelector('#sortFilter');
    var query = normalize(searchInput && searchInput.value);
    var category = normalize(categoryFilter && categoryFilter.value);
    var type = normalize(typeFilter && typeFilter.value);
    var year = normalize(yearFilter && yearFilter.value);
    var shown = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-text'));
      var title = normalize(card.getAttribute('data-title'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var visible = true;

      if (query && text.indexOf(query) === -1 && title.indexOf(query) === -1) {
        visible = false;
      }
      if (category && cardCategory !== category) {
        visible = false;
      }
      if (type && cardType !== type) {
        visible = false;
      }
      if (year && cardYear !== year) {
        visible = false;
      }

      card.hidden = !visible;
      if (visible) {
        shown += 1;
      }
    });

    if (sortFilter) {
      var mode = sortFilter.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'year-desc') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }
        if (mode === 'year-asc') {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        }
        if (mode === 'title-asc') {
          return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-Hans-CN');
        }
        return 0;
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (empty) {
      empty.hidden = shown !== 0;
    }
  }

  var searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = searchRoot.querySelector('#searchInput');
    if (input && q) {
      input.value = q;
    }
    searchRoot.querySelectorAll('input, select').forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(searchRoot);
      });
      control.addEventListener('change', function () {
        applyFilters(searchRoot);
      });
    });
    applyFilters(searchRoot);
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (form) {
    var root = form.closest('main') || document;
    var select = form.querySelector('select');
    var list = root.querySelector('[data-card-list]');
    if (select && list) {
      var years = {};
      list.querySelectorAll('.movie-card').forEach(function (card) {
        var year = card.getAttribute('data-year');
        if (year) {
          years[year] = true;
        }
      });
      Object.keys(years).sort().reverse().forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      });
    }
    form.querySelectorAll('input, select').forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(root);
      });
      control.addEventListener('change', function () {
        applyFilters(root);
      });
    });
  });

  document.querySelectorAll('.video-player').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-trigger');
    var overlay = player.querySelector('.play-overlay');
    if (!video || !button) {
      return;
    }

    var streamUrl = video.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (ready || !streamUrl) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.controls = true;
      ready = true;
    }

    function playVideo() {
      prepareVideo();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      playVideo();
    });

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
