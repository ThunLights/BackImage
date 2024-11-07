import { FileBackuController } from "./BackupFile/index";

async function uninstall() {
    const backup = new FileBackuController();
    await backup.restore();
};

(async () => {
    await uninstall();
})();
