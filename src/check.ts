import { readFile, access } from "node:fs/promises";
import path from "node:path";
import type { CheckResult, Session } from "./types.js";

/**
 * Delivery contract: optional criteria file listing required outcomes.
 *
 * Format (plain text, one criterion per line):
 *   - Lines starting with # are comments
 *   - Empty lines ignored
 *   - Optional prefix: `file:` path that must exist relative to workspace
 *   - Optional prefix: `text:` substring that must appear in session turns
 *   - Bare lines are treated as `text:` criteria
 *
 * Example criteria file:
 *   # Ship checklist
 *   file:dist/cli.js
 *   text:tests pass
 *   done criteria documented
 */
export async function checkDeliveryContract(
  session: Session,
  cwd: string,
): Promise<CheckResult> {
  const notes: string[] = [];
  const missing: string[] = [];

  if (!session.criteriaFile) {
    notes.push("No criteriaFile set on session; nothing to validate.");
    return {
      session: session.name,
      ok: true,
      missing,
      notes,
    };
  }

  const criteriaPath = path.resolve(cwd, session.criteriaFile);
  try {
    await access(criteriaPath);
  } catch {
    return {
      session: session.name,
      ok: false,
      criteriaFile: session.criteriaFile,
      missing: [`criteria file missing: ${session.criteriaFile}`],
      notes: ["Attach a criteria file with `ws spawn --criteria <path>`."],
    };
  }

  const raw = await readFile(criteriaPath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  if (lines.length === 0) {
    notes.push("Criteria file is empty (only comments/blank lines).");
    return {
      session: session.name,
      ok: true,
      criteriaFile: session.criteriaFile,
      missing,
      notes,
    };
  }

  const transcript = session.turns.map((t) => t.content).join("\n");

  for (const line of lines) {
    if (line.startsWith("file:")) {
      const rel = line.slice("file:".length).trim();
      const target = path.resolve(cwd, rel);
      try {
        await access(target);
        notes.push(`present: file:${rel}`);
      } catch {
        missing.push(`file:${rel}`);
      }
      continue;
    }

    const needle = line.startsWith("text:")
      ? line.slice("text:".length).trim()
      : line;

    if (needle.length === 0) continue;

    if (transcript.includes(needle)) {
      notes.push(`present: text:${needle}`);
    } else {
      missing.push(`text:${needle}`);
    }
  }

  return {
    session: session.name,
    ok: missing.length === 0,
    criteriaFile: session.criteriaFile,
    missing,
    notes,
  };
}
