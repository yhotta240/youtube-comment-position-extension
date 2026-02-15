import { settings, getLayoutSettings } from "../state";
import { setSettings } from "../../settings";

export function isLargeScreenLayout(): boolean {
  const pageManager = document.querySelectorAll<HTMLElement>("#page-manager > ytd-watch-flexy")[0];
  if (!pageManager) return false;

  const isTwoColumn = pageManager.attributes["default-two-column-layout" as keyof typeof pageManager.attributes];
  const isTwoColumns = pageManager.attributes["is-two-columns_" as keyof typeof pageManager.attributes];

  return !(isTwoColumn === undefined) && !(isTwoColumns === undefined);
}

export function calculateHeight(): number {
  const header = document.querySelector<HTMLElement>('#container.style-scope.ytd-masthead');
  const headerHeight = header ? header.offsetHeight : 0;
  const windowHeight = window.innerHeight;

  const isLargeScreen = isLargeScreenLayout();
  let height = null;

  if (isLargeScreen) {
    height = getLayoutSettings().largeHeight;
    settings.largeLayout.height = height ? height : windowHeight - headerHeight - 155;
  } else {
    height = getLayoutSettings().mediumHeight;
    settings.mediumLayout.height = height ? height : windowHeight - headerHeight - 205;
  }

  setSettings(settings);
  return height ? height : windowHeight - headerHeight - 155;
}
