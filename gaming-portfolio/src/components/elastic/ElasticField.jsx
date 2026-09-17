import { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Texture } from 'ogl';

const DIST = 4.6;

const VERT = `
precision highp float;
attribute vec2 aGrid;
attribute vec2 uv;
attribute vec3 aOffset;
attribute vec3 aNormal;
uniform float uTilt;
uniform float uDist;
uniform vec2 uCenter;
uniform vec2 uSize;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;
void main() {
  vUv = uv;
  vec2 halfSize = uSize;
  vec2 base = vec2((aGrid.x * 2.0 - 1.0) * halfSize.x, (1.0 - aGrid.y * 2.0) * halfSize.y);
  vec3 p = vec3(base + aOffset.xy * halfSize, aOffset.z * halfSize.y);
  float ct = cos(uTilt);
  float st = sin(uTilt);
  float ry = p.y * ct - p.z * st;
  float rz = p.y * st + p.z * ct;
  p.y = ry;
  p.z = rz;
  float persp = uDist / (uDist - p.z);
  vec2 clip = vec2(uCenter.x + p.x * persp, uCenter.y + p.y * persp);
  vNormal = aNormal;
  vDepth = aOffset.z;
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;
uniform sampler2D tMap;
uniform float uHasImage;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uHighlight;
uniform float uShading;
uniform vec2 uRes;
uniform float uRadius;
uniform float uGrid;
uniform float uGridDensity;
uniform float uGridOpacity;
uniform vec3 uGridColor;
void main() {
  vec3 base;
  if (uHasImage > 0.5) {
    base = texture2D(tMap, vUv).rgb;
  } else {
    base = mix(uColor1, uColor2, clamp(vUv.y, 0.0, 1.0));
  }
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(-0.35, 0.55, 0.78));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float diff = clamp(dot(N, L), 0.0, 1.0);
  float specRaw = pow(clamp(dot(N, H), 0.0, 1.0), 26.0);
  float specFlat = pow(clamp(H.z, 0.0, 1.0), 26.0);
  float spec = clamp((specRaw - specFlat) / (1.0 - specFlat), 0.0, 1.0);
  float ao = clamp(1.0 + vDepth * 0.45, 0.65, 1.25);
  vec3 lit = base * (1.0 - uShading * 0.28);
  lit += base * diff * uShading * 0.55;
  lit *= ao;
  lit += uHighlight * spec * uShading * 0.25;
  if (uGrid > 0.5) {
    vec2 g = vUv * uGridDensity;
    vec2 w = uGridDensity / max(uRes, vec2(1.0));
    vec2 d = abs(fract(g - 0.5) - 0.5) / max(w * 1.5, vec2(1e-4));
    float line = 1.0 - smoothstep(0.0, 1.0, min(d.x, d.y));
    lit = mix(lit, uGridColor, line * uGridOpacity);
  }
  vec2 p = (vUv - 0.5) * uRes;
  vec2 halfRes = uRes * 0.5;
  float r = min(uRadius, min(halfRes.x, halfRes.y));
  vec2 q = abs(p) - (halfRes - r);
  float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float alpha = 1.0 - smoothstep(-1.25, 1.25, sd);
  if (alpha <= 0.002) discard;
  gl_FragColor = vec4(lit, alpha);
}
`;

