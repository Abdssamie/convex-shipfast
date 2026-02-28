/// <reference types="vite/client" />
import type { TestConvex } from "convex-test";
import type { GenericSchema, SchemaDefinition } from "convex/server";
import betterAuthSchema from "./features/auth/schema";

export const modules = import.meta.glob("./**/!(*.*.*)*.*s");
const betterAuthModules = import.meta.glob("./features/auth/**/*.ts");

export const registerComponents = (
  t: TestConvex<SchemaDefinition<GenericSchema, boolean>>
) => {
  t.registerComponent("betterAuth", betterAuthSchema, betterAuthModules);
};
