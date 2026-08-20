/* ==========================================================================
   Contact form on about.html / en/about.html. Posts to the /api/contact
   Pages Function. Messages are private (admin-only) - this script only
   ever submits, it never lists anything back to the visitor.
   ========================================================================== */

(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const IS_EN = document.documentElement.lang === "en";
  const API_URL = "/api/contact";
  const statusEl = document.getElementById("contact-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.classList.remove("error");
    }

    const formData = new FormData(form);
    const payload = {
      message: formData.get("message"),
      email: formData.get("email"),
      website: formData.get("website"),
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 429) {
        if (statusEl) {
          statusEl.textContent = IS_EN
            ? "Today's submission limit has been reached. Please try again tomorrow."
            : "오늘 등록 가능한 문의 수를 초과했습니다. 내일 다시 시도해주세요.";
          statusEl.classList.add("error");
        }
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      form.reset();
      if (statusEl) statusEl.textContent = IS_EN ? "Your message has been sent. Thank you!" : "문의가 접수되었습니다. 감사합니다!";
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = IS_EN
          ? "Couldn't send your message. Please try again."
          : "문의 전송에 실패했습니다. 다시 시도해주세요.";
        statusEl.classList.add("error");
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
