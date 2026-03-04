import { expect, test } from "vitest";
import { parseArgs } from "./index";

test("parseArgs returns target directory", () => {
  const result = parseArgs(["my-app"]);
  expect(result.targetDir).toBe("my-app");
});
