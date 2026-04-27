import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import net from "node:net";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const BACKEND_ENV_PATH = path.join(ROOT_DIR, "backend", ".env");

function parseEnvContent(content) {
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function loadBackendEnv() {
  try {
    const content = await readFile(BACKEND_ENV_PATH, "utf8");
    return parseEnvContent(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function maskValue(value) {
  if (!value) {
    return "(missing)";
  }

  if (value.length <= 6) {
    return "***";
  }

  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

async function checkCloudinaryConnection() {
  const fileEnv = await loadBackendEnv();
  const env = {
    ...fileEnv,
    ...process.env,
  };

  if (!fileEnv) {
    return {
      ok: false,
      message: "backend/.env not found. Create it from backend/.env.example first.",
    };
  }

  const cloudName = env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = env.CLOUDINARY_API_KEY || "";
  const apiSecret = env.CLOUDINARY_API_SECRET || "";

  const missingKeys = [
    ["CLOUDINARY_CLOUD_NAME", cloudName],
    ["CLOUDINARY_API_KEY", apiKey],
    ["CLOUDINARY_API_SECRET", apiSecret],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    return {
      ok: false,
      message: `Cloudinary env missing: ${missingKeys.join(", ")}`,
    };
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=1`;
  const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      signal: controller.signal,
    });

    const body = await response.text();

    if (!response.ok) {
      const detail = body.length > 200 ? `${body.slice(0, 200)}...` : body;
      return {
        ok: false,
        message: `Cloudinary check failed (${response.status}): ${detail}`,
      };
    }

    return {
      ok: true,
      message: `Cloudinary connected: cloud=${cloudName}, key=${maskValue(apiKey)}`,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        ok: false,
        message: "Cloudinary check timed out after 10s.",
      };
    }

    return {
      ok: false,
      message: `Cloudinary check failed: ${error.message}`,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function getMongoTargets(mongoUri) {
  const raw = String(mongoUri || "").trim();
  if (!raw) {
    return [];
  }

  let withoutScheme = raw;
  if (withoutScheme.startsWith("mongodb+srv://")) {
    withoutScheme = withoutScheme.slice("mongodb+srv://".length);
  } else if (withoutScheme.startsWith("mongodb://")) {
    withoutScheme = withoutScheme.slice("mongodb://".length);
  } else {
    return [];
  }

  // Remove auth part if present.
  const atIndex = withoutScheme.indexOf("@");
  if (atIndex !== -1) {
    withoutScheme = withoutScheme.slice(atIndex + 1);
  }

  const slashIndex = withoutScheme.indexOf("/");
  if (slashIndex !== -1) {
    withoutScheme = withoutScheme.slice(0, slashIndex);
  }

  const hosts = withoutScheme.split(",").map((entry) => entry.trim()).filter(Boolean);
  return hosts.map((entry) => {
    const [host, port] = entry.split(":");
    return {
      host: host || "localhost",
      port: Number(port) || 27017,
    };
  });
}

function canConnectTcp(host, port, timeoutMs = 3500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const done = (ok, reason = "") => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve({ ok, reason });
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false, "timeout"));
    socket.once("error", (error) => done(false, error.message));
    socket.connect(port, host);
  });
}

function getBackendPort(fileEnv) {
  const raw = process.env.PORT || fileEnv?.PORT || "5000";
  const parsed = Number(raw);
  if (Number.isInteger(parsed) && parsed > 0 && parsed <= 65535) {
    return parsed;
  }
  return 5000;
}

async function detectBackendOnPort(port) {
  const tcpProbe = await canConnectTcp("127.0.0.1", port, 1200);
  if (!tcpProbe.ok) {
    return {
      portInUse: false,
      signLearnBackend: false,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`http://localhost:${port}/api/health`, {
      method: "GET",
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);
    const signLearnBackend = Boolean(response.ok && payload?.ok === true);

    return {
      portInUse: true,
      signLearnBackend,
    };
  } catch (_error) {
    return {
      portInUse: true,
      signLearnBackend: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkMongoConnection() {
  const fileEnv = await loadBackendEnv();
  const env = {
    ...fileEnv,
    ...process.env,
  };

  const mongoUri = env.MONGODB_URI || env.MONGO_URI || "";
  if (!mongoUri) {
    return {
      ok: false,
      message: "Mongo env missing: set MONGODB_URI or MONGO_URI in backend/.env.",
    };
  }

  const targets = getMongoTargets(mongoUri);
  if (!targets.length) {
    return {
      ok: false,
      message: "Mongo URI format not recognized for precheck.",
    };
  }

  for (const target of targets) {
    const probe = await canConnectTcp(target.host, target.port);
    if (probe.ok) {
      return {
        ok: true,
        message: `MongoDB reachable at ${target.host}:${target.port}`,
      };
    }
  }

  return {
    ok: false,
    message: `MongoDB not reachable for URI: ${mongoUri}`,
  };
}

async function startDevServers(backendPort) {
  const npmCmd = "npm";

  const backendProbe = await detectBackendOnPort(backendPort);
  let backend = null;

  if (backendProbe.portInUse && backendProbe.signLearnBackend) {
    console.log(`Backend already running on http://localhost:${backendPort}. Reusing existing server.`);
  } else if (backendProbe.portInUse) {
    console.error(
      `Port ${backendPort} is already in use by another process. Stop it or change backend PORT in backend/.env.`
    );
    process.exit(1);
  } else {
    backend = spawn(npmCmd, ["run", "backend:start"], {
      cwd: ROOT_DIR,
      stdio: "inherit",
      env: process.env,
      shell: true,
    });
  }

  const frontend = spawn(npmCmd, ["run", "frontend:dev"], {
    cwd: ROOT_DIR,
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_API_URL: process.env.VITE_API_URL || `http://localhost:${backendPort}`,
    },
    shell: true,
  });

  let shuttingDown = false;

  function shutdown(code = 0) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    if (backend && !backend.killed) {
      backend.kill("SIGTERM");
    }

    if (!frontend.killed) {
      frontend.kill("SIGTERM");
    }

    setTimeout(() => process.exit(code), 300);
  }

  if (backend) {
    backend.on("exit", (code) => {
      if (!shuttingDown) {
        console.error(`Backend process exited with code ${code ?? 0}.`);
        shutdown(code ?? 1);
      }
    });
  }

  frontend.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`Frontend process exited with code ${code ?? 0}.`);
      shutdown(code ?? 1);
    }
  });

  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));
}

