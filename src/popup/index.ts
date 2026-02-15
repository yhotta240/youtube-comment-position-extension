import { PopupManager } from "./manager";
import { applyTheme, getTheme } from "./components/theme";

try {
  // フラッシュ防止のため先にテーマを適用
  const theme = getTheme();
  applyTheme(theme);
} catch (e) {
  // ignore
}

document.addEventListener('DOMContentLoaded', () => new PopupManager());