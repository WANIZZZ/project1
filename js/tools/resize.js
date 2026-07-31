/* ==========================================================================
   Image resize tool - runs entirely client-side (no uploads to any server).
   Only active on pages that contain #drop-zone (index.html / en/index.html).
   ========================================================================== */

(function () {
  "use strict";

  const IS_EN = document.documentElement.lang === "en";
  const t = (ko, en) => (IS_EN ? en : ko);

  const dropZone = document.getElementById("drop-zone");
  if (!dropZone) return;

  const fileInput = document.getElementById("file-input");
  const workspace = document.getElementById("tool-workspace");
  const canvas = document.getElementById("preview-canvas");
  const ctx = canvas.getContext("2d");
  const widthInput = document.getElementById("width-input");
  const heightInput = document.getElementById("height-input");
  const lockCheckbox = document.getElementById("lock-aspect");
  const scaleButtons = document.querySelectorAll("[data-scale]");
  const downloadBtn = document.getElementById("download-btn");
  const resetBtn = document.getElementById("reset-btn");
  const statusEl = document.getElementById("tool-status");
  const metaEl = document.getElementById("tool-meta");

  const MAX_FILE_MB = 25;

  const state = {
    image: null,
    originalWidth: 0,
    originalHeight: 0,
    originalSizeKB: 0,
    mimeType: "image/png",
    fileBaseName: "image",
  };

  function setStatus(message, isError) {
    statusEl.textContent = message || "";
    statusEl.classList.toggle("error", Boolean(isError));
  }

  function formatKB(bytes) {
    return Math.max(1, Math.round(bytes / 1024));
  }

  function openFileDialog() {
    fileInput.click();
  }

  dropZone.addEventListener("click", openFileDialog);
  dropZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFileDialog();
    }
  });

  ["dragenter", "dragover"].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
    });
  });

  dropZone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      setStatus(t("이미지 파일만 업로드할 수 있어요.", "Please upload an image file."), true);
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setStatus(
        t(`파일 용량은 ${MAX_FILE_MB}MB 이하만 지원해요.`, `File size must be under ${MAX_FILE_MB}MB.`),
        true
      );
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      state.image = img;
      state.originalWidth = img.naturalWidth;
      state.originalHeight = img.naturalHeight;
      state.originalSizeKB = formatKB(file.size);
      state.mimeType = file.type || "image/png";
      state.fileBaseName = file.name.replace(/\.[^.]+$/, "") || "image";

      widthInput.value = state.originalWidth;
      heightInput.value = state.originalHeight;

      workspace.hidden = false;
      renderPreview();
      setStatus("");
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setStatus(
        t("이미지를 불러오지 못했어요. 다른 파일로 시도해 주세요.", "Couldn't load this image. Please try another file."),
        true
      );
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function getTargetSize() {
    const width = Math.max(1, parseInt(widthInput.value, 10) || state.originalWidth || 1);
    const height = Math.max(1, parseInt(heightInput.value, 10) || state.originalHeight || 1);
    return { width, height };
  }

  function updateMeta() {
    const target = getTargetSize();
    metaEl.innerHTML = `
      <span><strong>${t("원본", "Original")}:</strong> ${state.originalWidth}×${state.originalHeight}px · ${state.originalSizeKB}KB</span>
      <span><strong>${t("변경 후", "Target")}:</strong> ${target.width}×${target.height}px</span>
    `;
  }

  function renderPreview() {
    if (!state.image) return;
    const { width, height } = getTargetSize();
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(state.image, 0, 0, width, height);
    updateMeta();
  }

  function onWidthChange() {
    if (lockCheckbox.checked && state.originalWidth) {
      const ratio = state.originalHeight / state.originalWidth;
      const w = Math.max(1, parseInt(widthInput.value, 10) || 1);
      heightInput.value = Math.round(w * ratio);
    }
    renderPreview();
  }

  function onHeightChange() {
    if (lockCheckbox.checked && state.originalHeight) {
      const ratio = state.originalWidth / state.originalHeight;
      const h = Math.max(1, parseInt(heightInput.value, 10) || 1);
      widthInput.value = Math.round(h * ratio);
    }
    renderPreview();
  }

  widthInput.addEventListener("input", onWidthChange);
  heightInput.addEventListener("input", onHeightChange);

  scaleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.image) return;
      const percent = parseInt(btn.getAttribute("data-scale"), 10) / 100;
      widthInput.value = Math.max(1, Math.round(state.originalWidth * percent));
      heightInput.value = Math.max(1, Math.round(state.originalHeight * percent));
      renderPreview();
    });
  });

  downloadBtn.addEventListener("click", () => {
    if (!state.image) return;
    const { width, height } = getTargetSize();
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setStatus(t("다운로드용 이미지를 만들지 못했어요.", "Couldn't create the image for download."), true);
          return;
        }
        let ext = (state.mimeType.split("/")[1] || "png").toLowerCase();
        if (ext === "jpeg") ext = "jpg";
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${state.fileBaseName}-${width}x${height}.${ext}`;
        link.click();
        URL.revokeObjectURL(link.href);
        setStatus(t("다운로드를 시작했어요.", "Download started."));
      },
      state.mimeType,
      0.92
    );
  });

  resetBtn.addEventListener("click", () => {
    state.image = null;
    fileInput.value = "";
    workspace.hidden = true;
    setStatus("");
  });
})();
