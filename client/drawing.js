const SIZE_MAP = {
  small: 4,
  medium: 8,
  large: 14,
  xlarge: 22
};

const TOOL_PRESETS = {
  pencil: { multiplier: 1, alpha: 1, composite: "source-over" },
  marker: { multiplier: 1.6, alpha: 0.35, composite: "source-over" },
  brush: { multiplier: 2.1, alpha: 0.9, composite: "source-over" },
  eraser: { multiplier: 2.4, alpha: 1, composite: "destination-out" }
};

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height
  };
}

function strokeFromSettings(tool, color, size) {
  const preset = TOOL_PRESETS[tool] ?? TOOL_PRESETS.pencil;
  const width = (SIZE_MAP[size] ?? SIZE_MAP.medium) * preset.multiplier;
  return {
    tool,
    color,
    size,
    width,
    alpha: preset.alpha,
    composite: preset.composite,
    points: []
  };
}

function drawStroke(ctx, stroke) {
  if (!stroke || !stroke.points?.length) return;

  ctx.save();
  ctx.globalAlpha = stroke.alpha ?? 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.width ?? 8;
  ctx.strokeStyle = stroke.color ?? "#2d2a32";
  ctx.fillStyle = stroke.color ?? "#2d2a32";
  ctx.globalCompositeOperation = stroke.composite ?? "source-over";

  if (stroke.points.length === 1) {
    ctx.beginPath();
    ctx.arc(stroke.points[0].x, stroke.points[0].y, (stroke.width ?? 8) / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let index = 1; index < stroke.points.length; index += 1) {
    const point = stroke.points[index];
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
  ctx.restore();
}

export function createDrawingBoard({
  canvas,
  onPreviewStart,
  onPreviewPoint,
  onCommit
}) {
  const ctx = canvas.getContext("2d");
  let enabled = false;
  let tool = "pencil";
  let color = "#2d2a32";
  let size = "medium";
  let strokes = [];
  let currentStroke = null;
  let remotePreview = null;
  let lastPreviewSent = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fffaf2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = "rgba(77, 55, 37, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 40; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();

    strokes.forEach((stroke) => drawStroke(ctx, stroke));
    if (remotePreview) drawStroke(ctx, remotePreview);
    if (currentStroke) drawStroke(ctx, currentStroke);
  }

  function finishStroke() {
    if (!currentStroke || currentStroke.points.length === 0) {
      currentStroke = null;
      render();
      return;
    }

    strokes = [...strokes, currentStroke];
    onCommit?.(currentStroke);
    currentStroke = null;
    render();
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (!enabled) return;
    canvas.setPointerCapture(event.pointerId);
    currentStroke = strokeFromSettings(tool, color, size);
    const point = getPoint(canvas, event);
    currentStroke.points.push(point);
    lastPreviewSent = performance.now();
    onPreviewStart?.({
      tool: currentStroke.tool,
      color: currentStroke.color,
      size: currentStroke.size,
      width: currentStroke.width,
      alpha: currentStroke.alpha,
      composite: currentStroke.composite,
      point
    });
    render();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!enabled || !currentStroke) return;
    const point = getPoint(canvas, event);
    const lastPoint = currentStroke.points[currentStroke.points.length - 1];
    if (distance(point, lastPoint) < 1.2) return;
    currentStroke.points.push(point);
    if (performance.now() - lastPreviewSent > 24) {
      onPreviewPoint?.({ point });
      lastPreviewSent = performance.now();
    }
    render();
  });

  canvas.addEventListener("pointerup", finishStroke);
  canvas.addEventListener("pointercancel", finishStroke);
  canvas.addEventListener("pointerleave", () => {
    if (currentStroke) {
      render();
    }
  });

  render();

  return {
    render,
    setEnabled(value) {
      enabled = value;
      canvas.classList.toggle("is-readonly", !value);
    },
    setTool(value) {
      tool = value;
    },
    setColor(value) {
      color = value;
    },
    setSize(value) {
      size = value;
    },
    setStrokes(nextStrokes) {
      strokes = nextStrokes.map((stroke) => ({ ...stroke, points: [...stroke.points] }));
      render();
    },
    startRemotePreview(payload) {
      remotePreview = {
        tool: payload.tool,
        color: payload.color,
        size: payload.size,
        width: payload.width,
        alpha: payload.alpha,
        composite: payload.composite,
        points: [payload.point]
      };
      render();
    },
    pushRemotePreviewPoint(payload) {
      if (!remotePreview) return;
      remotePreview.points.push(payload.point);
      render();
    },
    clearRemotePreview() {
      remotePreview = null;
      render();
    }
  };
}