function hexToRgb(hex) {
  let h = (hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h || '000000', 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function readCardConfig(el) {
  const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    image: el.dataset.image || '',
    color1: el.dataset.color1 || '#5227FF',
    color2: el.dataset.color2 || '#B19EEF',
    highlight: el.dataset.highlight || '#ffffff',
    grid: el.dataset.grid !== 'false',
    gridDensity: num(el.dataset.gridDensity, 18),
    gridOpacity: num(el.dataset.gridOpacity, 0.25),
    gridColor: el.dataset.gridColor || '#ffffff',
    radius: num(el.dataset.radius, 16),
    tilt: num(el.dataset.tilt, 0),
    shading: num(el.dataset.shading, 0.5),
    resolution: num(el.dataset.resolution, 12),
    interaction: el.dataset.interaction || 'hover',
    stiffness: num(el.dataset.stiffness, 0.05),
    damping: num(el.dataset.damping, 0.2),
    grabRadius: num(el.dataset.grabRadius, 0.6),
    pull: num(el.dataset.pull, 0.4),
    wobble: num(el.dataset.wobble, 5),
  };
}

export default function ElasticField() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2), autoClear: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    wrap.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      cullFace: null,
      uniforms: {
        tMap: { value: null },
        uHasImage: { value: 0 },
        uColor1: { value: [0.32, 0.15, 1] },
        uColor2: { value: [0.69, 0.62, 0.94] },
        uHighlight: { value: [1, 1, 1] },
        uGrid: { value: 1 },
        uGridDensity: { value: 18 },
        uGridOpacity: { value: 0.25 },
        uGridColor: { value: [1, 1, 1] },
        uShading: { value: 0.5 },
        uRes: { value: [1, 1] },
        uRadius: { value: 16 },
        uTilt: { value: 0 },
        uDist: { value: DIST },
        uCenter: { value: [0, 0] },
        uSize: { value: [0.2, 0.2] },
      },
    });

    const cards = [];

    function createCard(el) {
      const cfg = readCardConfig(el);
      const N = Math.max(6, Math.min(40, Math.round(cfg.resolution)));
      const nodeCount = N * N;
      const aGrid = new Float32Array(nodeCount * 2);
      const uv = new Float32Array(nodeCount * 2);
      const aOffset = new Float32Array(nodeCount * 3);
      const aNormal = new Float32Array(nodeCount * 3);
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i;
          aGrid[idx * 2] = i / (N - 1);
          aGrid[idx * 2 + 1] = j / (N - 1);
          uv[idx * 2] = i / (N - 1);
          uv[idx * 2 + 1] = j / (N - 1);
          aNormal[idx * 3 + 2] = 1;
        }
      }
      const quads = (N - 1) * (N - 1);
      const index = new Uint16Array(quads * 6);
      let t = 0;
      for (let j = 0; j < N - 1; j++) {
        for (let i = 0; i < N - 1; i++) {
          const a = j * N + i, b = a + 1, c = a + N, d = c + 1;
          index[t++] = a; index[t++] = c; index[t++] = b;
          index[t++] = b; index[t++] = c; index[t++] = d;
        }
      }
      const geometry = new Geometry(gl, {
        aGrid: { size: 2, data: aGrid },
        uv: { size: 2, data: uv },
        aOffset: { size: 3, data: aOffset },
        aNormal: { size: 3, data: aNormal },
        index: { data: index },
      });
      const mesh = new Mesh(gl, { geometry, program });
      const texture = new Texture(gl, { generateMipmaps: false, flipY: false });

      const baseX = new Float32Array(nodeCount);
      const baseY = new Float32Array(nodeCount);
      const pos = new Float32Array(nodeCount * 3);
      const vel = new Float32Array(nodeCount * 3);
      const accel = new Float32Array(nodeCount * 3);
      for (let idx = 0; idx < nodeCount; idx++) {
        baseX[idx] = aGrid[idx * 2] * 2 - 1;
        baseY[idx] = 1 - aGrid[idx * 2 + 1] * 2;
      }

      const card = {
        el, cfg, N, nodeCount, geometry, mesh, texture,
        hasImage: 0, baseX, baseY, pos, vel, accel, aOffset, aNormal,
        rect: { left: 0, top: 0, w: 1, h: 1 },
        cx: 0, cy: 0, sx: 0.2, sy: 0.2,
        pointer: { x: 0, y: 0, active: false },
        ro: null,
      };

      if (cfg.image) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = cfg.image;
        img.onload = () => {
          texture.image = img;
          card.hasImage = 1;
        };
      }

      return card;
    }

    function updateRect(card) {
      const r = card.el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      card.rect.left = r.left;
      card.rect.top = r.top;
      card.rect.w = r.width;
      card.rect.h = r.height;
      card.cx = ((r.left + r.width / 2) / vw) * 2 - 1;
      card.cy = 1 - ((r.top + r.height / 2) / vh) * 2;
      card.sx = r.width / vw;
      card.sy = r.height / vh;
    }

    function refreshRects() {
      for (const card of cards) updateRect(card);
      renderAll();
    }

    function sync() {
      const els = Array.from(document.querySelectorAll('[data-elastic-card]'));
      const byEl = new Map(cards.map((c) => [c.el, c]));
      const next = [];
      for (const el of els) {
        let card = byEl.get(el);
        if (!card) {
          card = createCard(el);
          const ro = new ResizeObserver(() => updateRect(card));
          ro.observe(el);
          card.ro = ro;
        }
        updateRect(card);
        next.push(card);
      }
      for (const card of cards) {
        if (!els.includes(card.el)) {
          card.ro?.disconnect();
          card.geometry.dispose?.();
        }
      }
      cards.length = 0;
      cards.push(...next);
      renderAll();
    }

    const mo = new MutationObserver(() => sync());
    mo.observe(document.body, { childList: true, subtree: true });

    function resizeRenderer() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      refreshRects();
    }
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);
    window.addEventListener('scroll', refreshRects, { passive: true });
    sync();

    function hitTest(clientX, clientY) {
      let hit = false;
      for (const card of cards) {
        const { left, top, w, h } = card.rect;
        const inside = clientX >= left && clientX <= left + w && clientY >= top && clientY <= top + h;
        if (inside) {
          card.pointer.active = true;
          card.pointer.x = ((clientX - left) / w) * 2 - 1;
          card.pointer.y = 1 - ((clientY - top) / h) * 2;
          hit = true;
        } else {
          card.pointer.active = false;
        }
      }
      return hit;
    }

    const onMove = (e) => hitTest(e.clientX, e.clientY);
    const onLeave = () => {
      for (const card of cards) card.pointer.active = false;
    };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('mouseleave', onLeave);

    const STEP = 1 / 120;
    const MAX_SUB = 5;
    let accTime = 0;
    let last = performance.now();

    function substepCard(card) {
      const c = card.cfg;
      const N = card.N;
      const s = c.stiffness;
      const retain = 1 - c.damping;
      const coupling = 0.06 + c.wobble * 0.032;
      const active = card.pointer.active && !reduceMotion;
      const r = Math.max(0.08, c.grabRadius) * 1.4;
      const invR = 1 / r;
      const force = c.pull * 0.009;
      const { pos, vel, accel, baseX, baseY } = card;
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i, o3 = idx * 3;
          const ox = pos[o3], oy = pos[o3 + 1], oz = pos[o3 + 2];
          let ax = -s * ox, ay = -s * oy, az = -s * oz;
          let sumx = 0, sumy = 0, sumz = 0, cnt = 0;
          if (i > 0) { const n = (idx - 1) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          if (i < N - 1) { const n = (idx + 1) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          if (j > 0) { const n = (idx - N) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          if (j < N - 1) { const n = (idx + N) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          ax += coupling * (sumx - cnt * ox);
          ay += coupling * (sumy - cnt * oy);
          az += coupling * (sumz - cnt * oz);
          if (active) {
            const dx = card.pointer.x - (baseX[idx] + ox);
            const dy = card.pointer.y - (baseY[idx] + oy);
            const d = Math.sqrt(dx * dx + dy * dy);
            const tnorm = d * invR;
            if (tnorm < 1) {
              const zBump = 1 - tnorm * tnorm;
              az += force * zBump * zBump * 6.0;
              if (d > 1e-4) {
                const pinch = tnorm * (1 - tnorm) * (1 - tnorm) * 6.75;
                const dir = (force * pinch * 1.6) / d;
                ax += dx * dir;
                ay += dy * dir;
              }
            }
          }
          accel[o3] = ax; accel[o3 + 1] = ay; accel[o3 + 2] = az;
        }
      }
      for (let k = 0; k < card.nodeCount; k++) {
        const o3 = k * 3;
        const nvx = (vel[o3] + accel[o3]) * retain;
        const nvy = (vel[o3 + 1] + accel[o3 + 1]) * retain;
        const nvz = (vel[o3 + 2] + accel[o3 + 2]) * retain;
        vel[o3] = nvx; vel[o3 + 1] = nvy; vel[o3 + 2] = nvz;
        pos[o3] = Math.max(-1.2, Math.min(1.2, pos[o3] + nvx));
        pos[o3 + 1] = Math.max(-1.2, Math.min(1.2, pos[o3 + 1] + nvy));
        pos[o3 + 2] = Math.max(-1.2, Math.min(1.2, pos[o3 + 2] + nvz));
      }
    }

    function commitCard(card) {
      const { pos, aOffset, aNormal, baseX, baseY, N } = card;
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i, o3 = idx * 3;
          const iL = i > 0 ? idx - 1 : idx, iR = i < N - 1 ? idx + 1 : idx;
          const iD = j > 0 ? idx - N : idx, iU = j < N - 1 ? idx + N : idx;
          const lx = baseX[iL] + pos[iL * 3], ly = baseY[iL] + pos[iL * 3 + 1], lz = pos[iL * 3 + 2];
          const rx = baseX[iR] + pos[iR * 3], ry = baseY[iR] + pos[iR * 3 + 1], rz = pos[iR * 3 + 2];
          const dx = baseX[iD] + pos[iD * 3], dy = baseY[iD] + pos[iD * 3 + 1], dz = pos[iD * 3 + 2];
          const ux = baseX[iU] + pos[iU * 3], uy = baseY[iU] + pos[iU * 3 + 1], uz = pos[iU * 3 + 2];
          const txx = rx - lx, txy = ry - ly, txz = rz - lz;
          const tyx = ux - dx, tyy = uy - dy, tyz = uz - dz;
          let nx = txy * tyz - txz * tyy;
          let ny = txz * tyx - txx * tyz;
          let nz = txx * tyy - txy * tyx;
          if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          aNormal[o3] = nx / len; aNormal[o3 + 1] = ny / len; aNormal[o3 + 2] = nz / len;
          aOffset[o3] = pos[o3]; aOffset[o3 + 1] = pos[o3 + 1]; aOffset[o3 + 2] = pos[o3 + 2];
        }
      }
      card.geometry.attributes.aOffset.needsUpdate = true;
      card.geometry.attributes.aNormal.needsUpdate = true;
    }

    function renderCard(card) {
      const c = card.cfg;
      program.uniforms.uColor1.value = hexToRgb(c.color1);
      program.uniforms.uColor2.value = hexToRgb(c.color2);
      program.uniforms.uHighlight.value = hexToRgb(c.highlight);
      program.uniforms.uGrid.value = c.grid ? 1 : 0;
      program.uniforms.uGridDensity.value = c.gridDensity;
      program.uniforms.uGridOpacity.value = c.gridOpacity;
      program.uniforms.uGridColor.value = hexToRgb(c.gridColor);
      program.uniforms.uShading.value = c.shading;
      program.uniforms.uRadius.value = c.radius;
      program.uniforms.uTilt.value = (c.tilt * Math.PI) / 180;
      program.uniforms.uRes.value = [card.rect.w, card.rect.h];
      program.uniforms.uCenter.value = [card.cx, card.cy];
      program.uniforms.uSize.value = [card.sx, card.sy];
      program.uniforms.tMap.value = card.texture;
      program.uniforms.uHasImage.value = card.hasImage;
      renderer.render({ scene: card.mesh });
    }

    function renderAll() {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (const card of cards) renderCard(card);
    }

    function anyActivity() {
      for (const card of cards) {
        if (card.pointer.active) return true;
        for (let k = 0; k < card.nodeCount; k++) {
          const o3 = k * 3;
          if (Math.abs(card.pos[o3]) > 0.001 || Math.abs(card.pos[o3 + 1]) > 0.001 || Math.abs(card.pos[o3 + 2]) > 0.001) return true;
          if (Math.abs(card.vel[o3]) > 0.0005 || Math.abs(card.vel[o3 + 1]) > 0.0005 || Math.abs(card.vel[o3 + 2]) > 0.0005) return true;
        }
      }
      return false;
    }

    let raf = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (reduceMotion) return; // static frame already rendered via sync()/refreshRects()
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.25) dt = 0.25;
      if (!anyActivity()) return; // idle: skip physics + render this frame
      accTime += dt;
      let sub = 0;
      while (accTime >= STEP && sub < MAX_SUB) {
        for (const card of cards) substepCard(card);
        accTime -= STEP;
        sub++;
      }
      if (accTime > STEP) accTime = 0;
      for (const card of cards) commitCard(card);
      renderAll();
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener('resize', resizeRenderer);
      window.removeEventListener('scroll', refreshRects);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      for (const card of cards) card.ro?.disconnect();
      if (gl.canvas.parentElement === wrap) wrap.removeChild(gl.canvas);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, []);

  return <div ref={wrapRef} className="elastic-field pointer-events-none fixed inset-0 z-10" />;
}
