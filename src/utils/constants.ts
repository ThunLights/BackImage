import pkg from '../../package.json';
import { cssPath, jsPath } from './vscodePath';

export const VERSION = pkg.version;

export const ENCODING = "utf-8";

export const BACKUP_JS_PATH = jsPath + ".backup";

export const BACKUP_CSS_PATH = cssPath + ".backup";
