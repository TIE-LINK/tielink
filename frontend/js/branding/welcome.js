(function () {
  "use strict";

  var WELCOME_DISMISSED_KEY = "tielink-welcome-dismissed";

  function isFirstLaunch() {
    try {
      return !localStorage.getItem(WELCOME_DISMISSED_KEY);
    } catch (e) {
      return true;
    }
  }

  function dismissWelcome() {
    try {
      localStorage.setItem(WELCOME_DISMISSED_KEY, "1");
    } catch (e) {
      /* ignore */
    }
  }

  function buildWelcomeOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "tielink-welcome-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Welcome to tielink");
    overlay.innerHTML =
      '<div class="tielink-welcome-card">' +
      '<img src="assets/icons/app-icon.svg" alt="tielink" class="tielink-welcome-logo" onerror="this.src=\'assets/app-icon.png\'">' +
      '<h1 class="tielink-welcome-title">tielink へようこそ</h1>' +
      '<p class="tielink-welcome-subtitle">Claude Desktop で chotto.ai を<br>3 秒で使い始めましょう</p>' +
      '<div class="tielink-welcome-actions">' +
      '<a class="btn btn-primary btn-lg tielink-welcome-btn-primary" href="https://chotto.ai/sign-up?utm_source=tielink&utm_medium=welcome" target="_blank" rel="noreferrer">' +
      '<i class="bi bi-box-arrow-up-right"></i> chotto.ai に登録（¥500 無料）' +
      "</a>" +
      '<button class="btn btn-outline-secondary btn-lg tielink-welcome-btn-skip" type="button">' +
      "すでにアカウントをお持ちの方" +
      "</button>" +
      "</div>" +
      "</div>";

    overlay.querySelector(".tielink-welcome-btn-skip").addEventListener("click", function () {
      dismissWelcome();
      overlay.remove();
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        /* allow closing by clicking background, but don't dismiss permanently */
        overlay.remove();
      }
    });

    return overlay;
  }

  function showWelcomeIfNeeded() {
    if (!isFirstLaunch()) return;

    /* Wait for the dashboard to be visible */
    var dashboard = document.getElementById("page-dashboard");
    if (!dashboard || !dashboard.classList.contains("active")) {
      /* Not on dashboard yet; wait for navigation event */
      window.addEventListener("cc:i18n", function handler() {
        window.removeEventListener("cc:i18n", handler);
        setTimeout(showWelcomeIfNeeded, 200);
      });
      return;
    }

    var overlay = buildWelcomeOverlay();
    document.body.appendChild(overlay);
  }

  /* Show after a short delay to let the UI settle */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(showWelcomeIfNeeded, 600);
    });
  } else {
    setTimeout(showWelcomeIfNeeded, 600);
  }
})();
