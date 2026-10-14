/**
 * @name mermaid.ts
 * @description Advanced client-side Mermaid diagram rendering utility with full-resolution
 * display, pan-and-drag viewport, zoom controls, and fullscreen lightbox modal.
 */

let isMermaidInitialized = false;

/**
 * Initializes and configures the Mermaid library
 */
async function getMermaidInstance() {
  const { default: mermaid } = await import("mermaid");
  if (!isMermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        darkMode: true,
        fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
        fontSize: "13px",
        background: "transparent",
        mainBkg: "#071711",
        nodeBorder: "#18c785",
        primaryColor: "#0b251a",
        primaryTextColor: "#f1f5f9",
        primaryBorderColor: "rgba(24, 199, 133, 0.7)",
        lineColor: "#52b788",
        secondaryColor: "#051810",
        secondaryBorderColor: "rgba(117, 230, 178, 0.4)",
        secondaryTextColor: "#f1f5f9",
        tertiaryColor: "#030e09",
        tertiaryBorderColor: "rgba(117, 230, 178, 0.2)",
        tertiaryTextColor: "#f1f5f9",
        clusterBkg: "rgba(8, 26, 19, 0.75)",
        clusterBorder: "rgba(24, 199, 133, 0.35)",
        defaultLinkColor: "#52b788",
        titleColor: "#18c785",
        edgeLabelBackground: "#06130e",
        nodeTextColor: "#f1f5f9",
        // Sequence diagram variables
        actorBkg: "#0b251a",
        actorBorder: "#18c785",
        actorTextColor: "#f1f5f9",
        actorLineColor: "#52b788",
        signalColor: "#75e6b2",
        signalTextColor: "#f1f5f9",
        labelBoxBkgColor: "#06130e",
        labelBoxBorderColor: "rgba(24, 199, 133, 0.5)",
        labelTextColor: "#f1f5f9",
        loopTextColor: "#f1f5f9",
        noteBkgColor: "#132b20",
        noteBorderColor: "#facc15",
        noteTextColor: "#fef08a",
        activationBkgColor: "#0f3824",
        activationBorderColor: "#18c785",
        sequenceNumberColor: "#050b09",
      },
      sequence: {
        diagramMarginX: 24,
        diagramMarginY: 24,
        actorMargin: 50,
        width: 150,
        height: 46,
        boxMargin: 12,
        boxTextMargin: 6,
        noteMargin: 12,
        messageMargin: 38,
        mirrorActors: true,
        useMaxWidth: false,
      },
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: "basis",
      },
      securityLevel: "loose",
    });
    isMermaidInitialized = true;
  }
  return mermaid;
}

/**
 * Creates or gets the global lightbox modal for fullscreen diagram viewing
 */
