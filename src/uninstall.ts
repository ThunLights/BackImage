import { FileBackuController } from "./BackupFile";

async function uninstall() {
    const backup = new FileBackuController();
    await backup.restore();
};

(async () => {
    await uninstall();
})();
