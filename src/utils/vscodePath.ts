import path from "path";

import { env } from "vscode";

const basePath = path.join(env.appRoot, "out", "vs", "workbench");

const jsPath = path.join(basePath, "workbench.desktop.main.js");

const cssPath = function() {
    const { appHost } = env;
    const host = appHost === "desktop" ? appHost : "web";
    return path.join(basePath, `workbench.${host}.main.css`);
}();

export {
    basePath,
    cssPath,
    jsPath,
};
