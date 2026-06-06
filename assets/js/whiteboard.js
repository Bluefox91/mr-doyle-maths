// whiteboard.js
document.addEventListener("DOMContentLoaded", () => {
  // =======================
  // ELEMENTS
  // =======================
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const toolbar = document.getElementById("toolbar");
  const strokePicker = document.getElementById("stroke-color-picker");
  const backgroundPicker = document.getElementById("background-color-picker");
  const paintBtn = document.getElementById("paint");
  const eraserBtn = document.getElementById("eraser");
  const strokeSlider = document.getElementById("stroke-size");

  const clearBtn = document.getElementById("clear-canvas");
  const undoBtn = document.getElementById("undo-btn");

  const rulerBtn = document.getElementById("ruler-btn");
  const ruler = document.getElementById("ruler");
  const rulerImg = document.getElementById("ruler-img");
  const rotateHandle = document.getElementById("rotate-handle");

  const handleTop = document.getElementById("line-handle-top");

  // =======================
  // STATE
  // =======================
  let drawing = false;
  let eraser = false;

  let isDraggingToolbar = false;
  let toolbarOffsetX, toolbarOffsetY;

  let isRulerDragging = false;
  let rulerOffsetX, rulerOffsetY;

  let isRotating = false;
  let currentRotation = 0;

  let isHandleDrawing = false;
  let lastX = null;
  let lastY = null;

  const undoStack = [];
  const maxUndo = 50;

  // =======================
  // CANVAS
  // =======================
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  ctx.lineCap = "round";

  backgroundPicker.addEventListener(
    "change",
    (e) => (canvas.style.backgroundColor = e.target.value),
  );

  // =======================
  // SLIDER
  // =======================
  function updateSliderFill() {
    const percent =
      ((strokeSlider.value - strokeSlider.min) /
        (strokeSlider.max - strokeSlider.min)) *
      100;

    strokeSlider.style.background = `linear-gradient(
      to right,
      #2C5282 0%,
      #2C5282 ${percent}%,
      #2f2f2f ${percent}%,
      #2f2f2f 100%
    )`;
  }
  updateSliderFill();
  strokeSlider.addEventListener("input", updateSliderFill);

  // =======================
  // TOOLBAR DRAG
  // =======================
  toolbar.addEventListener("mousedown", (e) => {
    if (e.target.closest("input, button")) return;

    isDraggingToolbar = true;
    toolbarOffsetX = e.pageX - toolbar.offsetLeft;
    toolbarOffsetY = e.pageY - toolbar.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDraggingToolbar) return;

    toolbar.style.left = `${e.pageX - toolbarOffsetX}px`;
    toolbar.style.top = `${e.pageY - toolbarOffsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDraggingToolbar = false;
  });

  // =======================
  // TOOLS
  // =======================
  paintBtn.onclick = () => {
    eraser = false;
    paintBtn.classList.add("active");
    eraserBtn.classList.remove("active");
  };

  eraserBtn.onclick = () => {
    eraser = true;
    eraserBtn.classList.add("active");
    paintBtn.classList.remove("active");
  };

  paintBtn.classList.add("active");

  clearBtn.onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

  undoBtn.onclick = () => {
    if (!undoStack.length) return;

    undoStack.pop();

    undoStack.length
      ? ctx.putImageData(undoStack[undoStack.length - 1], 0, 0)
      : ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // =======================
  // RULER TOGGLE
  // =======================
  rulerBtn.onclick = () => {
    ruler.style.display =
      getComputedStyle(ruler).display === "none" ? "block" : "none";

    if (ruler.style.display === "block") {
      const rect = canvas.getBoundingClientRect();
      ruler.style.left = `${rect.width / 2 - ruler.offsetWidth / 2}px`;
      ruler.style.top = `${rect.height / 2 - ruler.offsetHeight / 2}px`;
    }
  };

  // =======================
  // RULER DRAG
  // =======================
  ruler.addEventListener("mousedown", (e) => {
    if (e.target === rulerImg) {
      isRulerDragging = true;
      rulerOffsetX = e.pageX - ruler.offsetLeft;
      rulerOffsetY = e.pageY - ruler.offsetTop;
    }

    if (e.target.closest("#rotate-handle")) {
      isRotating = true;
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isRulerDragging) {
      ruler.style.left = `${e.pageX - rulerOffsetX}px`;
      ruler.style.top = `${e.pageY - rulerOffsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isRulerDragging = false;
  });

  // =======================
  // ROTATION
  // =======================
  document.addEventListener("mousemove", (e) => {
    if (!isRotating) return;

    const rect = rulerImg.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    currentRotation = angle * (180 / Math.PI);

    ruler.style.transform = `rotate(${currentRotation}deg)`;
  });

  document.addEventListener("mouseup", () => {
    isRotating = false;
  });

  // =======================
  // FREE DRAW
  // =======================
  canvas.addEventListener("pointerdown", (e) => {
    if (isHandleDrawing) return;

    drawing = true;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!drawing || isHandleDrawing) return;

    const rect = canvas.getBoundingClientRect();

    ctx.lineWidth = strokeSlider.value;
    ctx.globalCompositeOperation = eraser ? "destination-out" : "source-over";

    if (!eraser) ctx.strokeStyle = strokePicker.value;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  });

  canvas.addEventListener("pointerup", () => {
    if (!drawing) return;

    drawing = false;

    if (undoStack.length >= maxUndo) undoStack.shift();
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  });

  // =======================
  // 🔥 TOP HANDLE DRAW (PIXEL PERFECT FIX)
  // =======================
  handleTop.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    isHandleDrawing = true;
    lastX = null;
    lastY = null;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isHandleDrawing) return;

    const canvasRect = canvas.getBoundingClientRect();
    const rect = rulerImg.getBoundingClientRect();

    const cx = rect.left - canvasRect.left + rect.width / 2;
    const cy = rect.top - canvasRect.top + rect.height / 2;

    const angle = currentRotation * (Math.PI / 180);

    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    // 🔥 TRUE SCREEN-SPACE PERPENDICULAR
    let px = -dy;
    let py = dx;

    const len = Math.hypot(px, py);
    px /= len;
    py /= len;

    // 🔥 get ACTUAL unrotated height (true thickness)
    const halfHeight = rulerImg.offsetHeight / 2;
    
    // 🔥 PERFECT EDGE LOCK
    const EDGE_OFFSET = -halfHeight;

    const mx = e.clientX - canvasRect.left - cx;
    const my = e.clientY - canvasRect.top - cy;

    const dot = mx * dx + my * dy;

    const x = cx + dot * dx + EDGE_OFFSET * px;
    const y = cy + dot * dy + EDGE_OFFSET * py;

    // 🔥 HANDLE FOLLOWS LINE
    const visualLeft = dot + rect.width / 2 - 8;
    handleTop.style.left = `${visualLeft}px`;

    if (lastX === null) {
      lastX = x;
      lastY = y;
      ctx.beginPath();
      ctx.moveTo(x, y);
      return;
    }

    ctx.lineWidth = strokeSlider.value;
    ctx.globalCompositeOperation = eraser ? "destination-out" : "source-over";

    if (!eraser) ctx.strokeStyle = strokePicker.value;

    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
  });

  document.addEventListener("mouseup", () => {
    if (isHandleDrawing) {
      isHandleDrawing = false;

      if (undoStack.length >= maxUndo) undoStack.shift();
      undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  });
});
