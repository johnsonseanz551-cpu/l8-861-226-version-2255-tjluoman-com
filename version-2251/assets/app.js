(function () {
  const toggle = document.querySelector('.mobile-toggle');
  const panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form[action="./search.html"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (input && input.value.trim() === '') {
        event.preventDefault();
      }
    });
  });

  const hero = document.querySelector('.hero-carousel');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let active = 0;
    const show = function (index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-card-filter]').forEach(function (input) {
    const target = document.querySelector(input.getAttribute('data-card-filter'));
    const empty = document.querySelector(input.getAttribute('data-empty-target') || '');
    if (!target) {
      return;
    }
    const cards = Array.from(target.querySelectorAll('.movie-card'));
    const filter = function () {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const matched = q === '' || text.indexOf(q) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible === 0 ? 'block' : 'none';
      }
    };
    input.addEventListener('input', filter);
    filter();
  });

  document.querySelectorAll('[data-sort-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      const grid = document.querySelector(button.getAttribute('data-sort-target'));
      if (!grid) {
        return;
      }
      const mode = button.getAttribute('data-sort-mode') || 'year';
      const cards = Array.from(grid.querySelectorAll('.movie-card'));
      cards.sort(function (a, b) {
        if (mode === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        if (mode === 'random') {
          return Math.random() - 0.5;
        }
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      document.querySelectorAll('[data-sort-target="' + button.getAttribute('data-sort-target') + '"]').forEach(function (btn) {
        btn.classList.toggle('is-active', btn === button);
      });
    });
  });

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    const video = shell.querySelector('video[data-video-url]');
    const overlay = shell.querySelector('.player-overlay');
    if (!video) {
      return;
    }
    const mediaUrl = video.getAttribute('data-video-url');
    let hlsInstance = null;
    const prepare = function () {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
      video.setAttribute('data-ready', '1');
    };
    const play = function () {
      prepare();
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  const searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && typeof MOVIE_INDEX !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const input = searchRoot.querySelector('input[name="q"]');
    const grid = searchRoot.querySelector('.search-results');
    const empty = searchRoot.querySelector('.search-empty');
    const title = searchRoot.querySelector('[data-query-title]');
    const initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    const render = function () {
      const q = input ? input.value.trim().toLowerCase() : initial.trim().toLowerCase();
      if (title) {
        title.textContent = q ? '搜索：' + (input ? input.value.trim() : initial) : '站内搜索';
      }
      if (!grid) {
        return;
      }
      const results = q ? MOVIE_INDEX.filter(function (movie) {
        return movie.search.indexOf(q) !== -1;
      }).slice(0, 240) : MOVIE_INDEX.slice(0, 80);
      grid.innerHTML = results.map(function (movie) {
        return '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-search="' + escapeHtml(movie.search) + '">' +
          '<span class="poster-wrap"><img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="play-badge">▶</span><span class="year-badge">' + escapeHtml(movie.year) + '</span></span>' +
          '<span class="card-body"><strong>' + escapeHtml(movie.title) + '</strong><em>' + escapeHtml(movie.oneLine) + '</em><span class="card-meta"><b>' + escapeHtml(movie.region) + '</b><i>' + escapeHtml(movie.type) + '</i></span></span>' +
          '</a>';
      }).join('');
      if (empty) {
        empty.style.display = results.length ? 'none' : 'block';
      }
    };
    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