async function main() {
  const checkOnly = process.argv.includes("--check-only");
  const skipCloudinaryCheck = process.argv.includes("--skip-cloudinary-check");
  const skipMongoCheck = process.argv.includes("--skip-mongo-check");
  const backendEnv = await loadBackendEnv();
  const backendPort = getBackendPort(backendEnv);

  if (skipCloudinaryCheck) {
    console.log("Skipping Cloudinary connection check.");
  } else {
    console.log("Checking Cloudinary connection...");
    const result = await checkCloudinaryConnection();

    if (!result.ok) {
      console.error(result.message);
      process.exit(1);
    }

    console.log(result.message);
  }

  if (checkOnly) {
    console.log("Cloudinary check completed.");
    process.exit(0);
  }

  if (skipMongoCheck) {
    console.log("Skipping MongoDB connection precheck.");
  } else {
    console.log("Checking MongoDB connection...");
    const mongoResult = await checkMongoConnection();
    if (!mongoResult.ok) {
      console.error(mongoResult.message);
      process.exit(1);
    }
    console.log(mongoResult.message);
  }

  console.log("Starting backend and frontend dev servers...");
  console.log(`Backend: http://localhost:${backendPort}`);
  console.log("Frontend: http://localhost:5173");
  await startDevServers(backendPort);
}

main().catch((error) => {
  console.error("Failed to run dev bootstrap:", error);
  process.exit(1);
});
