import net from "node:net";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const children = [];
let shuttingDown = false;

function log(message) {
  console.log(`[dev] ${message}`);
}

function pipePrefixed(stream, label) {
  const rl = readline.createInterface({ input: stream });
  rl.on("line", (line) => {
    if (!line.trim()) return;
    console.log(`[${label}] ${line}`);
  });
}

function spawnService(label, args, critical = true) {
  const isWin = process.platform === "win32";
  const command = isWin ? "cmd.exe" : "pnpm";
  const spawnArgs = isWin ? ["/d", "/s", "/c", `pnpm ${args.map(quoteForCmd).join(" ")}`] : args;

  const child = spawn(command, spawnArgs, {
    cwd: rootDir,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  children.push(child);
  pipePrefixed(child.stdout, label);
  pipePrefixed(child.stderr, label);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    console.log(`[${label}] exited (code=${code ?? "null"}, signal=${signal ?? "null"})`);
    if (critical) {
      shutdown(code && code !== 0 ? code : 1);
    }
  });

  return child;
}

function quoteForCmd(value) {
  if (!/[ \t"]/g.test(value)) return value;
  return `"${value.replace(/"/g, '\\"')}"`;
}

function isPortOpen(port, host = "127.0.0.1", timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let settled = false;

    const done = (value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(timeoutMs);
    socket.on("connect", () => done(true));
    socket.on("timeout", () => done(false));
    socket.on("error", () => done(false));
  });
}

async function detectRunningWebPort() {
  if (await isPortOpen(3000)) return 3000;
  if (await isPortOpen(3001)) return 3001;
  return null;
}

function clearStaleNextLock() {
  const lockPath = path.join(rootDir, "apps", "web", ".next", "dev", "lock");
  if (!existsSync(lockPath)) return;
  rmSync(lockPath, { force: true });
  log(`removed stale lock: ${lockPath}`);
}

function readWorkerPid() {
  const pidPath = path.join(rootDir, ".storage", "worker.pid");
  if (!existsSync(pidPath)) return null;
  try {
    const raw = JSON.parse(readFileSync(pidPath, "utf8"));
    const pid = Number(raw?.pid);
    if (!Number.isInteger(pid) || pid <= 0) {
      rmSync(pidPath, { force: true });
      return null;
    }
    process.kill(pid, 0);
    return pid;
  } catch {
    rmSync(pidPath, { force: true });
    return null;
  }
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill("SIGINT");
      } catch {
        // ignore
      }
    }
  }

  setTimeout(() => process.exit(exitCode), 400);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function main() {
  log("starting web + worker...");

  const runningWebPort = await detectRunningWebPort();
  if (runningWebPort) {
    log(`web already running on port ${runningWebPort}. Reusing existing process.`);
  } else {
    clearStaleNextLock();
    spawnService("web", ["--filter", "web", "dev"], true);
  }

  const runningWorkerPid = readWorkerPid();
  if (runningWorkerPid) {
    log(`worker already running (pid ${runningWorkerPid}). Reusing existing process.`);
  } else {
    spawnService("worker", ["--filter", "worker", "dev"], true);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
