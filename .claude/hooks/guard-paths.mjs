#!/usr/bin/env node
// PreToolUse guard: in store repos (.repo-role = "store"), file edits stay inside the brand layer.
// Maintainers override with ALLOW_BASE_EDITS=1. Base repos allow everything.
import { readFileSync } from "node:fs";
import path from "node:path";

const STORE_EDITABLE = ["brand/", "public/", "docs/", ".env.example"];

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

const input = readStdin();
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

let role = "base";
try {
  role = readFileSync(path.join(root, ".repo-role"), "utf8").trim() || "base";
} catch {
  // No marker: behave like the base repo.
}

if (role !== "store" || process.env.ALLOW_BASE_EDITS === "1") process.exit(0);

const filePath = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
if (!filePath) process.exit(0);

const relative = path.relative(root, path.resolve(root, filePath)).split(path.sep).join("/");
const allowed = STORE_EDITABLE.some((prefix) =>
  prefix.endsWith("/") ? relative.startsWith(prefix) : relative === prefix,
);
if (allowed) process.exit(0);

process.stderr.write(
  [
    `Blocked: "${relative}" is part of the shared base, not this store's brand layer.`,
    "This store repo only edits brand/, public/, docs/ and .env.example, so base updates keep merging cleanly.",
    "What to do: make the change in brand/ instead if possible. If it truly needs a base change, tell the user:",
    '"This is a base change. Please open a Change request in the base repo (aa-del9/e-commerce-shop) or ask a developer."',
    "Maintainers can override with ALLOW_BASE_EDITS=1.",
  ].join("\n"),
);
process.exit(2);
