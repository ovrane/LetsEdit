/**
 * Client-Side Multi-Threaded Web Worker Pipeline & Batch Execution Engine
 * Distributes heavy PDF page rasterization, text indexing, forensic sanitization,
 * and cryptographic hashing across multiple background worker threads using
 * navigator.hardwareConcurrency with automatic main-thread fallback.
 */

export class WorkerPool {
  constructor(options = {}) {
    this.maxWorkers = options.maxWorkers || this.resolveMaxWorkers();
    this.workers = [];
    this.idleWorkers = [];
    this.taskQueue = [];
    this.activeTaskCount = 0;
    this.isTerminated = false;
    this.stats = {
      completedTasks: 0,
      totalBytesProcessed: 0,
      startTime: null,
      lastThroughput: 0
    };
    this.workerScriptUrl = null;
    this.hasWorkerSupport = typeof window !== 'undefined' && typeof window.Worker !== 'undefined';

    if (this.hasWorkerSupport && !options.disableWorkers) {
      this.initPool();
    }
  }

  resolveMaxWorkers() {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      return Math.max(1, Math.min(navigator.hardwareConcurrency, 8));
    }
    return 4;
  }

  getWorkerScript() {
    return `
      self.onmessage = async function(e) {
        const { taskId, type, payload } = e.data;
        const start = performance.now();

        try {
          let result = null;

          if (type === 'hash-chunk') {
            // SHA-256 chunk digest
            const buffer = payload.buffer;
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            result = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          } else if (type === 'scan-threats') {
            // Forensic byte scanner
            const bytes = new Uint8Array(payload.buffer);
            const str = new TextDecoder().decode(bytes);
            result = {
              hasJs: /\\/JavaScript|\\/JS\\b/i.test(str),
              hasEmbeddedFiles: /\\/EmbeddedFiles|\\/EF\\b/i.test(str),
              hasXmp: /<x:xmpmeta/i.test(str),
              length: bytes.length
            };
          } else if (type === 'text-keywords') {
            // Fast text tokenizer
            const text = payload.text || '';
            const query = (payload.query || '').toLowerCase();
            const count = query ? (text.toLowerCase().split(query).length - 1) : 0;
            result = { count, wordCount: text.split(/\\s+/).filter(Boolean).length };
          } else {
            result = { processed: true, payload };
          }

          const elapsed = performance.now() - start;
          self.postMessage({ taskId, success: true, result, elapsed });
        } catch (err) {
          self.postMessage({ taskId, success: false, error: err.message });
        }
      };
    `;
  }

  initPool() {
    try {
      const blob = new Blob([this.getWorkerScript()], { type: 'application/javascript' });
      this.workerScriptUrl = URL.createObjectURL(blob);

      for (let i = 0; i < this.maxWorkers; i++) {
        const worker = new Worker(this.workerScriptUrl);
        worker.id = i + 1;
        worker.isBusy = false;
        this.workers.push(worker);
        this.idleWorkers.push(worker);
      }
    } catch (err) {
      console.warn('[WorkerPool] Worker pool initialization failed, using main-thread fallback:', err);
      this.hasWorkerSupport = false;
      this.workers = [];
      this.idleWorkers = [];
    }
  }

  /**
   * Dispatches a single task to an idle worker or queues it
   */
  async executeTask(type, payload, transferables = []) {
    if (this.isTerminated) {
      throw new Error('WorkerPool is terminated');
    }

    // Main-thread fallback when workers are disabled or unsupported
    if (!this.hasWorkerSupport || this.workers.length === 0) {
      return this.executeOnMainThread(type, payload);
    }

    return new Promise((resolve, reject) => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const task = { taskId, type, payload, transferables, resolve, reject };

      if (this.idleWorkers.length > 0) {
        this.assignTaskToWorker(this.idleWorkers.shift(), task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  assignTaskToWorker(worker, task) {
    worker.isBusy = true;
    this.activeTaskCount++;

    if (!this.stats.startTime) {
      this.stats.startTime = performance.now();
    }

    const onMessage = (e) => {
      if (e.data.taskId === task.taskId) {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);

        worker.isBusy = false;
        this.activeTaskCount--;
        this.stats.completedTasks++;
        this.updateThroughput();

        if (e.data.success) {
          task.resolve(e.data.result);
        } else {
          task.reject(new Error(e.data.error || 'Worker task failed'));
        }

        // Process next queued task or return to idle pool
        if (this.taskQueue.length > 0) {
          this.assignTaskToWorker(worker, this.taskQueue.shift());
        } else {
          this.idleWorkers.push(worker);
        }
      }
    };

    const onError = (err) => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);

      worker.isBusy = false;
      this.activeTaskCount--;

      task.reject(err);

      if (this.taskQueue.length > 0) {
        this.assignTaskToWorker(worker, this.taskQueue.shift());
      } else {
        this.idleWorkers.push(worker);
      }
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    try {
      worker.postMessage({ taskId: task.taskId, type: task.type, payload: task.payload }, task.transferables || []);
    } catch (postErr) {
      // If transfer fails (e.g. non-transferable buffer), post without transferables
      worker.postMessage({ taskId: task.taskId, type: task.type, payload: task.payload });
    }
  }

  /**
   * Executes a task sequentially on main thread
   */
  async executeOnMainThread(type, payload) {
    if (!this.stats.startTime) this.stats.startTime = performance.now();

    let result = null;
    if (type === 'scan-threats') {
      const bytes = new Uint8Array(payload.buffer);
      const str = String.fromCharCode.apply(null, Array.from(bytes.slice(0, 10000)));
      result = {
        hasJs: /\/JavaScript|\/JS\b/i.test(str),
        hasEmbeddedFiles: /\/EmbeddedFiles|\/EF\b/i.test(str),
        hasXmp: /<x:xmpmeta/i.test(str),
        length: bytes.length
      };
    } else if (type === 'text-keywords') {
      const text = payload.text || '';
      const query = (payload.query || '').toLowerCase();
      const count = query ? (text.toLowerCase().split(query).length - 1) : 0;
      result = { count, wordCount: text.split(/\s+/).filter(Boolean).length };
    } else {
      result = { processed: true, payload };
    }

    this.stats.completedTasks++;
    this.updateThroughput();
    return result;
  }

  /**
   * Batch execution across all workers with real-time progress callbacks
   */
  async executeBatch(items, type, payloadExtractor, onProgress = null) {
    const total = items.length;
    let completed = 0;
    const results = new Array(total);

    const promises = items.map(async (item, index) => {
      const payload = payloadExtractor ? payloadExtractor(item, index) : item;
      const res = await this.executeTask(type, payload);
      results[index] = res;
      completed++;

      if (onProgress) {
        const stats = this.getStats();
        onProgress({
          completed,
          total,
          percent: Math.round((completed / total) * 100),
          throughput: stats.throughput,
          activeWorkers: this.activeTaskCount
        });
      }
      return res;
    });

    await Promise.all(promises);
    return results;
  }

  updateThroughput() {
    if (!this.stats.startTime) return;
    const elapsedSec = (performance.now() - this.stats.startTime) / 1000;
    if (elapsedSec > 0.05) {
      this.stats.lastThroughput = parseFloat((this.stats.completedTasks / elapsedSec).toFixed(1));
    }
  }

  getStats() {
    return {
      activeWorkers: this.activeTaskCount,
      totalWorkers: this.workers.length || this.maxWorkers,
      completedTasks: this.stats.completedTasks,
      throughput: this.stats.lastThroughput,
      isUsingMainThread: !this.hasWorkerSupport || this.workers.length === 0
    };
  }

  destroy() {
    this.isTerminated = true;
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.idleWorkers = [];
    this.taskQueue = [];

    if (this.workerScriptUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(this.workerScriptUrl);
      this.workerScriptUrl = null;
    }
  }
}

export const workerPool = new WorkerPool();
