import { css } from "../utils/css";
import { AbsPatchGenerator } from "./PatchGenerator.base";

const Translations = [
    // en, default
    "installation appears to be corrupt. Please reinstall.",
    // cs
    "je pravděpodobně poškozená. Proveďte prosím přeinstalaci.",
    // de
    "Installation ist offenbar beschädigt. Führen Sie eine Neuinstallation durch.",
    // es
    "parece estar dañada. Vuelva a instalar.",
    // fr
    "semble être endommagée. Effectuez une réinstallation.",
    // it
    "sembra danneggiata. Reinstallare.",
    // ja
    "インストールが壊れている可能性があります。再インストールしてください。",
    // ko
    "설치가 손상된 것 같습니다. 다시 설치하세요.",
    // pl
    "prawdopodobnie jest uszkodzona. Spróbuj zainstalować ponownie.",
    // pt-BR
    "parece estar corrompida. Reinstale-o.",
    // qps-ploc
    "ïñstællætïøñ æppëærs tø þë çørrµpt. Plëæsë rëïñstæll.",
    // ru
    "повреждена. Повторите установку.",
    // tr
    "yüklemeniz bozuk gibi görünüyor. Lütfen yeniden yükleyin.",
    // zh-hans
    "安装似乎损坏。请重新安装。",
    // zh-hant
    "安裝似乎已損毀。請重新安裝。"
];

export class ChecksumsPatchGenerator extends AbsPatchGenerator<null> {
    constructor() {
        super(null);
    }
    protected getStyle(): string {
        return Translations.map(
            trans => css`
                .notification-toast-container:has([aria-label*="${trans}"]) {
                    display: none;
                }
            `
        ).join(" ");
    }
}
