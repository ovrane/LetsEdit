/**
 * System Capabilities & Worker Status API Routes
 * Reports server and browser client execution limits and hardware metrics.
 */

import os from 'node:os';

export function handleSystemCapabilities(req, res) {
  const cpus = os.cpus() || [];
  const totalMemMb = Math.round(os.totalmem() / (1024 * 1024));
  const freeMemMb = Math.round(os.freemem() / (1024 * 1024));

  const capabilities = {
    cores: cpus.length || 4,
    platform: os.platform(),
    arch: os.arch(),
    memory: {
      totalMb: totalMemMb,
      freeMb: freeMemMb
    },
    limits: {
      maxClientWasmMemoryMb: 2048,
      recommendedBatchChunkSize: 10,
      maxParallelWorkers: Math.min(cpus.length || 4, 8)
    },
    status: 'operational',
    timestamp: new Date().toISOString()
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(capabilities));
  return true;
}

export async function handleWorkerStatusRequest(req, res, pathname = null, method = null) {
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : { pathname: '' };
  const actualPath = pathname || urlObj.pathname;
  const actualMethod = method || req.method;

  if (actualPath === '/api/system/capabilities' && actualMethod === 'GET') {
    return handleSystemCapabilities(req, res);
  }

  return false;
}
