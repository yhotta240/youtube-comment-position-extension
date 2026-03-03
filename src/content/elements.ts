import { YoutubeElements } from "./types";

export const getElements = (): YoutubeElements => ({
  ytdWatchFlexy: document.querySelector<HTMLElement>("ytd-watch-flexy"),
  columns: document.querySelector<HTMLElement>("#columns.style-scope.ytd-watch-flexy"),
  primary: document.querySelector<HTMLElement>("#primary.style-scope.ytd-watch-flexy"),
  primaryInner: document.querySelector<HTMLElement>("#primary-inner.style-scope.ytd-watch-flexy"),
  player: document.querySelector<HTMLElement>('#player.style-scope.ytd-watch-flexy'),
  playerContainerOuter: document.querySelector<HTMLElement>("#player-container-outer.style-scope.ytd-watch-flexy"),
  below: document.querySelector<HTMLElement>('#below.style-scope.ytd-watch-flexy'),
  secondary: document.querySelector<HTMLElement>('#secondary.style-scope.ytd-watch-flexy'),
  secondaryInner: document.querySelector<HTMLElement>('#secondary-inner.style-scope.ytd-watch-flexy'),
  comments: document.querySelector<HTMLElement>('#comments.style-scope.ytd-watch-flexy'),
  related: document.querySelector<HTMLElement>('#related.style-scope.ytd-watch-flexy'),
  cinematics: document.querySelector<HTMLElement>("#cinematics.style-scope.ytd-watch-flexy"),
  metaData: document.querySelector<HTMLElement>("#below > ytd-watch-metadata"),
  ytdApp: document.querySelector<HTMLElement>('ytd-app'),
  fullBleed: document.querySelector<HTMLElement>("#full-bleed-container.style-scope.ytd-watch-flexy"),
  video: document.querySelector<HTMLVideoElement>("video.html5-main-video"),
  dragHandle: document.querySelector<HTMLElement>('.ycp-drag-handle'),
});
