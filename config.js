const CONFIG = {
  width: 1280,
  height: 720,
  initialDopamine: 50,
  initialAffection: 0
};

const SCENES = {
  TITLE: "title",
  STORY: "story",
  MINIGAME: "minigame",
  ENDING: "ending"
};

const NODE_TYPES = {
  BACKGROUND: "background",
  CHARACTER_IN: "character in",
  CHARACTER_OUT: "character out",
  DIALOGUE: "dialogue",
  CHOICE: "choice",
  ENDING_CHECK: "endingCheck"
};

const NEXT_TARGETS = {
  MINIGAME: "MINIGAME"
};

const ASSET_MANIFEST = {
  backgrounds: {
    dummy: "./assets/bg/dummy.png"
  },
  characters: {
    수진: {
      default: "./assets/char/수진.png",
      일반: "./assets/char/수진.png"
    },
    혜지: {
      default: "./assets/char/혜지.png",
      일반: "./assets/char/혜지.png"
    },
    건호: {
      default: "./assets/char/건호.png",
      일반: "./assets/char/건호.png"
    }
  }
};
