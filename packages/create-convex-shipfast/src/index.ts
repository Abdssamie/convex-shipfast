#!/usr/bin/env node
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

type ArgsResult = {
  targetDir: string;
};

export const parseArgs = (args: string[]): ArgsResult => {
  const targetDir = args[0] ?? "convex-shipfast";
  return { targetDir };
};

type Degit = (
  repo: string,
  options: {
    force: boolean;
  }
) => {
  clone: (target: string) => Promise<void>;
};

type DegitModule = {
  default: Degit;
};

const run = async (): Promise<void> => {
  const degitSpecifier =
    process.env["CREATE_CONVEX_SHIPFAST_DEGIT"] ?? "degit";
  const degitModule = (await import(degitSpecifier)) as DegitModule;
  const { default: degit } = degitModule;
  const { targetDir } = parseArgs(process.argv.slice(2));
  const fullPath = path.resolve(process.cwd(), targetDir);

  if (existsSync(fullPath)) {
    throw new Error(`Target directory already exists: ${targetDir}`);
  }

  await mkdir(fullPath, { recursive: true });
  const emitter = degit("abdssamie/convex-shipfast", { force: true });
  await emitter.clone(fullPath);

  const envExample = path.join(fullPath, ".env.example");
  const envLocal = path.join(fullPath, ".env.local");
  if (existsSync(envExample) && !existsSync(envLocal)) {
    await copyFile(envExample, envLocal);
  }
};

const argvPath = process.argv[1];
const isDirectRun = argvPath
  ? pathToFileURL(argvPath).href === import.meta.url
  : false;

if (isDirectRun) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
