import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { externalizeDeps } from "vite-plugin-externalize-deps";

export default defineConfig({
    build: {
        sourcemap: true,
        emptyOutDir: true,
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "jrx-ts-firebase-client",
            fileName: (format) => `index.${format}.js`,
        },
    },
    resolve: {
        alias: {
            src: resolve("src/"),
        }
    },
    plugins: [
        dts(),
        externalizeDeps(),
    ],
})