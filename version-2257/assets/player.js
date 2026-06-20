(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector("video[data-src]");
    var button = shell.querySelector("[data-player-toggle]");
    var overlay = shell.querySelector("[data-player-overlay]");
    var source = video ? video.getAttribute("data-src") : "";
    var hls = null;
    var prepared = false;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.ErrorTypes) {
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        }
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
      prepared = true;
    }

    function playVideo() {
      prepare();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.muted = true;
          video.play();
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        playVideo();
      });
    }

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      shell.classList.remove("is-playing");
    });

    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("[data-player]").forEach(setupPlayer);
    });
  } else {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  }
})();
