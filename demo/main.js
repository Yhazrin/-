import { SimulationRuntime, Canvas2DAdapter } from '../dist/index.js';

const canvas = document.getElementById('eco');
const restartBtn = document.getElementById('restart');
const ctx = canvas.getContext('2d');

const runtime = new SimulationRuntime();
runtime.getRenderBridge().register(new Canvas2DAdapter({ ctx, worldSize: 120, pointRadius: 3 }));

const bootstrap = () => {
  runtime.bootstrap({ plants: 120, predators: 30, neutrals: 80, seed: 42 });
};

bootstrap();
restartBtn.addEventListener('click', bootstrap);

let running = true;
let last = performance.now();

const loop = (now) => {
  if (!running) return;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  runtime.ingestRealTime(dt);
  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
window.addEventListener('beforeunload', () => { running = false; });
