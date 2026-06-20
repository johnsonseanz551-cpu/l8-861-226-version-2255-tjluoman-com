(function () {
  const scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : new URL('./assets/site.js', window.location.href).href;
  const assetBase = new URL('.', scriptUrl).href;
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const hero = document.querySelector('.hero-carousel');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let active = 0;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(active + 1);
    }, 5000);
  }

  document.querySelectorAll('.horizontal-wrap').forEach(function (wrap) {
    const list = wrap.querySelector('.horizontal-list');
    if (!list) {
      return;
    }

    wrap.querySelectorAll('[data-scroll]').forEach(function (button) {
      button.addEventListener('click', function () {
        const direction = button.getAttribute('data-scroll') === 'left' ? -1 : 1;
        list.scrollBy({
          left: direction * 420,
          behavior: 'smooth'
        });
      });
    });
  });

  const query = new URLSearchParams(window.location.search).get('q') || '';
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.value = query;
  }

  const normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  const applyFilter = function () {
    const textInput = document.querySelector('.local-filter') || document.querySelector('.search-input');
    const typeFilter = document.querySelector('.type-filter');
    const keyword = normalize(textInput ? textInput.value : query);
    const selectedType = normalize(typeFilter ? typeFilter.value : '');
    const cards = Array.from(document.querySelectorAll('[data-search]'));
    const noResults = document.querySelector('.no-results');
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.getAttribute('data-search'));
      const matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchesType = !selectedType || haystack.indexOf(selectedType) !== -1;
      const shouldShow = matchesKeyword && matchesType;
      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.hidden = visible !== 0;
    }
  };

  document.querySelectorAll('.local-filter, .search-input, .type-filter').forEach(function (control) {
    control.addEventListener('input', applyFilter);
    control.addEventListener('change', applyFilter);
  });

  if (query || document.querySelector('.local-filter')) {
    applyFilter();
  }

  document.querySelectorAll('.js-player').forEach(function (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.js-play');

    if (!video || !button) {
      return;
    }

    const source = video.getAttribute('data-video');
    let started = false;

    const attach = async function () {
      if (started || !source) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        try {
          const module = await import(assetBase + 'hls.js');
          const Hls = module.H;
          if (Hls && Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
          } else {
            video.src = source;
          }
        } catch (error) {
          video.src = source;
        }
      }
    };

    const play = async function () {
      await attach();
      button.hidden = true;
      video.controls = true;
      try {
        await video.play();
      } catch (error) {
        button.hidden = false;
      }
    };

    button.addEventListener('click', function (event) {
      event.preventDefault();
      play();
    });

    video.addEventListener('click', function () {
      if (!started || video.paused) {
        play();
      }
    });
  });
})();
