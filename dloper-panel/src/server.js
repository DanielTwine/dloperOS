import express from 'express';
import os from 'os';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PANEL_PORT || 4173;
const fileRoot = process.env.FILE_ROOT || '/opt/dloper/data';

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

const safePath = (inputPath = '') => {
  const resolved = path.resolve(fileRoot, inputPath);
  if (!resolved.startsWith(path.resolve(fileRoot))) {
    throw new Error('Invalid path');
  }
  return resolved;
};

app.get('/api/system', (_, res) => {
  const load = os.loadavg();
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  res.json({
    hostname: os.hostname(),
    uptime: os.uptime(),
    platform: os.platform(),
    arch: os.arch(),
    load1: load[0],
    load5: load[1],
    load15: load[2],
    memory: { total: memTotal, free: memFree, used: memTotal - memFree },
    cpus: os.cpus().length,
  });
});

app.get('/api/apps', (_, res) => {
  exec('docker ps --format "{{.Names}}|{{.Status}}|{{.Image}}"', (err, stdout) => {
    if (err) {
      return res.json({ apps: [], error: 'Docker not available' });
    }
    const apps = stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [name, status, image] = line.split('|');
        return { name, status, image };
      });
    res.json({ apps });
  });
});

app.post('/api/apps/:name/:action', (req, res) => {
  const { name, action } = req.params;
  if (!['start', 'stop', 'restart'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  exec(`docker ${action} ${name}`, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ ok: true, output: stdout });
  });
});

app.get('/api/files', (req, res) => {
  const p = req.query.path || '.';
  try {
    const fullPath = safePath(p.toString());
    const entries = fs.readdirSync(fullPath, { withFileTypes: true }).map((d) => ({
      name: d.name,
      type: d.isDirectory() ? 'dir' : 'file',
    }));
    res.json({ path: p, entries });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/files/mkdir', (req, res) => {
  const { path: dir } = req.body;
  try {
    const fullPath = safePath(dir || '.');
    fs.mkdirSync(fullPath, { recursive: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/tailscale', (_, res) => {
  res.json({ status: 'not-configured', note: 'Run `tailscale up --authkey <key>` on the host to connect.' });
});

app.post('/api/updates', (_, res) => {
  exec('apt-get update && apt-get -y upgrade', (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ ok: true, output: stdout });
  });
});

app.get('/api/backups', (_, res) => {
  res.json({ backups: [], note: 'Implement backup storage and list artifacts here.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Dloper Panel running on ${port}`);
});
