(() => {
  const canvas = document.getElementById("hero-visual");
  if (!canvas || !canvas.getContext) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return;
  }

  const frameInterval = 1000 / 45; // target ~45fps for subtle motion and lower CPU usage
  const maxDeviceRatio = 2;
  let width = 0;
  let height = 0;
  let trails = [];
  let lastFrameTime = 0;
  let lastTickTime = 0;

  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  function createTrail() {
    const depth = Math.random();

    const typeSeed = Math.random();
    const type = typeSeed < 0.45 ? "candle" : typeSeed < 0.75 ? "line" : "spark";

    const baseLength = type === "line" ? randomBetween(80, 180) : type === "candle" ? randomBetween(40, 90) : randomBetween(20, 60);
    const bodyHeight = type === "candle" ? randomBetween(30, 110) : 0;
    const sparkRadius = type === "spark" ? randomBetween(1.4, 3.2) : 0;

    return {
      type,
      depth,
      color: hue.color,
      glow: hue.glow,

      x: width + Math.random() * width,
      baseY: height * (0.15 + Math.random() * 0.7),
      y: 0,
      speed: randomBetween(18, 32) + depth * 32,
      waveSpeed: randomBetween(0.35, 0.9),
      waveHeight: randomBetween(8, 26) + depth * 18,
      phase: Math.random() * Math.PI * 2,
      length: baseLength,
      bodyWidth: type === "candle" ? randomBetween(3, 6) : 0,
      bodyHeight,
      sparkRadius,

    };
  }

  function resetTrail(trail) {

    trail.x = width + Math.random() * width * 0.4;
    trail.baseY = height * (0.15 + Math.random() * 0.7);
    trail.waveSpeed = randomBetween(0.35, 0.9);
    trail.waveHeight = randomBetween(8, 26) + trail.depth * 18;
    trail.phase = Math.random() * Math.PI * 2;


    if (trail.type === "line") {
      trail.length = randomBetween(80, 180);
    } else if (trail.type === "candle") {
      trail.length = randomBetween(40, 90);
      trail.bodyWidth = randomBetween(3, 6);
      trail.bodyHeight = randomBetween(30, 110);
    } else {
      trail.length = randomBetween(20, 60);
      trail.sparkRadius = randomBetween(1.4, 3.2);
    }
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, maxDeviceRatio);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(ratio, ratio);

    const density = Math.max(18, Math.floor(width / 70) + Math.floor(height / 90));
    trails = new Array(density).fill(null).map(() => createTrail());
  }

  function updateTrail(trail, deltaSeconds, elapsedSeconds) {
    const parallax = 0.7 + trail.depth * 1.5;
    trail.x -= trail.speed * parallax * deltaSeconds;
    trail.y = trail.baseY + Math.sin(elapsedSeconds * trail.waveSpeed + trail.phase) * trail.waveHeight;

    if (trail.x + trail.length < -60) {
      resetTrail(trail);
    }
  }

  function drawLineTrail(trail) {
    const startX = trail.x;
    const endX = trail.x + trail.length;
    const arc = trail.waveHeight * 0.6;

    context.beginPath();
    context.moveTo(startX, trail.y);
    context.bezierCurveTo(
      startX + trail.length * 0.35,
      trail.y + arc,
      startX + trail.length * 0.7,
      trail.y - arc * 0.8,
      endX,
      trail.y + arc * 0.3
    );

    const gradient = context.createLinearGradient(startX, trail.y, endX, trail.y);
    gradient.addColorStop(0, trail.glow);
    gradient.addColorStop(0.45, trail.color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.strokeStyle = gradient;
    context.lineWidth = 1.4 + trail.depth * 2;
    context.stroke();
  }

  function drawCandleTrail(trail) {
    const bodyHeight = trail.bodyHeight;
    const bodyWidth = trail.bodyWidth;
    const top = trail.y - bodyHeight / 2;
    const wickHeight = bodyHeight * 0.75;

    const bodyGradient = context.createLinearGradient(trail.x, top, trail.x + bodyWidth, top + bodyHeight);
    bodyGradient.addColorStop(0, trail.glow);

    bodyGradient.addColorStop(1, trail.glow);

    context.fillStyle = bodyGradient;
    context.fillRect(trail.x, top, bodyWidth, bodyHeight);

  }

  function drawSparkTrail(trail) {
    const radius = trail.sparkRadius + trail.depth * 1.8;
    const radial = context.createRadialGradient(trail.x, trail.y, 0, trail.x, trail.y, radius * 2.2);
    radial.addColorStop(0, trail.color);
    radial.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.fillStyle = radial;
    context.beginPath();
    context.arc(trail.x, trail.y, radius * 2, 0, Math.PI * 2);
    context.fill();
  }

  function renderFrame(time) {
    if (!lastTickTime) {
      lastTickTime = time;
    }

    if (time - lastFrameTime < frameInterval) {
      requestAnimationFrame(renderFrame);
      return;
    }

    const deltaSeconds = Math.min((time - lastTickTime) / 1000, 0.08);
    lastFrameTime = time;
    lastTickTime = time;

    context.clearRect(0, 0, width, height);

    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = "lighter";
    const elapsedSeconds = time / 1000;

    trails.forEach((trail) => {
      updateTrail(trail, deltaSeconds, elapsedSeconds);

      context.save();
      context.globalAlpha = trail.opacity;
      context.shadowColor = trail.glow;
      context.shadowBlur = trail.shadowBlur;
      context.lineJoin = "round";
      context.lineCap = "round";

      if (trail.type === "line") {
        drawLineTrail(trail);
      } else if (trail.type === "candle") {
        drawCandleTrail(trail);
      } else {
        drawSparkTrail(trail);
      }

      context.restore();
    });

    context.globalCompositeOperation = "source-over";
    requestAnimationFrame(renderFrame);
  }

  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
    }, 160);
  }

  resizeCanvas();
  requestAnimationFrame(renderFrame);
  window.addEventListener("resize", handleResize);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      lastFrameTime = 0;
      lastTickTime = performance.now();
    }
  });
})();
