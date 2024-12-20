import {
	commands,
	ExtensionContext,
	window
} from "vscode";

import { ReaderViewProvider } from "./ActivityBar/index";
import { FileBackuController } from "./BackupFile/index";
import { FolderController } from "./ImgList/index";

export async function activate(context: ExtensionContext) {
	const backup = new FileBackuController();
	const folder = new FolderController(context);

	if (await backup.setup() || await backup.update(folder)) {
		await commands.executeCommand("workbench.action.reloadWindow");
	};

	const readerViewProvider = new ReaderViewProvider(context.extensionUri, context, folder);

	context.subscriptions.push(
		window.registerWebviewViewProvider(ReaderViewProvider.viewType, readerViewProvider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			}
		}),
		commands.registerCommand("extension.backimage.restore", async () => {
			await folder.enable.update(false);
			await backup.restore();
			await commands.executeCommand("workbench.action.reloadWindow");
		}),
		commands.registerCommand("extension.backimage.refresh", async () => {
			if (await backup.update(folder)) {
				await commands.executeCommand("workbench.action.reloadWindow");
			}
		})
	);
}

export async function deactivate() {}
