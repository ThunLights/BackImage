
const fileUploaders = {
	"full-screen": null,
	"side-bar": null,
	"editor": null,
	"panel": null,
};
const vscode = acquireVsCodeApi();

const statusChanger = document.getElementById("status-changer");
const applySettingsButton = document.getElementById("apply-settings-button");
const statusPanel = document.getElementById("status-panel");
const infoStatus = document.getElementById("status");
const filePlusButton = document.getElementById("file-plus");
const dirPlusButton = document.getElementById("dir-plus");

statusChanger.onclick = async () => {
	if (infoStatus.value === "enable") {
		await vscode.postMessage(JSON.stringify({
			type: "disable"
		}));
	}
	if (infoStatus.value === "disable") {
		await vscode.postMessage(JSON.stringify({
			type: "enable"
		}));
	}
};

filePlusButton.onclick = async () => {
	await vscode.postMessage(JSON.stringify({
		type: "getImg",
		get: "files",
		id: "imgListAddFile"
	}));
};

dirPlusButton.onclick = async () => {
	await vscode.postMessage(JSON.stringify({
		type: "getImg",
		get: "directories",
		id: "imgListAddDir"
	}));
};

applySettingsButton.onclick = async () => {
	await vscode.postMessage(JSON.stringify({
		type: "update"
	}));
};

window.addEventListener("message", async (msg) => {
	const json = JSON.parse(msg.data);
	if (json.type === "enable") {
		const stats = json.status ? "enable" : "disable";

		statusPanel.textContent = json.contents.text;
		statusPanel.style.color = json.contents.color;
		statusChanger.textContent = json.contents.button;
		infoStatus.value = stats;
	}
});
