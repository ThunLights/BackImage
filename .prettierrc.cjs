
/** @type {import("prettier").Config} */
module.exports = {
    singleQuote: false,
    tabWidth: 4,
    endOfLine: "auto",
    printWidth: 500,
    overrides: [
        {
            files: ['*.md', 'package(-lock)?.json', '*.ya?ml'],
            options: {
                singleQuote: false,
                tabWidth: 2
            }
        }
    ],
    plugins: ["@ianvs/prettier-plugin-sort-imports"],
    importOrder: [
        "<BUILTIN_MODULES>",
        "",
        "<THIRD_PARTY_MODULES>",
        "",
        "^[.]"
    ],
    importOrderTypeScriptVersion: "5.0.0",
    importOrderCaseSensitive: true
};
