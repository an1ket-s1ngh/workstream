export interface ParsedArgs {
  command: string;
  positionals: string[];
  flags: Record<string, string | boolean>;
}

/**
 * Minimal argv parser: `ws <command> [positionals...] [--flag value|--flag]`.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === undefined) break;

    if (token === "--") {
      positionals.push(...rest.slice(i + 1));
      break;
    }

    if (token.startsWith("--")) {
      const eq = token.indexOf("=");
      if (eq !== -1) {
        const key = token.slice(2, eq);
        const value = token.slice(eq + 1);
        flags[key] = value;
        continue;
      }

      const key = token.slice(2);
      const next = rest[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = true;
      }
      continue;
    }

    if (token.startsWith("-") && token.length === 2) {
      const key = token.slice(1);
      const next = rest[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = true;
      }
      continue;
    }

    positionals.push(token);
  }

  return { command, positionals, flags };
}

export function flagString(
  flags: Record<string, string | boolean>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const v = flags[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

export function flagBool(
  flags: Record<string, string | boolean>,
  ...keys: string[]
): boolean {
  for (const key of keys) {
    const v = flags[key];
    if (v === true || v === "true" || v === "1") return true;
  }
  return false;
}
