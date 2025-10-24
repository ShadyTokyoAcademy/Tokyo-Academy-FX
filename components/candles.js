const heroSection = document.querySelector('.hero');
const canvas = document.getElementById('candles-canvas');

if (heroSection && canvas) {
  const ctx = canvas.getContext('2d');
  const candles = [];
  const heroSize = { width: 0, height: 0 };
  let dpr = window.devicePixelRatio || 1;
  let lastTime = 0;

  const bullishColor = 'rgba(74, 222, 128, 0.8)';
  const bearishColor = 'rgba(248, 113, 113, 0.8)';
  const bullishGlow = 'rgba(74, 222, 128, 0.35)';
  const bearishGlow = 'rgba(248, 113, 113, 0.35)';

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function configureCanvas() {
    const rect = heroSection.getBoundingClientRect();
    heroSize.width = rect.width;
    heroSize.height = rect.height;
    dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    seedCandles();
  }

  function createCandle() {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const isBullish = direction === 1;
    const width = randomRange(6, 12);
    const bodyHeight = randomRange(heroSize.height * 0.12, heroSize.height * 0.32);
    const wickHeight = randomRange(bodyHeight * 0.35, bodyHeight * 0.8);
    const y = randomRange(30, Math.max(31, heroSize.height - bodyHeight - 30));

    return {
      x: randomRange(0, heroSize.width),
      y,
      width,
      bodyHeight,
      wickHeight,
      velocity: randomRange(20, 60) * direction,
      direction,
      isBullish,
      color: isBullish ? bullishColor : bearishColor,
      glow: isBullish ? bullishGlow : bearishGlow,
      stroke: isBullish ? 'rgba(163, 230, 196, 0.8)' : 'rgba(252, 165, 165, 0.8)'
    };
  }

  function seedCandles() {
    candles.length = 0;
    const baseCount = Math.max(14, Math.floor(heroSize.width / 60));
    for (let i = 0; i < baseCount; i += 1) {
      candles.push(createCandle());
    }
  }

  function recycleCandle(candle) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const isBullish = direction === 1;
    const width = randomRange(6, 12);
    const bodyHeight = randomRange(heroSize.height * 0.12, heroSize.height * 0.32);
    const wickHeight = randomRange(bodyHeight * 0.35, bodyHeight * 0.8);
    const y = randomRange(30, Math.max(31, heroSize.height - bodyHeight - 30));
    const offset = width * 2;

    candle.width = width;
    candle.bodyHeight = bodyHeight;
    candle.wickHeight = wickHeight;
    candle.y = y;
    candle.direction = direction;
    candle.isBullish = isBullish;
    candle.velocity = randomRange(20, 60) * direction;
    candle.color = isBullish ? bullishColor : bearishColor;
    candle.glow = isBullish ? bullishGlow : bearishGlow;
    candle.stroke = isBullish ? 'rgba(163, 230, 196, 0.8)' : 'rgba(252, 165, 165, 0.8)';
    candle.x = direction === 1 ? -offset : heroSize.width + offset;
  }

  function drawRoundedRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawCandle(candle) {
    const { x, y, width, bodyHeight, wickHeight } = candle;
    const bodyX = x - width / 2;
    const wickTop = y - wickHeight;
    const wickBottom = y + bodyHeight + wickHeight * 0.35;

    ctx.lineWidth = Math.max(1.5, width * 0.3);
    ctx.strokeStyle = candle.stroke;
    ctx.beginPath();
    ctx.moveTo(x, wickTop);
    ctx.lineTo(x, wickBottom);
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = candle.glow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = candle.color;
    drawRoundedRect(bodyX, y, width, bodyHeight, width * 0.4);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    drawRoundedRect(bodyX + width * 0.15, y + bodyHeight * 0.1, width * 0.25, bodyHeight * 0.3, width * 0.2);
    ctx.fill();
  }

  function render(time) {
    const delta = lastTime ? (time - lastTime) / 1000 : 0;
    lastTime = time;

    ctx.clearRect(0, 0, heroSize.width, heroSize.height);

    candles.forEach(candle => {
      candle.x += candle.velocity * delta;

      if (candle.direction === 1 && candle.x - candle.width > heroSize.width) {
        recycleCandle(candle);
      } else if (candle.direction === -1 && candle.x + candle.width < 0) {
        recycleCandle(candle);
      }

      drawCandle(candle);
    });

    window.requestAnimationFrame(render);
  }

  configureCanvas();
  window.requestAnimationFrame(render);
  window.addEventListener('resize', configureCanvas);
}
