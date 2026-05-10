(function () {
  "use strict";

  function buildDashboardCta() {
    var dashboard = document.getElementById("page-dashboard");
    if (!dashboard) return;

    /* Insert after the switch-board, before status-grid */
    var switchBoard = dashboard.querySelector(".switch-board");
    var statusGrid = dashboard.querySelector(".status-grid");
    if (!switchBoard) return;

    var banner = document.createElement("div");
    banner.className = "tielink-cta-banner";
    banner.innerHTML =
      '<div class="tielink-cta-banner-content">' +
      '<div class="tielink-cta-banner-text">' +
      '<strong>chotto.ai</strong>' +
      '<span>月額 ¥1,980〜 · ¥500 無料トライアル中</span>' +
      "</div>" +
      '<div class="tielink-cta-banner-actions">' +
      '<a class="btn btn-primary btn-sm" href="https://chotto.ai/sign-up?utm_source=tielink&utm_medium=dashboard" target="_blank" rel="noreferrer">' +
      '<i class="bi bi-box-arrow-up-right"></i> chotto.ai に登録' +
      "</a>" +
      '<a class="btn btn-outline-primary btn-sm" href="https://api.chotto.ai/console/keys" target="_blank" rel="noreferrer">' +
      '<i class="bi bi-key"></i> API Key を取得' +
      "</a>" +
      "</div>" +
      "</div>";

    if (statusGrid) {
      dashboard.insertBefore(banner, statusGrid);
    } else {
      dashboard.appendChild(banner);
    }
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        setTimeout(buildDashboardCta, 300);
      });
    } else {
      setTimeout(buildDashboardCta, 300);
    }
  }

  init();
})();
