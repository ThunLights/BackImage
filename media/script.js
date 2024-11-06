
const vscode = acquireVsCodeApi();

const statusChanger = document.getElementById("status-changer");
const applySettingsButton = document.getElementById("apply-settings-button");
const statusPanel = document.getElementById("status-panel");
const filePlusButton = document.getElementById("file-plus");
const dirPlusButton = document.getElementById("dir-plus");
const imgLists = document.getElementById("img-lists");

const infoStatus = document.getElementById("status");
const infoFullScreen = document.getElementById("switch-fullscreen");
const infoSideBar = document.getElementById("switch-side-bar");
const infoEditor = document.getElementById("switch-editor");
const infoPanel = document.getElementById("switch-panel");

const extraInputAllowCharacter = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
];
const select2button = {
	"full-screen": "full-screen-button",
	"side-bar": "side-bar-button",
	"editor": "editor-button",
	"panel": "panel-button",
};
const button2select = {
	"full-screen-button": "full-screen",
	"side-bar-button": "side-bar",
	"editor-button": "editor",
	"panel-button": "panel",
};
const button2Status = {
	"full-screen-button": infoFullScreen,
	"side-bar-button": infoSideBar,
	"editor-button": infoEditor,
	"panel-button": infoPanel,
};
const imgListInfos = {};

vscode.postMessage(JSON.stringify({
	type: "start"
}));

