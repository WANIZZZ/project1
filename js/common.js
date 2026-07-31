/* ==========================================================================
   Shared header/footer/nav for every page (ko root pages + /en pages).
   Single source of truth: to add a new tool page, add one entry to NAV_TOOLS
   and create <page>.html + en/<page>.html following the existing pattern.
   ========================================================================== */

(function () {
  "use strict";

  const LANG = document.documentElement.lang === "en" ? "en" : "ko";
  const IS_EN = LANG === "en";
  const ROOT_PREFIX = IS_EN ? "../" : "";

  const SITE_NAME = IS_EN ? "PixelCraft Studio" : "픽셀크래프트 스튜디오";

  const NAV_TOOLS = [
    { file: "index.html", ko: "이미지 크기 변경", en: "Resize Image" },
  ];

  const NAV_EXTRA = [
    { file: "pixel-gallery.html", ko: "픽셀 이미지 추천", en: "Pixel Image Picks" },
    { file: "game-tools.html", ko: "게임 제작 툴 소개", en: "Game-Making Tools" },
    { file: "about.html", ko: "사이트 소개", en: "About" },
  ];

  function label(item) {
    return IS_EN ? item.en : item.ko;
  }

  function currentFileName() {
    const last = location.pathname.split("/").pop();
    return last && last.length ? last : "index.html";
  }

  function buildHeaderHtml() {
    const current = currentFileName();
    const otherLangHref = IS_EN ? "../" + current : "en/" + current;

    const navLinks = NAV_TOOLS.concat(NAV_EXTRA)
      .map((item) => {
        const active = current === item.file ? " active" : "";
        return `<a class="nav-link${active}" href="${ROOT_PREFIX}${item.file}">${label(item)}</a>`;
      })
      .join("");

    return `
      <div class="header-inner">
        <a class="brand" href="${ROOT_PREFIX}index.html">
          <span class="brand-mark" aria-hidden="true">\u{1F7E9}</span>
          <span class="brand-name">${SITE_NAME}</span>
        </a>
        <button id="nav-toggle" class="nav-toggle" type="button" aria-label="${IS_EN ? "Toggle menu" : "메뉴 열기"}" aria-expanded="false">☰</button>
        <nav class="site-nav" aria-label="${IS_EN ? "Tools" : "도구 메뉴"}">
          ${navLinks}
        </nav>
        <a class="lang-switch" href="${otherLangHref}" hreflang="${IS_EN ? "ko" : "en"}">${IS_EN ? "한국어" : "English"}</a>
      </div>
    `;
  }

  function buildFooterHtml() {
    const year = new Date().getFullYear();
    const note = IS_EN
      ? `© ${year} ${SITE_NAME}. All image processing runs locally in your browser — nothing is ever uploaded to a server.`
      : `© ${year} ${SITE_NAME}. 모든 이미지 처리는 브라우저 안에서만 실행되며, 서버로 전송되지 않습니다.`;

    return `
      <div class="footer-inner">
        <p class="footer-brand">${SITE_NAME}</p>
        <nav class="footer-nav" aria-label="${IS_EN ? "Site links" : "사이트 링크"}">
          <a href="${ROOT_PREFIX}index.html">${IS_EN ? "Home" : "홈"}</a>
          <a href="${ROOT_PREFIX}about.html">${IS_EN ? "About" : "사이트 소개"}</a>
          <a href="${ROOT_PREFIX}privacy.html">${IS_EN ? "Privacy Policy" : "개인정보처리방침"}</a>
        </nav>
        <p class="footer-note">${note}</p>
      </div>
    `;
  }

  function init() {
    const headerEl = document.getElementById("site-header");
    const footerEl = document.getElementById("site-footer");
    if (headerEl) headerEl.innerHTML = buildHeaderHtml();
    if (footerEl) footerEl.innerHTML = buildFooterHtml();

    if (window.PixelCraftBackground) {
      window.PixelCraftBackground.mount();
    }

    const toggle = document.getElementById("nav-toggle");
    const nav = document.querySelector(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
