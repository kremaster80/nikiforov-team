/* Nikiforov Team — analytics consent. Replace METRIKA_ID after client confirmation. */
(() => {
  "use strict";
  const STORAGE_KEY = "nikiforov_team_cookie_choice_v1";
  const METRIKA_ID = "PASTE_METRIKA_COUNTER_ID";
  let metrikaStarted = false;
  let volatileChoice = null;

  function readChoice() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (saved && (saved.status === "accepted" || saved.status === "rejected")) return saved.status;
    } catch (_) { /* Private mode or disabled storage: no implicit consent. */ }
    return volatileChoice;
  }

  function saveChoice(status) {
    volatileChoice = status;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        status, version: 1, updatedAt: new Date().toISOString()
      }));
    } catch (_) { /* Keep the choice for this page only. */ }
  }

  function startMetrika() {
    if (metrikaStarted || !/^\d{5,12}$/.test(METRIKA_ID)) return;
    metrikaStarted = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    window.ym(Number(METRIKA_ID), "init", {
      clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false
    });
  }

  const banner = document.querySelector("[data-cookie-banner]");
  const preferences = document.querySelectorAll("[data-cookie-settings]");
  if (!banner) return;

  function openPreferences() {
    banner.hidden = false;
    banner.querySelector('[data-cookie-choice="accept"]')?.focus();
  }

  function choose(status) {
    const mustReload = metrikaStarted && status === "rejected";
    saveChoice(status);
    banner.hidden = true;
    if (status === "accepted") startMetrika();
    if (mustReload) window.location.reload(); // Stops a tag already running on this page.
  }

  banner.querySelector('[data-cookie-choice="accept"]')?.addEventListener("click", () => choose("accepted"));
  banner.querySelector('[data-cookie-choice="reject"]')?.addEventListener("click", () => choose("rejected"));
  preferences.forEach(btn => btn.addEventListener("click", openPreferences));

  const saved = readChoice();
  const showPreferences = new URLSearchParams(window.location.search).get("cookie-settings") === "1";
  banner.hidden = (saved === "accepted" || saved === "rejected") && !showPreferences;
  // A one-time preview link is useful for review; remove the flag so the banner
  // does not reappear on every reload once the visitor saves a preference.
  if (showPreferences) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("cookie-settings");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (_) { /* File preview/private browser: keep the banner usable. */ }
  }
  if (saved === "accepted") startMetrika();
  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) return;
    const updated = readChoice();
    if (updated === "rejected" && metrikaStarted) window.location.reload();
    else {
      banner.hidden = updated === "accepted" || updated === "rejected";
      if (updated === "accepted") startMetrika();
    }
  });
})();
