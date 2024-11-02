import {
	commands,
	ExtensionContext,
	window
} from "vscode";

import { ReaderViewProvider } from "./activity/index";
import { FileBackuController } from "./BackupFile/index";

export async function activate(context: ExtensionContext) {
	const backup = new FileBackuController();

	await backup.setup();

	const readerViewProvider = new ReaderViewProvider(context.extensionUri, context);

	context.subscriptions.push(
		window.registerWebviewViewProvider(ReaderViewProvider.viewType, readerViewProvider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			}
		}),
		commands.registerCommand("extension.backimage.refresh", async () => {
            await commands.executeCommand("workbench.action.reloadWindow");
		})
	);
}

export async function deactivate() {}
