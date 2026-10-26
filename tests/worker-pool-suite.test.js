import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { WorkerPool } from '../src/core/engine/worker-pool.js';
import { WorkspaceWorkerHud } from '../src/components/workflow/workspace-worker-hud.js';
import { handleSystemCapabilities, handleWorkerStatusRequest } from '../server/routes/worker-status-routes.js';

describe('Multi-Threaded Worker Pool & Batch Pipeline Tests', () => {
  test('WorkerPool initializes with appropriate concurrency limits', () => {
    const pool = new WorkerPool({ disableWorkers: true });
    assert.equal(typeof pool.maxWorkers, 'number');
    assert.ok(pool.maxWorkers >= 1 && pool.maxWorkers <= 8);
    assert.equal(pool.isTerminated, false);
    assert.equal(pool.activeTaskCount, 0);
    assert.equal(pool.stats.completedTasks, 0);
  });

  test('WorkerPool executes text-keywords task on main-thread fallback', async () => {
    const pool = new WorkerPool({ disableWorkers: true });
    const payload = {
      text: 'The quick brown fox jumps over the lazy dog. The fox was quick.',
      query: 'fox'
    };

    const res = await pool.executeTask('text-keywords', payload);
    assert.ok(res);
    assert.equal(res.count, 2);
    assert.equal(res.wordCount, 13);
    assert.equal(pool.stats.completedTasks, 1);
  });

  test('WorkerPool executes scan-threats task detecting embedded objects', async () => {
    const pool = new WorkerPool({ disableWorkers: true });
    const encoder = new TextEncoder();
    const mockPdfContent = '%PDF-1.7\n/JavaScript (app.alert("hello"))\n/EmbeddedFiles <<>>\n%%EOF';
    const buffer = encoder.encode(mockPdfContent).buffer;

    const res = await pool.executeTask('scan-threats', { buffer });
    assert.ok(res);
    assert.equal(res.hasJs, true);
    assert.equal(res.hasEmbeddedFiles, true);
    assert.equal(res.hasXmp, false);
    assert.ok(res.length > 0);
  });

  test('WorkerPool executes batch processing with live progress callbacks', async () => {
    const pool = new WorkerPool({ disableWorkers: true });
    const items = [
      'Doc 1: confidential report',
      'Doc 2: invoice data',
      'Doc 3: non-disclosure agreement',
      'Doc 4: quarterly confidential audit'
    ];

    const progressReports = [];
    const results = await pool.executeBatch(
      items,
      'text-keywords',
      (item) => ({ text: item, query: 'confidential' }),
      (p) => progressReports.push(p)
    );

    assert.equal(results.length, 4);
    assert.equal(results[0].count, 1);
    assert.equal(results[1].count, 0);
    assert.equal(results[2].count, 0);
    assert.equal(results[3].count, 1);

    assert.equal(progressReports.length, 4);
    assert.equal(progressReports[3].completed, 4);
    assert.equal(progressReports[3].percent, 100);

    const stats = pool.getStats();
    assert.equal(stats.completedTasks >= 4, true);
    assert.equal(stats.isUsingMainThread, true);
  });

  test('WorkerPool destroy terminates pool and prevents further execution', async () => {
    const pool = new WorkerPool({ disableWorkers: true });
    pool.destroy();
    assert.equal(pool.isTerminated, true);

    await assert.rejects(
      async () => {
        await pool.executeTask('text-keywords', { text: 'test' });
      },
      { message: 'WorkerPool is terminated' }
    );
  });

  test('WorkspaceWorkerHud handles show, updateProgress, and hide cleanly', () => {
    const hud = new WorkspaceWorkerHud();
    assert.equal(hud.isVisible, false);

    hud.show(10);
    assert.equal(hud.stats.total, 10);
    assert.equal(hud.stats.completed, 0);

    hud.updateProgress(5, 10, 18.5);
    assert.equal(hud.stats.completed, 5);
    assert.equal(hud.stats.total, 10);
    assert.equal(hud.stats.throughput, 18.5);

    hud.hide();
    assert.equal(hud.isVisible, false);
  });

  test('Backend handleSystemCapabilities returns system hardware metrics and limits', () => {
    let statusCode = null;
    let headers = null;
    let responseBody = '';

    const mockRes = {
      writeHead: (code, hdrs) => {
        statusCode = code;
        headers = hdrs;
      },
      end: (data) => {
        responseBody = data;
      }
    };

    const handled = handleSystemCapabilities({}, mockRes);
    assert.equal(handled, true);
    assert.equal(statusCode, 200);
    assert.equal(headers['Content-Type'], 'application/json');

    const parsed = JSON.parse(responseBody);
    assert.ok(parsed.cores > 0);
    assert.ok(parsed.platform);
    assert.ok(parsed.arch);
    assert.ok(parsed.limits.maxParallelWorkers > 0);
    assert.ok(parsed.limits.maxClientWasmMemoryMb >= 1024);
    assert.equal(parsed.status, 'operational');
  });

  test('Backend handleWorkerStatusRequest routes /api/system/capabilities', async () => {
    let statusCode = null;
    let responseBody = '';

    const mockRes = {
      writeHead: (code) => { statusCode = code; },
      end: (data) => { responseBody = data; }
    };

    const handled = await handleWorkerStatusRequest({}, mockRes, '/api/system/capabilities', 'GET');
    assert.equal(handled, true);
    assert.equal(statusCode, 200);
    const parsed = JSON.parse(responseBody);
    assert.equal(parsed.status, 'operational');

    const unhandled = await handleWorkerStatusRequest({}, mockRes, '/api/other', 'GET');
    assert.equal(unhandled, false);
  });
});
