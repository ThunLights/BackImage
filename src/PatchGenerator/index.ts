import { minify } from "uglify-js";
import { utils } from "../utils";

export class PatchGenerator {
    public static create() {
        const script = [
        ].map(value => utils.withIIFE(value)).join(";");
        return minify(script).code;
    }
}
