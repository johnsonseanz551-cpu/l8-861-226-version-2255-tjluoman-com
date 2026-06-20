(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    play();
  }

  function initSearch() {
    var panel = document.querySelector('[data-search-page]');
    if (!panel) {
      return;
    }
    var input = panel.querySelector('[data-search-input]');
    var category = panel.querySelector('[data-search-category]');
    var clear = panel.querySelector('[data-search-clear]');
    var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-search]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function filter() {
      var keyword = normalize(input ? input.value : '');
      var categoryKeyword = normalize(category ? category.value : '');
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedCategory = !categoryKeyword || haystack.indexOf(categoryKeyword) !== -1;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedCategory));
      });
    }

    if (input) {
      input.addEventListener('input', filter);
    }
    if (category) {
      category.addEventListener('change', filter);
    }
    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (category) {
          category.value = '';
        }
        filter();
      });
    }
    filter();
  }

  function initPlayer() {
    var video = document.querySelector('[data-video-url]');
    var button = document.querySelector('[data-play-button]');
    var stage = document.querySelector('[data-player-stage]');
    var state = document.querySelector('[data-player-state]');
    if (!video || !button || !stage) {
      return;
    }
    var source = video.getAttribute('data-video-url');
    var loaded = false;
    var hlsInstance = null;

    function setState(text) {
      if (state) {
        state.textContent = text || '';
      }
    }

    function loadSource() {
      if (loaded || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setState('播放加载遇到问题，请稍后重试');
          }
        });
      } else {
        video.src = source;
      }
    }

    function start() {
      loadSource();
      stage.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          stage.classList.remove('is-playing');
          setState('点击播放按钮开始观看');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('play', function () {
      stage.classList.add('is-playing');
      setState('');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        stage.classList.remove('is-playing');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
