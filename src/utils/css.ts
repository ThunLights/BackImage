
function css<T>(template: TemplateStringsArray, ...args: T[]) {
    return template.reduce((prev, curr, i) => {
        let arg: T | string = args[i];

        if (typeof arg === "function") {
            arg = arg();
        }
        if (Array.isArray(arg)) {
            arg = arg.join("");
        }

        return prev + curr + (arg ?? "");
    }, "");
};

export {
    css,
};
