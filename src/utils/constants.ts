import pkg from '../../package.json';
import { cssPath, jsPath } from './vscodePath';

export const VERSION = pkg.version;

export const PKG_NAME = pkg.name;

export const ORIGINAL_JS_CONTENT_START = `${PKG_NAME}.${VERSION}`;

export const ORIGINAL_JS_CONTENT_END = `END.${PKG_NAME}.${VERSION}`;

export const ENCODING = "utf-8";

export const BACKUP_JS_PATH = jsPath + ".backup";

export const BACKUP_CSS_PATH = cssPath + ".backup";

export const IMG_FILE_EXTENSIONS = [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
    "svg",
    "bmp",
    "ico",
];
