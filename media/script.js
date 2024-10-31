
const vscode = acquireVsCodeApi();

const statusChanger = document.getElementById("status-changer");
const statusPanel = document.getElementById("status-panel");
const infoStatus = document.getElementById("status");

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
