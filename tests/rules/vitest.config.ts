import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/rules/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    server: { deps: { inline: [/@firebase\//, /firebase/] } },
  },
});
