
const fileUploaders = {
	"full-screen": null,
};
const vscode = acquireVsCodeApi();

const statusChanger = document.getElementById("status-changer");
const applySettingsButton = document.getElementById("apply-settings-button");
const statusPanel = document.getElementById("status-panel");
const infoStatus = document.getElementById("status");

for (const elementId of Object.keys(fileUploaders)) {
	const fileUploader = document.getElementById(elementId);
	fileUploader.onchange = async (e) => {
//		fileUploaders[elementId] = e.target;
		vscode.postMessage(JSON.stringify({
			type: "log",
			text: fileUploader.value,
		}));
	};
}

document.getElementById("test-button").onclick = async () => {
	vscode.postMessage(JSON.stringify({
		type: "test"
	}));
};

statusChanger.onclick = async () => {
	if (infoStatus.value === "enable") {
		vscode.postMessage(JSON.stringify({
			type: "disable"
		}));
	}
	if (infoStatus.value === "disable") {
		vscode.postMessage(JSON.stringify({
			type: "enable"
		}));
	}
};

applySettingsButton.onclick = async () => {
	vscode.postMessage(JSON.stringify({
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
