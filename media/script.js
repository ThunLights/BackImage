
const vscode = acquireVsCodeApi();

const statusChanger = document.getElementById("status-changer");
const applySettingsButton = document.getElementById("apply-settings-button");
const statusPanel = document.getElementById("status-panel");
const filePlusButton = document.getElementById("file-plus");
const dirPlusButton = document.getElementById("dir-plus");

const infoStatus = document.getElementById("status");
const infoFullScreen = document.getElementById("switch-fullscreen");
const infoSideBar = document.getElementById("switch-side-bar");
const infoEditor = document.getElementById("switch-editor");
const infoPanel = document.getElementById("switch-panel");

const select2button = {
	"full-screen": "full-screen-button",
	"side-bar": "side-bar-button",
	"editor": "editor-button",
	"panel": "panel-button",
};
const button2Status = {
	"full-screen-button": infoFullScreen,
	"side-bar-button": infoSideBar,
	"editor-button": infoEditor,
	"panel-button": infoPanel,
};

for (const [button, status] of Object.entries(button2Status)) {
	document.getElementById(button).onclick = async () => {
		status.value = status.value === "enable" ? "disable" : "enable";
		await buttonClicked();
	};
}

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
	if (json.type === "settingsUpdate") {
		if (Array.isArray(json.content)) {
			if (json.content.includes("panel")) {
				infoPanel.value = "enable";
			}
			if (json.content.includes("side-bar")) {
				infoSideBar.value = "enable";
			}
			if (json.content.includes("editor")) {
				infoEditor.value = "enable";
			}
		} else if (json.content === "fullscreen") {
			infoFullScreen.value = "enable";
			infoSideBar.value = "disable";
			infoEditor.value = "disable";
			infoPanel.value = "disable";
		} else {
			infoFullScreen.value = "disable";
			infoSideBar.value = "disable";
			infoEditor.value = "disable";
			infoPanel.value = "disable";
		};
		buttonsUpdate();
	}
});

function enableOrDisable(content) {
	return content ? "enable" : "disable";
}

function buttonsUpdate() {
	for (const [button, status] of Object.entries(button2Status)) {
		if (status.value === "enable") {
			document.getElementById(button).textContent = "ON";
		} else {
			document.getElementById(button).textContent = "OFF";
		}
	}
}

async function buttonClicked() {
	let bgType = null;
	if (infoFullScreen.value === "enable") {
		bgType = "fullscreen";
	} else {
		let bgTypes = [];
		if (infoSideBar.value === "enable") { bgTypes.push("side-bar"); }
		if (infoPanel.value === "enable") { bgTypes.push("panel"); }
		if (infoEditor.value === "enable") { bgTypes.push("editor"); }
		bgType = bgTypes.length ? bgTypes : null;
	}
	await vscode.postMessage(JSON.stringify({
		type: "settingsUpdate",
		content: bgType,
	}));
}
