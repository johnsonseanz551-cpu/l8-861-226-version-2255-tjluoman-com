(function() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function() {
            panel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function(image) {
        image.addEventListener('error', function() {
            image.classList.add('is-missing');
        }, { once: true });
    });

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilters(root) {
        var grid = root || document.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var input = document.querySelector('.filter-input');
        var chips = document.querySelectorAll('[data-category-filter]');
        var selectedCategory = 'all';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function filter() {
            var query = normalize(input ? input.value : '');
            grid.querySelectorAll('[data-title]').forEach(function(card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.textContent
                ].join(' '));
                var category = card.getAttribute('data-category') || '';
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = selectedCategory === 'all' || category === selectedCategory;
                card.classList.toggle('is-hidden', !(matchQuery && matchCategory));
            });
        }

        chips.forEach(function(chip) {
            chip.addEventListener('click', function() {
                chips.forEach(function(item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                selectedCategory = chip.getAttribute('data-category-filter') || 'all';
                filter();
            });
        });

        if (input) {
            input.addEventListener('input', filter);
            var form = input.closest('form');
            if (form) {
                form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    filter();
                });
            }
        }

        filter();
    }

    applyFilters();

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
        var prev = slider.querySelector('[data-slide-prev]');
        var next = slider.querySelector('[data-slide-next]');
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5800);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    initHero();
})();

function initMoviePlayer(url) {
    var video = document.getElementById('moviePlayer');
    var trigger = document.getElementById('playTrigger');

    if (!video || !url) {
        return;
    }

    var ready = false;
    var hlsInstance = null;

    function attach() {
        if (ready) {
            return Promise.resolve();
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            return new Promise(function(resolve) {
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                    resolve();
                });
            });
        }

        video.src = url;
        return Promise.resolve();
    }

    function begin() {
        attach().then(function() {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {});
            }
        });
    }

    if (trigger) {
        trigger.addEventListener('click', begin);
    }

    video.addEventListener('play', function() {
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
    });

    video.addEventListener('click', function() {
        if (!ready || video.paused) {
            begin();
        }
    });

    window.addEventListener('beforeunload', function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
