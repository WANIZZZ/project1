/* ==========================================================================
   Guide article catalog for guides.html / en/guides.html.
   To add a new guide: append an entry here (with a data-pixel-icon name
   from js/game-tools.js's ICONS map) and create <slug>.html + en/<slug>.html
   following guide-sprite-size.html's pattern.
   ========================================================================== */

(function () {
  "use strict";

  window.GUIDES_LIST = [
    {
      slug: "guide-sprite-size",
      ko: "픽셀 아트 스프라이트 사이즈 정하는 법",
      en: "How to Choose Your Pixel Art Sprite Size",
      descKo: "16x16부터 96x96까지, 캐릭터·타일맵·아이콘에 맞는 스프라이트 크기를 고르는 실전 기준.",
      descEn: "From 16x16 to 96x96 — practical rules for picking the right sprite size for characters, tilemaps, and icons.",
      page: "guide-sprite-size.html",
      icon: "blocks",
    },
    {
      slug: "guide-engine-comparison",
      ko: "인디 게임 엔진 선택 가이드: Godot vs Unity vs Construct 3",
      en: "Indie Game Engine Guide: Godot vs Unity vs Construct 3",
      descKo: "학습 곡선, 수익 구조, 배포 환경까지 세 엔진을 실제 기준으로 비교합니다.",
      descEn: "Comparing three engines on learning curve, monetization, and platform support.",
      page: "guide-engine-comparison.html",
      icon: "gear",
    },
    {
      slug: "guide-free-assets",
      ko: "무료 게임 에셋 사이트 총정리와 저작권 주의사항",
      en: "Free Game Asset Sites and Licensing Pitfalls to Avoid",
      descKo: "그래픽·사운드·폰트 에셋을 어디서 구하고, 라이선스는 어떻게 확인해야 하는지 정리했습니다.",
      descEn: "Where to find free graphics, sound, and font assets — and how to check the license before you use them.",
      page: "guide-free-assets.html",
      icon: "bubble",
    },
  ];
})();
