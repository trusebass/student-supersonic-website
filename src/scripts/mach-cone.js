// The hero: a live Mach-cone diagram on a 2D canvas.
//
// A point (the aircraft) flies to the right at Mach M through still air and
// sends out a sound wavefront every `emitEvery` seconds. Each wavefront is a
// circle that grows at the speed of sound around the spot where it was sent.
// Below Mach 1 the circles bunch up ahead of the aircraft. At Mach 1 they
// pile up at the nose (the "sound barrier"). Above Mach 1 the aircraft
// outruns them and their envelope is the Mach cone, half-angle
// mu = arcsin(1 / M). Nothing here is drawn to look like a cone: the cone
// lines only trace where the circles already overlap.
//
// The view follows the aircraft, so the aircraft stays put on screen and the
// air, with the wavefronts in it, streams past to the left.
//
// Units: lengths are in "u", where 1 u is the longer side of the canvas, so
// the picture scales with the screen. Time is in seconds.

export const DEFAULTS = {
  sound: 0.085,          // speed of sound, u/s
  emitEvery: 1 / 14,     // s between wavefronts
  life: 7,               // s a wavefront stays visible
  ringAlpha: 0.32,       // opacity of a new wavefront; fades to 0 over `life`
  startMach: 0.6,
  cruiseMach: 1.4,       // where the run-up on load ends
  runUpAfter: 1.2,       // s at startMach before the run-up begins
  minMach: 0.3,
  maxMach: 2.2,
  accel: 0.22,           // Mach per second while far from the throttle setting
  ease: 0.15,            // within this many Mach of the setting, slow down smoothly
  dragRise: 0.75,        // how much acceleration drops near Mach 1 (0 = not at all), a nod to the transonic drag rise
  dragWidth: 0.06,       // width of that slow zone, in Mach
  coneLength: 0.75,      // cone lines reach the wavefront of age coneLength * life
  maxFps: 60,
  maxDpr: 2,
  // Where the aircraft sits, in canvas pixels: right of the headline on wide
  // screens; on narrow ones in the empty band above it (.hero-body's
  // padding-top in global.css keeps that band free).
  apex: (w, h) => (w >= 860 ? { x: 0.8 * w, y: 0.42 * h } : { x: 0.68 * w, y: Math.min(0.2 * h, 190) }),
};

/**
 * Start the diagram on `canvas`. `onFrame({ mach, mu, superFor })` is called
 * after every drawn frame (mu in degrees, null below Mach 1; superFor is the
 * time in seconds spent above Mach 1 without a break).
 * With `still: true` nothing animates: each change draws one steady frame.
 */
