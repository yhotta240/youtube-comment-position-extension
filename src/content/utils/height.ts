import { settings, getLayoutSettings } from "../state";
import { setSettings } from "../../settings";

export function isLargeScreenLayout(): boolean {
  return window.innerWidth >= 1017;
}

export function calculateHeight(): number {
  const header = document.querySelector<HTMLElement>('#container.style-scope.ytd-masthead');
  const headerHeight = header ? header.offsetHeight : 0;
  const windowHeight = window.innerHeight;

  const isLargeScreen = isLargeScreenLayout();
  let height = null;

  if (isLargeScreen) {
    height = getLayoutSettings().largeHeight;
    settings.large.height = height ? height : windowHeight - headerHeight - 155;
  } else {
    height = getLayoutSettings().mediumHeight;
    settings.medium.height = height ? height : windowHeight - headerHeight - 205;
  }

  setSettings(settings);
  return height ? height : windowHeight - headerHeight - 155;
}
