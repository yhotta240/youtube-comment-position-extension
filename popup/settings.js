const DEFAULT_SETTINGS = {
  largeLayout: {
    positionId: "large-layout-position",
    position: "large-position-leftside",
    positionImgId: "large-image",
    positionImage: "./images/large-layout-comments-secondary-left.png",
    heightId: "large-height-comments",
    height: null,
    options: {
      stickyPlayer: {
        id: "large-layout-sticky-player-option",
        option: false,
      },
      stickyComments: {
        id: "large-layout-sticky-comments-option",
        option: false,
      }
    },
    positionPrefix: "large",
  },
  mediumLayout: {
    positionId: "medium-layout-position",
    position: "medium-position-default",
    positionImgId: "medium-image",
    positionImage: "./images/medium-layout-comments-default.png",
    heightId: "medium-height-comments",
    height: null,
    options: {
      stickyPlayer: {
        id: "medium-layout-sticky-player-option",
        option: false,
      },
      stickyComments: {
        id: "medium-layout-sticky-comments-option",
        option: false,
      }
    },
    positionPrefix: "medium",
  }
}

export { DEFAULT_SETTINGS };