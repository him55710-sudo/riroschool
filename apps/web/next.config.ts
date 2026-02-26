import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(appDir, "../..");

// Monorepo convenience: allow apps/web to consume root .env/.env.local values.
loadEnvConfig(workspaceRoot, process.env.NODE_ENV !== "production");

const nextConfig: NextConfig = {
    transpilePackages: ["shared"],
};

export default nextConfig;
