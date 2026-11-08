#!/usr/bin/env node
// PostToolUse: format the file Claude just edited with oxfmt. Never blocks; formatting is best effort.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const FORMATTED = new Set([".ts", ".tsx", ".js", ".mjs", ".mts", ".json", ".md", ".css"]);

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  process.exit(0);
}
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const filePath = input.tool_input?.file_path;
if (!filePath || !FORMATTED.has(path.extname(filePath))) process.exit(0);
const absolute = path.resolve(root, filePath);
const binary = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "oxfmt.cmd" : "oxfmt");
if (!existsSync(absolute) || !existsSync(binary)) process.exit(0);
spawnSync(binary, [absolute], { cwd: root, shell: process.platform === "win32", stdio: "ignore" });
process.exit(0);
