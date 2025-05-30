import { string } from "rollup-plugin-string"

export default {
    input: "./list/list.test.js",
    output: {
        file: "./test/bundle.js",
        format: "iife",
        name: "leistrap",

    },
    plugins: [
        string({
            include: ["**/*.html", "**/*.css", "**/*.m.js"]
        }),
  
    ]
}