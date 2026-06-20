(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                play();
            });
        });
        show(0);
        play();
    }

    function setupLocalFilter() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-local-search]');
            var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
            var grid = document.querySelector('[data-card-grid]');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var typeValue = 'all';
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var typeText = (card.getAttribute('data-type') || '').toLowerCase();
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchType = typeValue === 'all' || typeText.indexOf(typeValue.toLowerCase()) !== -1;
                    card.classList.toggle('hidden-card', !(matchKeyword && matchType));
                });
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chips.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    chip.classList.add('active');
                    typeValue = chip.getAttribute('data-filter-value') || 'all';
                    apply();
                });
            });
        });
    }

    function cardTemplate(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a href="' + escapeHtml(item.page) + '" aria-label="观看' + escapeHtml(item.title) + '">' +
                '<div class="poster-wrap">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="duration">' + escapeHtml(item.duration) + '</span>' +
                '</div>' +
                '<div class="card-body">' +
                    '<h2>' + escapeHtml(item.title) + '</h2>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="card-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</a>' +
        '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var form = document.querySelector('[data-search-page-form]');
        var results = document.querySelector('[data-search-results]');
        var heading = document.querySelector('[data-search-heading]');
        if (!form || !results || typeof SITE_SEARCH_DATA === 'undefined') {
            return;
        }
        var input = form.querySelector('input[name="q"]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }
        function render(keyword) {
            var q = keyword.trim().toLowerCase();
            var items = SITE_SEARCH_DATA.filter(function (item) {
                if (!q) {
                    return true;
                }
                return [item.title, item.oneLine, item.region, item.type, item.year, (item.tags || []).join(' ')]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(q) !== -1;
            }).slice(0, 120);
            results.innerHTML = items.map(cardTemplate).join('');
            if (heading) {
                heading.textContent = q ? '搜索结果' : '推荐内容';
            }
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render(input ? input.value : '');
        });
        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
        if (initial) {
            render(initial);
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (frame) {
            var video = frame.querySelector('video[data-stream]');
            var button = frame.querySelector('.play-layer');
            var prepared = false;
            var hlsInstance = null;
            if (!video || !button) {
                return;
            }
            function prepare() {
                if (prepared) {
                    return;
                }
                var source = video.getAttribute('data-stream');
                if (!source) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                prepared = true;
            }
            function start() {
                prepare();
                frame.classList.add('is-playing');
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        frame.classList.remove('is-playing');
                    });
                }
            }
            button.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupLocalFilter();
        setupSearchPage();
        setupPlayers();
    });
})();
