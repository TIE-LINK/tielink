(function () {
  "use strict";

  /**
   * chotto.ai connection test helper.
   * Reuses the existing POST /api/providers/test endpoint.
   *
   * Usage from app.js or other scripts:
   *   window.TielinkChottoTest.testChottoAi(apiKey).then(function(result) { ... });
   */

  var CHOTTO_BASE_URL = "https://api.chotto.ai";

  function testConnection(apiKey) {
    var payload = {
      baseUrl: CHOTTO_BASE_URL,
      apiKey: apiKey || "",
      authScheme: "bearer",
      apiFormat: "anthropic",
      models: {
        default: "claude-sonnet-4-6",
      },
    };

    return fetch("/api/providers/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        return {
          success: data.success || data.ok || false,
          latency: data.latency || data.duration || null,
          error: data.error || null,
          raw: data,
        };
      })
      .catch(function (err) {
        return { success: false, latency: null, error: err.message };
      });
  }

  function formatLatency(ms) {
    if (ms == null) return "--";
    if (ms < 1000) return Math.round(ms) + "ms";
    return (ms / 1000).toFixed(1) + "s";
  }

  window.TielinkChottoTest = {
    testConnection: testConnection,
    formatLatency: formatLatency,
    CHOTTO_BASE_URL: CHOTTO_BASE_URL,
  };
})();
