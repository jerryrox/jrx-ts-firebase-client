import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, "src/main.ts"),
            name: "jrx-ts-firebase-client",
            formats: ["es"],
            fileName: (format) => `index.${format}.js`,
        }
    },
    resolve: {
        alias: {
            src: resolve("src/"),
        }
    },
    plugins: [
        dts(),
    ],
})