/**
 * Real-Time Throughput Gauge & Multi-Thread Worker HUD
 * Floating dashboard monitoring active worker pool threads, real-time page/sec
 * processing throughput, and batch velocity.
 */

import { workerPool } from '../../core/engine/worker-pool.js';

export class WorkspaceWorkerHud {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.isMinimized = false;
    this.stats = {
      completed: 0,
      total: 0,
      throughput: 0,
      activeThreads: 0
    };

    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'workspace-worker-hud';
    this.container.className = 'worker-hud-container';
    this.container.style.display = 'none';

    this.container.innerHTML = `
      <div class="worker-hud-card">
        <div class="worker-hud-header">
          <div class="worker-hud-brand">
            <span class="hud-pulse-dot"></span>
            <span class="hud-title">Web Worker Acceleration</span>
          </div>
          <div class="worker-hud-controls">
            <button class="hud-btn-toggle" id="btn-hud-minimize" title="Minimize HUD">−</button>
            <button class="hud-btn-toggle" id="btn-hud-close" title="Dismiss HUD">&times;</button>
          </div>
        </div>

        <div class="worker-hud-body" id="worker-hud-body">
          <div class="hud-metrics-row">
            <div class="hud-metric">
              <span class="hud-metric-label">Active Threads</span>
              <span class="hud-metric-val" id="hud-val-threads">4 Threads</span>
            </div>
            <div class="hud-metric">
              <span class="hud-metric-label">Throughput</span>
              <span class="hud-metric-val highlight" id="hud-val-speed">0.0 p/s</span>
            </div>
            <div class="hud-metric">
              <span class="hud-metric-label">Progress</span>
              <span class="hud-metric-val" id="hud-val-progress">0 / 0</span>
            </div>
          </div>

          <div class="hud-progress-track">
            <div class="hud-progress-fill" id="hud-progress-fill" style="width: 0%;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.bindEvents();
  }

  bindEvents() {
    const minBtn = this.container.querySelector('#btn-hud-minimize');
    const closeBtn = this.container.querySelector('#btn-hud-close');
    const body = this.container.querySelector('#worker-hud-body');

    if (minBtn && body) {
      minBtn.onclick = () => {
        this.isMinimized = !this.isMinimized;
        body.style.display = this.isMinimized ? 'none' : 'block';
        minBtn.textContent = this.isMinimized ? '+' : '−';
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        this.hide();
      };
    }
  }

  show(total = 0) {
    this.stats.total = total;
    this.stats.completed = 0;
    this.stats.throughput = 0;
    this.isVisible = true;

    if (this.container) {
      this.container.style.display = 'block';
      this.updateDisplay();
    }
  }

  hide() {
    this.isVisible = false;
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  updateProgress(completed, total = null, speed = null) {
    this.stats.completed = completed;
    if (total !== null) this.stats.total = total;

    if (speed !== null) {
      this.stats.throughput = speed;
    } else {
      const poolStats = workerPool.getStats();
      this.stats.activeThreads = poolStats.activeWorkers || poolStats.totalWorkers;
      this.stats.throughput = poolStats.throughput;
    }

    if (this.container && this.isVisible) {
      this.updateDisplay();
    }
  }

  updateDisplay() {
    if (!this.container || !this.isVisible) return;

    const threadsEl = this.container.querySelector('#hud-val-threads');
    const speedEl = this.container.querySelector('#hud-val-speed');
    const progEl = this.container.querySelector('#hud-val-progress');
    const fillEl = this.container.querySelector('#hud-progress-fill');

    if (threadsEl) {
      threadsEl.textContent = `${this.stats.activeThreads || 4} Threads`;
    }
    if (speedEl) {
      speedEl.textContent = `⚡ ${this.stats.throughput || 0} p/s`;
    }
    if (progEl) {
      progEl.textContent = `${this.stats.completed} / ${this.stats.total || '?'}`;
    }
    if (fillEl && this.stats.total > 0) {
      const pct = Math.min(100, Math.round((this.stats.completed / this.stats.total) * 100));
      fillEl.style.width = `${pct}%`;
    }
  }
}

export const workspaceWorkerHud = new WorkspaceWorkerHud();
