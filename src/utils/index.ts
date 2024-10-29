import sudo from "@vscode/sudo-prompt";

export namespace utils {
    export function sudoExec(cmd: string, options: { name?: string } = {}) {
        return new Promise((resolve, reject) => {
            sudo.exec(cmd, options, (error?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => {
                if (error) {
                    reject(error);
                }
                resolve([stdout, stderr]);
            });
        });
    }
    export function escape(content: string): string {
        return content.replaceAll(`"`, `\"`);
    }
};
