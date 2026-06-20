(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  const searchForm = document.querySelector('[data-search-form]');
  if (searchForm) {
    const input = searchForm.querySelector('[data-search-input]');
    const category = searchForm.querySelector('[data-category-filter]');
    const year = searchForm.querySelector('[data-year-filter]');
    const region = searchForm.querySelector('[data-region-filter]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const empty = document.querySelector('[data-search-empty]');

    function clean(value) {
      return String(value || '').trim().toLowerCase();
    }

    function update() {
      const keyword = clean(input ? input.value : '');
      const selectedCategory = category ? category.value : '';
      const selectedYear = year ? year.value : '';
      const selectedRegion = region ? region.value : '';
      let shown = 0;

      cards.forEach(function (card) {
        const text = clean(card.getAttribute('data-search'));
        const cardCategory = card.getAttribute('data-category') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const cardRegion = card.getAttribute('data-region') || '';
        const matched = (!keyword || text.includes(keyword)) &&
          (!selectedCategory || cardCategory === selectedCategory) &&
          (!selectedYear || cardYear === selectedYear) &&
          (!selectedRegion || cardRegion === selectedRegion);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      searchForm.addEventListener(eventName, update);
    });
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      update();
    });
    update();
  }

  function initPlayer(wrapper) {
    if (wrapper.getAttribute('data-ready') === '1') {
      return;
    }

    const video = wrapper.querySelector('video');
    const stream = wrapper.getAttribute('data-stream');
    if (!video || !stream) {
      return;
    }

    wrapper.setAttribute('data-ready', '1');
    video.setAttribute('controls', 'controls');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      wrapper.hlsInstance = hls;
    } else {
      video.src = stream;
    }
  }

  function playFrom(wrapper) {
    const video = wrapper.querySelector('video');
    const overlay = wrapper.querySelector('[data-play]');
    initPlayer(wrapper);

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (video) {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (wrapper) {
    const overlay = wrapper.querySelector('[data-play]');

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playFrom(wrapper);
      });
    }

    wrapper.addEventListener('click', function (event) {
      if (event.target && event.target.tagName === 'VIDEO') {
        return;
      }
      playFrom(wrapper);
    });
  });
})();