export function machCone(canvas, { onFrame = () => {}, still = false, ...options } = {}) {
  const o = { ...DEFAULTS, ...options };
  const ctx = canvas.getContext('2d');
  const style = getComputedStyle(canvas);
  const color = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
  const INK = color('--ink', '#edeae3');
  const SIGNAL = color('--signal', '#ff4f00');
  const MONO = style.getPropertyValue('--font-mono').trim() || 'monospace';

  let w = 0, h = 0, dpr = 1, unit = 1, apex = { x: 0, y: 0 };
  let t = 0;              // simulation time
  let x = 0;              // aircraft position along its path, u
  let mach = still ? o.cruiseMach : o.startMach;
  let target = mach;
  let manual = false;       // true once someone has moved the throttle
  let superFor = 0;
  let nextEmit = 0;
  let cone = still ? 1 : 0; // opacity of the cone lines, eases in above Mach 1
  let waves = [];           // { x: where it was sent, t: when }

  // Fill the sky as if the aircraft had flown at `m` for a whole lifetime,
  // so the first frame is already a full picture.
  function steady(m) {
    waves = [];
    for (let age = o.life; age >= 0; age -= o.emitEvery) {
      waves.push({ x: x - m * o.sound * age, t: t - age });
    }
    nextEmit = t + o.emitEvery;
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    w = r.width;
    h = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    unit = Math.max(w, h);
    apex = o.apex(w, h);
    if (still || !running) draw();
  }

  function step(dt) {
    // Mach follows the throttle at a steady rate, easing in near the
    // setting and held back around Mach 1.
    if (!manual && t >= o.runUpAfter) target = o.cruiseMach;
    const gap = target - mach;
    const slow = 1 - o.dragRise * Math.exp(-(((mach - 1) / o.dragWidth) ** 2));
    const rate = o.accel * slow * Math.min(1, Math.abs(gap) / o.ease);
    mach += Math.sign(gap) * Math.min(Math.abs(gap), rate * dt);
    if (Math.abs(target - mach) < 0.0005) mach = target;

    t += dt;
    x += mach * o.sound * dt;
    // Send the wavefronts due in this step, each from where the aircraft was
    // at that instant rather than where it is now.
    while (nextEmit <= t) {
      waves.push({ x: x - mach * o.sound * (t - nextEmit), t: nextEmit });
      nextEmit += o.emitEvery;
    }
    while (waves.length && t - waves[0].t > o.life) waves.shift();

    superFor = mach >= 1 ? superFor + dt : 0;
    const coneTarget = mach > 1.001 ? 1 : 0;
    cone += (coneTarget - cone) * Math.min(1, dt * 2.5);
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const c = o.sound * unit; // speed of sound in px/s
    const hairline = dpr >= 2 ? 0.75 : 1;

    // Flight path.
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = INK;
    ctx.lineWidth = hairline;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(0, apex.y);
    ctx.lineTo(w, apex.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Wavefronts.
    for (const wave of waves) {
      const age = t - wave.t;
      const r = c * age;
      const cx = apex.x + (wave.x - x) * unit;
      if (cx + r < 0 || cx - r > w) continue;
      const fade = 1 - age / o.life;
      ctx.globalAlpha = o.ringAlpha * fade * fade;
      ctx.beginPath();
      ctx.arc(cx, apex.y, Math.max(r, 0.5), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Mach cone, the angle mu and its label.
    if (cone > 0.01 && mach > 1) {
      const mu = Math.asin(1 / mach);
      const len = c * o.life * o.coneLength * Math.sqrt(mach * mach - 1);
      ctx.lineWidth = 1.25;
      for (const side of [-1, 1]) {
        const ex = apex.x - Math.cos(mu) * len;
        const ey = apex.y + side * Math.sin(mu) * len;
        const g = ctx.createLinearGradient(apex.x, apex.y, ex, ey);
        g.addColorStop(0, SIGNAL);
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = cone;
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(apex.x, apex.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      ctx.strokeStyle = SIGNAL;
      ctx.lineWidth = hairline;
      ctx.globalAlpha = cone * 0.9;
      ctx.beginPath();
      ctx.arc(apex.x, apex.y, 64, Math.PI, Math.PI + mu);
      ctx.stroke();
      ctx.fillStyle = SIGNAL;
      ctx.font = `400 13px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('μ', apex.x + Math.cos(Math.PI + mu / 2) * 80, apex.y + Math.sin(Math.PI + mu / 2) * 80);
    }

    // The aircraft: a small delta, nose on the source point.
    const s = Math.min(1.15, Math.max(0.75, w / 1440));
    ctx.globalAlpha = 1;
    ctx.fillStyle = INK;
    ctx.save();
    ctx.translate(apex.x, apex.y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (const [px, py] of [[-7, -1.3], [-15, -7.5], [-17.5, -7.5], [-15.5, -1.6], [-21, -1.6], [-21, 1.6], [-15.5, 1.6], [-17.5, 7.5], [-15, 7.5], [-7, 1.3]]) ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Tag with the live Mach number, like a radar label.
    const supersonic = mach >= 1;
    const tx = apex.x + 22, ty = apex.y - 30;
    ctx.font = `500 13px ${MONO}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    let tag = `M ${mach.toFixed(2)}`;
    const long = `${tag}  sound barrier`;
    if (Math.abs(mach - 1) < 0.025 && tx + ctx.measureText(long).width < w - 12) tag = long;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = INK;
    ctx.lineWidth = hairline;
    ctx.beginPath();
    ctx.moveTo(apex.x + 6, apex.y - 7);
    ctx.lineTo(tx, ty);
    ctx.lineTo(tx + Math.max(74, ctx.measureText(tag).width + 6), ty);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = supersonic ? SIGNAL : INK;
    ctx.fillText(tag, tx + 2, ty - 6);

    onFrame({ mach, mu: supersonic ? (Math.asin(1 / mach) * 180) / Math.PI : null, superFor: still ? null : superFor });
  }

  // Animation loop: paused while the hero is off screen or the tab hidden.
  let running = false, visible = true, raf = 0, last = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const elapsed = now - last;
    if (elapsed < 1000 / o.maxFps - 2) return; // 120 Hz screens: draw every other frame
    last = now;
    step(Math.min(elapsed / 1000, 0.05));
    draw();
  }
  function play() {
    if (running || still || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  steady(mach);
  resize();
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? play() : pause(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  // Canvas text uses the web font once it has loaded.
  document.fonts?.ready.then(() => { if (!running) draw(); });
  play();

  return {
    /** Set the Mach number the aircraft accelerates (or slows) toward. */
    setMach(m) {
      manual = true;
      target = Math.min(o.maxMach, Math.max(o.minMach, m));
      if (still) {
        mach = target;
        cone = mach > 1 ? 1 : 0;
        steady(mach);
        draw();
      }
    },
    get target() { return target; },
  };
}
