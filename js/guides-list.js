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
    {
      slug: "guide-color-palette",
      ko: "픽셀 아트 색상 팔레트 정하는 법",
      en: "How to Choose a Pixel Art Color Palette",
      descKo: "색상 개수를 왜 제한해야 하는지부터 무료 팔레트 사이트 활용법까지 실전 기준으로 정리했습니다.",
      descEn: "Why limiting your color count matters, and how to use free palette sites — a practical starting point.",
      page: "guide-color-palette.html",
      icon: "prism",
    },
    {
      slug: "guide-walk-cycle",
      ko: "2D 캐릭터 걷기 애니메이션 기초",
      en: "2D Character Walk-Cycle Animation Basics",
      descKo: "몇 프레임으로 시작해야 하는지부터 무게중심과 발 접지까지, 첫 걷기 애니메이션을 위한 기초.",
      descEn: "From frame counts to weight shift and foot planting — the basics for your first walk cycle.",
      page: "guide-walk-cycle.html",
      icon: "flow",
    },
    {
      slug: "guide-launch-checklist",
      ko: "인디 게임 첫 출시 체크리스트 (itch.io / Steam)",
      en: "First Indie Game Launch Checklist (itch.io / Steam)",
      descKo: "스토어 페이지 준비물부터 출시 직후 대응까지, 첫 게임을 출시하기 전에 확인할 것들.",
      descEn: "From store page assets to what to watch right after launch — what to check before your first release.",
      page: "guide-launch-checklist.html",
      icon: "cube",
    },
  ];
})();
