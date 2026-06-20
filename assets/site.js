(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle("is-active", currentIndex === index);
            });
            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle("is-active", currentIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-search-input]");
        var region = panel.querySelector("[data-region-filter]");
        var type = panel.querySelector("[data-type-filter]");
        var year = panel.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }

        function apply() {
            var keyword = valueOf(input);
            var regionValue = valueOf(region);
            var typeValue = valueOf(type);
            var yearValue = valueOf(year);
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (regionValue && (card.getAttribute("data-region") || "").toLowerCase() !== regionValue) {
                    ok = false;
                }
                if (typeValue && (card.getAttribute("data-type") || "").toLowerCase() !== typeValue) {
                    ok = false;
                }
                if (yearValue && (card.getAttribute("data-year") || "").toLowerCase() !== yearValue) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, region, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var cover = player.querySelector("[data-player-cover]");
        var message = document.querySelector("[data-player-message]");
        var stream = player.getAttribute("data-stream");
        var hlsInstance = null;
        var loaded = false;

        function writeMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function attach() {
            if (!video || !stream || loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    play();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        writeMessage("播放遇到问题，请稍后再试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", play, { once: true });
            } else {
                writeMessage("播放遇到问题，请稍后再试");
            }
        }

        function play() {
            if (!video) {
                return;
            }
            player.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        }

        function start() {
            attach();
            play();
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    player.classList.remove("is-playing");
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