for (const [button, status] of Object.entries(button2Status)) {
	const selectorId = button2select[button];
	const systemId = selectIdChanger(selectorId);
	const selectElement = document.getElementById(selectorId);
	const selectorSettingsPanel = document.getElementById(`${selectorId}-settings-panel`);
	const selectorRangeElement = document.getElementById(`${selectorId}-opacity-range`);
	const selectorValueElement = document.getElementById(`${selectorId}-opacities-content`);
	selectorRangeElement.oninput = async (e) => {
		selectorValueElement.textContent = e.target.value;
		await vscode.postMessage(JSON.stringify({
			type: "updateOpacity",
			id: systemId,
			content: Number(e.target.value) / 100,
		}));
	};
	selectorValueElement.onkeyup = async (e) => {
		e.target.textContent = charChecker(e.target.textContent);
		if (e.key === "Enter") {
			let num = Number(e.target.textContent);
			if (isNaN(num)) {
				num = 85;
			}
			if (num > 100) {
				num = 100;
			}
			if (0 > num) {
				num = 0;
			}
			e.target.textContent = num.toString();
			selectorRangeElement.value = num.toString();
			await vscode.postMessage(JSON.stringify({
				type: "updateOpacity",
				id: systemId,
				content: num / 100,
			}));
		}
	};
	selectElement.onchange = async () => {
		const value = selectElement.value === "" ? null : selectElement.value;
		await vscode.postMessage(JSON.stringify({
			type: "updateSelect",
			id: systemId,
			content: value,
		}));
	};
	document.getElementById(`${systemId}-info`).onclick = async () => {
		if (selectorSettingsPanel.style.display === "none") {
			selectorSettingsPanel.style.display = "block";
		} else {
			selectorSettingsPanel.style.display = "none";
		}
	};
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
	if (json.type === "getImg") {
		if (json.id.startsWith("imgListAdd") && json.path) {
			await vscode.postMessage(JSON.stringify({
				type: "imgList",
				action: "add",
				fType: json.get,
				path: json.path,
			}));
		}
		if (json.id.startsWith("imgListEdit") && json.path) {
			const id = json.id.replaceAll("imgListEdit", "");
			await vscode.postMessage(JSON.stringify({
				type: "imgList",
				action: "update",
				id,
				name: undefined,
				description: undefined,
				path: json.path,
			}));
		}
	}
	if (json.type === "start") {
		scriptUpdate(json.ids);
		await updateSelectors(json.ids, json.selects);
	}
	if (json.type === "updateImgList") {
		imgLists.innerHTML = json.imgs;
		selectorUpdate(json.options);
		scriptUpdate(json.ids);
		await updateSelectors(json.ids, json.selects);
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

function scriptUpdate(ids) {
	for (const id of ids) {
		const name = document.getElementById(`name_${id}`).textContent;
		const description = document.getElementById(`description_${id}`).textContent;
		const newName = document.getElementById(`update-name-content-${id}`);
		const newDescription = document.getElementById(`update-description-content-${id}`);

		const nameUpdate = document.getElementById(`name-update-${id}`);
		const descriptionUpdate = document.getElementById(`description-update-${id}`);
		const moreInfoElement = document.getElementById(`more_info_${id}`);
		const deleteSelectorElement = document.getElementById(`delete_final_confirmation_${id}`);

		const editName = document.getElementById(`edit_name_${id}`);
		const editPath = document.getElementById(`edit_path_${id}`);
		const editDescription = document.getElementById(`edit_description_${id}`);
		const elementType = document.getElementById(`element_type_${id}`).value;

		editPath.onclick = async () => {
			await vscode.postMessage(JSON.stringify({
				type: "getImg",
				get: elementType,
				id: `imgListEdit${id}`,
			}));
		};
		document.getElementById(`edit_name_${id}`).onclick = async () => {
			nameUpdate.style.display = "block";
		};
		document.getElementById(`edit_description_${id}`).onclick = async () => {
			descriptionUpdate.style.display = "block";
		};
		document.getElementById(`update_name_select_${id}`).onclick = async () => {
			await vscode.postMessage(JSON.stringify({
				type: "imgList",
				action: "update",
				id,
				name: newName.value,
				description: undefined,
				path: undefined,
			}));
		};
		document.getElementById(`update_description_select_${id}`).onclick = async () => {
			await vscode.postMessage(JSON.stringify({
				type: "imgList",
				action: "update",
				id,
				name: undefined,
				description: newDescription.value,
				path: undefined,
			}));
		};
		document.getElementById(`update_name_cancel_${id}`).onclick = async () => {
			nameUpdate.style.display = "none";
			newName.value = name;
		};
		document.getElementById(`update_description_cancel_${id}`).onclick = async () => {
			descriptionUpdate.style.display = "none";
			newDescription.value = description;
		};
		document.getElementById(`info_${id}`).onclick = async () => {
			if (moreInfoElement.style.display === "block") {
				moreInfoElement.style.display = "none";
				editName.style.display = "none";
				editPath.style.display = "none";
				editDescription.style.display = "none";
			} else {
				moreInfoElement.style.display = "block";
				editName.style.display = "";
				editPath.style.display = "";
				editDescription.style.display = "";
			}
		};
		document.getElementById(`delete_${id}`).onclick = async () => {
			deleteSelectorElement.style.display = "grid";
		};
		document.getElementById(`delete_cancel_${id}`).onclick = async () => {
			deleteSelectorElement.style.display = "none";
		};
		document.getElementById(`delete_select_${id}`).onclick = async () => {
			await vscode.postMessage(JSON.stringify({
				type: "imgList",
				action: "remove",
				id: id,
			}));
		};
	}
}

function charChecker(input) {
	let result = "";
	const chars = input.split("");
	for (const char of chars) {
		if (extraInputAllowCharacter.includes(char)) {
			result += char;
		}
	}
	return result;
}

function selectorUpdate(options) {
	const selectors = document.getElementsByClassName("contents-selector");
	for (const selector of selectors) {
		selector.innerHTML = options;
	}
}

function selectIdChanger(content) {
	return content === "full-screen"
		? "fullscreen"
		: content === "side-bar"
			? "sideBar"
			: content;
}

function systemIdChanger(content) {
	return content === "fullscreen"
		? "full-screen"
		: content === "sideBar"
			? "side-bar"
			: content;
}

async function updateSelectors(ids, selects) {
	for (const [key, value] of Object.entries(selects)) {
		if (value) {
			const element = document.getElementById(systemIdChanger(key));
			if (ids.includes(value)) {
				element.value = value;
			} else {
				element.value = "";
				await vscode.postMessage(JSON.stringify({
					type: "updateSelect",
					id: key,
					content: null,
				}));
			}
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