function getGlobalLightboxModal() {
  let modal = document.getElementById("mermaid-global-modal") as HTMLElement | null;
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "mermaid-global-modal";
    modal.className = "mermaid-modal-backdrop";
    modal.innerHTML = `
      <div class="mermaid-modal-header">
        <div class="mermaid-modal-title">
          <i class="fa-solid fa-diagram-project"></i>
          <span>SƠ ĐỒ KIẾN TRÚC HỆ THỐNG / ARCHITECTURE DIAGRAM</span>
        </div>
        <div class="mermaid-toolbar-right">
          <span class="mermaid-zoom-label" id="mermaid-modal-zoom-label">100%</span>
          <button type="button" class="mermaid-btn" id="mermaid-modal-btn-zoom-out" title="Thu nhỏ (Zoom Out)">
            <i class="fa-solid fa-minus"></i>
          </button>
          <button type="button" class="mermaid-btn" id="mermaid-modal-btn-reset" title="Kích thước gốc (1:1)">
            <span>1:1</span>
          </button>
          <button type="button" class="mermaid-btn" id="mermaid-modal-btn-zoom-in" title="Phóng to (Zoom In)">
            <i class="fa-solid fa-plus"></i>
          </button>
          <button type="button" class="mermaid-btn" id="mermaid-modal-btn-fit" title="Thu vừa màn hình">
            <i class="fa-solid fa-arrows-to-eye"></i>
          </button>
          <button type="button" class="mermaid-btn" id="mermaid-modal-btn-close" title="Đóng (Esc)" style="border-color: rgba(239, 68, 68, 0.4); color: #f87171;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
      <div class="mermaid-modal-viewport" id="mermaid-modal-viewport">
        <div class="mermaid-modal-content" id="mermaid-modal-content"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector("#mermaid-modal-btn-close");
    const viewport = modal.querySelector("#mermaid-modal-viewport") as HTMLElement;

    const closeModal = () => {
      modal?.classList.remove("is-open");
      document.body.style.overflow = "";
      const content = modal?.querySelector("#mermaid-modal-content");
      if (content) content.innerHTML = "";
    };

    closeBtn?.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target === viewport) {
        closeModal();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("is-open")) {
        closeModal();
      }
    });

    // Drag-to-pan in modal
    setupDragToPan(viewport);
  }
  return modal;
}

/**
 * Sets up mouse drag-to-pan on any scrollable viewport
 */
function setupDragToPan(viewport: HTMLElement) {
  let isDown = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;

  viewport.addEventListener("mousedown", (e: MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("a, button, input")) return;

    isDown = true;
    viewport.classList.add("is-dragging");
    startX = e.pageX - viewport.offsetLeft;
    startY = e.pageY - viewport.offsetTop;
    scrollLeft = viewport.scrollLeft;
    scrollTop = viewport.scrollTop;
  });

  window.addEventListener("mousemove", (e: MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - viewport.offsetLeft;
    const y = e.pageY - viewport.offsetTop;
    viewport.scrollLeft = scrollLeft - (x - startX);
    viewport.scrollTop = scrollTop - (y - startY);
  });

  window.addEventListener("mouseup", () => {
    if (isDown) {
      isDown = false;
      viewport.classList.remove("is-dragging");
    }
  });
}

/**
 * Parses SVG viewBox to determine natural width and height
 */
function getSvgNaturalDimensions(svgEl: SVGSVGElement): { width: number; height: number } {
  const viewBox = svgEl.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/);
    if (parts.length >= 4) {
      const width = parseFloat(parts[2]);
      const height = parseFloat(parts[3]);
      if (width > 0 && height > 0) {
        return { width, height };
      }
    }
  }

  // Fallback to clientWidth or style
  const widthAttr = parseFloat(svgEl.getAttribute("width") || "");
  const heightAttr = parseFloat(svgEl.getAttribute("height") || "");
  if (widthAttr > 0 && heightAttr > 0) {
    return { width: widthAttr, height: heightAttr };
  }

  return { width: 1000, height: 600 };
}

/**
 * Wraps rendered SVG into an interactive diagram card with controls and viewport
 */
function buildInteractiveCard(svgString: string, diagramIndex: number): HTMLElement {
  const card = document.createElement("div");
  card.className = "mermaid-diagram-card";
  card.id = `mermaid-card-${diagramIndex}`;

  card.innerHTML = `
    <div class="mermaid-toolbar">
      <div class="mermaid-toolbar-left">
        <span class="mermaid-badge">ARCHITECTURE DIAGRAM</span>
        <span class="mermaid-scroll-hint" style="display: none;" title="Dùng chuột kéo hoặc cuộn ngang để xem toàn bộ">
          <i class="fa-solid fa-arrows-left-right"></i>
          <span>Kéo hoặc cuộn ngang</span>
        </span>
      </div>
      <div class="mermaid-toolbar-right">
        <span class="mermaid-zoom-label">100%</span>
        <button type="button" class="mermaid-btn btn-zoom-out" title="Thu nhỏ (Zoom Out)">
          <i class="fa-solid fa-minus"></i>
        </button>
        <button type="button" class="mermaid-btn btn-reset" title="Kích thước gốc (1:1)">
          <span>1:1</span>
        </button>
        <button type="button" class="mermaid-btn btn-zoom-in" title="Phóng to (Zoom In)">
          <i class="fa-solid fa-plus"></i>
        </button>
        <button type="button" class="mermaid-btn btn-fit" title="Thu vừa khung nhìn">
          <i class="fa-solid fa-arrows-to-eye"></i>
        </button>
        <button type="button" class="mermaid-btn btn-fullscreen" title="Xem toàn màn hình (Fullscreen)">
          <i class="fa-solid fa-expand"></i>
        </button>
      </div>
    </div>
    <div class="mermaid-viewport" tabindex="0">
      <div class="mermaid-content">
        ${svgString}
      </div>
    </div>
  `;

  const viewport = card.querySelector(".mermaid-viewport") as HTMLElement;
  const content = card.querySelector(".mermaid-content") as HTMLElement;
  const svgEl = content.querySelector("svg") as SVGSVGElement | null;
  const scrollHint = card.querySelector(".mermaid-scroll-hint") as HTMLElement;
  const zoomLabel = card.querySelector(".mermaid-zoom-label") as HTMLElement;
  const btnZoomIn = card.querySelector(".btn-zoom-in") as HTMLButtonElement;
  const btnZoomOut = card.querySelector(".btn-zoom-out") as HTMLButtonElement;
  const btnReset = card.querySelector(".btn-reset") as HTMLButtonElement;
  const btnFit = card.querySelector(".btn-fit") as HTMLButtonElement;
  const btnFullscreen = card.querySelector(".btn-fullscreen") as HTMLButtonElement;

  if (!svgEl) return card;

  // Clear any inline style max-width imposed by Mermaid
  svgEl.style.maxWidth = "none";
  svgEl.style.height = "auto";

  const { width: naturalWidth } = getSvgNaturalDimensions(svgEl);

  let currentScale = 1.0;

  const updateCardScale = (scale: number) => {
    currentScale = Math.max(0.35, Math.min(scale, 3.0));
    const targetWidth = Math.round(naturalWidth * currentScale);
    svgEl.style.width = `${targetWidth}px`;
    zoomLabel.textContent = `${Math.round(currentScale * 100)}%`;

    requestAnimationFrame(() => {
      const isOverflowing = viewport.scrollWidth > viewport.clientWidth + 12;
      scrollHint.style.display = isOverflowing ? "inline-flex" : "none";
    });
  };

  // Set initial display:
  // Render at full natural width so text is 100% crisp and readable
  svgEl.style.width = `${naturalWidth}px`;
  requestAnimationFrame(() => {
    const isOverflowing = viewport.scrollWidth > viewport.clientWidth + 12;
    scrollHint.style.display = isOverflowing ? "inline-flex" : "none";
  });

  // Zoom In / Out / Reset
  btnZoomIn?.addEventListener("click", () => updateCardScale(currentScale + 0.15));
  btnZoomOut?.addEventListener("click", () => updateCardScale(currentScale - 0.15));
  btnReset?.addEventListener("click", () => updateCardScale(1.0));

  // Fit to Viewport
  btnFit?.addEventListener("click", () => {
    const availWidth = viewport.clientWidth - 40;
    if (availWidth > 0 && naturalWidth > 0) {
      const fitScale = Math.min(1.0, availWidth / naturalWidth);
      updateCardScale(fitScale);
    }
  });

  // Fullscreen Modal Open
  btnFullscreen?.addEventListener("click", () => {
    const modal = getGlobalLightboxModal();
    const modalContent = modal.querySelector("#mermaid-modal-content") as HTMLElement;
    const modalViewport = modal.querySelector("#mermaid-modal-viewport") as HTMLElement;
    const modalZoomLabel = modal.querySelector("#mermaid-modal-zoom-label") as HTMLElement;
    const modalBtnZoomIn = modal.querySelector("#mermaid-modal-btn-zoom-in") as HTMLButtonElement;
    const modalBtnZoomOut = modal.querySelector("#mermaid-modal-btn-zoom-out") as HTMLButtonElement;
    const modalBtnReset = modal.querySelector("#mermaid-modal-btn-reset") as HTMLButtonElement;
    const modalBtnFit = modal.querySelector("#mermaid-modal-btn-fit") as HTMLButtonElement;

    // Clone the SVG for the modal
    modalContent.innerHTML = svgString;
    const modalSvg = modalContent.querySelector("svg") as SVGSVGElement | null;
    if (!modalSvg) return;

    modalSvg.style.maxWidth = "none";
    modalSvg.style.height = "auto";

    let modalScale = 1.0;
    const updateModalScale = (scale: number) => {
      modalScale = Math.max(0.3, Math.min(scale, 3.5));
      modalSvg.style.width = `${Math.round(naturalWidth * modalScale)}px`;
      modalZoomLabel.textContent = `${Math.round(modalScale * 100)}%`;
    };

    updateModalScale(1.0);

    // Wire modal buttons
    modalBtnZoomIn.onclick = () => updateModalScale(modalScale + 0.15);
    modalBtnZoomOut.onclick = () => updateModalScale(modalScale - 0.15);
    modalBtnReset.onclick = () => updateModalScale(1.0);
    modalBtnFit.onclick = () => {
      const availW = modalViewport.clientWidth - 80;
      if (availW > 0 && naturalWidth > 0) {
        updateModalScale(availW / naturalWidth);
      }
    };

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  });

  // Setup drag-to-pan
  setupDragToPan(viewport);

  // Re-check scrollability on resize
  window.addEventListener("resize", () => {
    const isOverflowing = viewport.scrollWidth > viewport.clientWidth + 12;
    scrollHint.style.display = isOverflowing ? "inline-flex" : "none";
  });

  return card;
}

/**
 * Main function: finds and renders all Mermaid code blocks in the target container
 */
export async function initMermaidDiagrams(root: ParentNode = document): Promise<void> {
  const codeBlocks = root.querySelectorAll<HTMLElement>(
    'pre[data-language="mermaid"], pre.astro-code[data-language="mermaid"], pre:has(code.language-mermaid), pre code.language-mermaid, pre.language-mermaid'
  );

  if (!codeBlocks.length) return;

  try {
    const mermaid = await getMermaidInstance();
    const processedPres = new Set<HTMLElement>();

    for (let i = 0; i < codeBlocks.length; i++) {
      const target = codeBlocks[i];
      const pre = (target.tagName.toLowerCase() === "code" ? target.closest("pre") : target) as HTMLElement;
      if (!pre || processedPres.has(pre)) continue;
      processedPres.add(pre);

      const code = (pre.textContent || "").trim();
      if (!code) continue;

      const id = `mermaid-render-${i}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        const { svg } = await mermaid.render(id, code);
        const card = buildInteractiveCard(svg, i);
        pre.replaceWith(card);
      } catch (err) {
        console.error("Mermaid diagram render error:", err);
      }
    }
  } catch (err) {
    console.error("Failed to load mermaid library:", err);
  }
}
