class Game {
  constructor(assets) {
    this.assets = assets;
    this.state = {
      scene: SCENES.TITLE,
      episodeId: "EP1",
      nodeIndex: 0,
      dopamine: CONFIG.initialDopamine,
      affection: CONFIG.initialAffection,
      ending: null,
      characters: [],
      background: null
    };

    this.titleButton = new Button(500, 500, 280, 68, "시작", () => {
      this.changeScene(SCENES.STORY);
    });

    this.restartButton = new Button(500, 560, 280, 64, "다시 시작", () => {
      location.reload();
    });

    this.textBox = new TextBox(80, 470, 1120, 200);
    this.choiceButtons = [];
    this.minigame = null;
    this.backgroundImage = null;
    this.character = {};
  }

  changeScene(scene) {
    this.state.scene = scene;

    if (scene === SCENES.STORY) {
      this.refreshChoices();
    }

    if (scene === SCENES.MINIGAME) {
      this.minigame = new DopamineGame();
    }
  }

  update() {
    if (this.state.scene !== SCENES.MINIGAME) return;

    this.minigame.update();

    if (this.minigame.finished) {
      this.addDopamine(this.minigame.getDopamineChange());
      this.state.episodeId = "EP_AFTER_MINIGAME";
      this.state.nodeIndex = 0;
      this.changeScene(SCENES.STORY);
    }
  }

  draw() {
    if (this.state.scene === SCENES.TITLE) this.drawTitle();
    if (this.state.scene === SCENES.STORY) this.drawStory();
    if (this.state.scene === SCENES.MINIGAME) this.minigame.draw();
    if (this.state.scene === SCENES.ENDING) this.drawEnding();
  }

  mousePressed() {
    if (this.state.scene === SCENES.TITLE) this.titleButton.mousePressed();
    if (this.state.scene === SCENES.STORY) this.handleStoryClick();
    if (this.state.scene === SCENES.MINIGAME) this.minigame.mousePressed();
    if (this.state.scene === SCENES.ENDING) this.restartButton.mousePressed();
  }

  drawTitle() {
    background("#171b24");
    noStroke();
    fill("#f6d365");
    textAlign(CENTER, CENTER);
    textSize(68);
    text("도파민때문에", width / 2, 240);

    fill("#f5f2ea");
    textSize(24);
    text("감정을 너무 낮추지도, 너무 과열시키지도 말 것", width / 2, 330);

    this.titleButton.draw();
  }

  drawStory() {
    this.drawBackground();
    this.drawStatus();

    const node = this.processStoryCommandNodes();
    if (!node) return;

    if (node.type === NODE_TYPES.DIALOGUE) {
      this.drawCharacters();
      this.textBox.draw(node.speaker, node.text);
      return;
    }

    if (node.type === NODE_TYPES.CHOICE) {
      this.drawCharacters();
      fill("#f5f2ea");
      textAlign(CENTER, CENTER);
      textSize(28);
      text(node.prompt, width / 2, 260);
      this.choiceButtons.forEach((button) => button.draw());
      return;
    }

    if (node.type === NODE_TYPES.ENDING_CHECK) {
      this.state.ending = this.decideEnding();
      this.changeScene(SCENES.ENDING);
    }
  }

  drawEnding() {
    background("#171b24");

    const endingText = {
      low: "LowDo 엔딩: 마음이 식거나 용기가 부족했다.",
      high: "HighDo 엔딩: 감정이 너무 앞서버렸다.",
      bad: "배드 엔딩: 호감도가 충분히 쌓이지 않았다.",
      good: "Good 엔딩: 적당한 설렘으로 고백에 성공했다."
    };

    fill("#f6d365");
    textAlign(CENTER, CENTER);
    textSize(42);
    text(endingText[this.state.ending], width / 2, 280);

    fill("#f5f2ea");
    textSize(24);
    text(`도파민 ${Math.round(this.state.dopamine)} / 호감도 ${Math.round(this.state.affection)}`, width / 2, 360);

    this.restartButton.draw();
  }

  drawBackground() {
    if (this.backgroundImage) {
      this.backgroundImage.draw();
      return;
    }

    background("#202633");
  }

  drawCharacters() {
    let i = 0;
    const characterLength = this.state.characters.length;

    for (const character of this.state.characters) {
      if (this.character[character]) {
        this.character[character].draw(i, characterLength);
      }
      i++;
    }
  }

  processStoryCommandNodes() {
    let node = this.getCurrentNode();
    let processed = false;

    while (node && this.isStoryCommandNode(node)) {
      if (node.type === NODE_TYPES.BACKGROUND) {
        this.state.background = node.name;
        const image = this.assets.backgrounds[node.name];
        if (!image) {
          console.warn("Missing background asset: " + node.name);
        }
        this.backgroundImage = image ? new BackgroundImage(image) : null;
      }

      if (node.type === NODE_TYPES.CHARACTER_IN) {
        if(this.state.characters.indexOf(node.name) === -1){
          this.state.characters.push(node.name);
        }
        const image = this.getCharacterAsset(node.name, node.emotion);
        if (!image) {
          console.warn("Missing character asset: " + node.name + " / " + (node.emotion || "default"));
        }
        this.character[node.name] = image ? new CharacterImage(image) : null
      }

      if (node.type === NODE_TYPES.CHARACTER_OUT) {
        const index = this.state.characters.indexOf(node.name);
        if (index !== -1) {
          this.state.characters.splice(index, 1)
        }
        this.character[node.name] = null
      }

      this.state.nodeIndex += 1
      processed = true;
      node = this.getCurrentNode();
    }

    if (processed && node && node.type === NODE_TYPES.CHOICE) {
      this.refreshChoices();
    }

    return node;
  }

  isStoryCommandNode(node) {
    return node.type === NODE_TYPES.BACKGROUND || node.type === NODE_TYPES.CHARACTER_IN || node.type === NODE_TYPES.CHARACTER_OUT;
  }

  getCharacterAsset(name, emotion) {
    const characterAssets = this.assets.characters[name];
    if (!characterAssets) return null;

    return characterAssets[emotion] || characterAssets.default || null;
  }

  handleStoryClick() {
    const node = this.getCurrentNode();

    if (node.type === NODE_TYPES.DIALOGUE) {
      this.state.nodeIndex += 1;
      this.refreshChoices();
      return;
    }

    this.choiceButtons.forEach((button) => button.mousePressed());
  }

  getCurrentNode() {
    return EPISODES[this.state.episodeId][this.state.nodeIndex];
  }

  refreshChoices() {
    const node = this.getCurrentNode();
    this.choiceButtons = [];

    if (!node || node.type !== NODE_TYPES.CHOICE) return;

    const choices = node.choices.filter((choice) => this.canChoose(choice));

    choices.forEach((choice, index) => {
      const button = new Button(340, 360 + index * 88, 600, 64, choice.text, () => {
        this.applyEffects(choice.effects);

        if (choice.next === NEXT_TARGETS.MINIGAME) {
          this.changeScene(SCENES.MINIGAME);
          return;
        }

        this.state.episodeId = choice.next;
        this.state.nodeIndex = 0;
        this.refreshChoices();
      });

      this.choiceButtons.push(button);
    });
  }

  canChoose(choice) {
    if (!choice.condition) return true;
    if (choice.condition.dopamineMin && this.state.dopamine < choice.condition.dopamineMin) return false;
    if (choice.condition.dopamineMax && this.state.dopamine > choice.condition.dopamineMax) return false;
    return true;
  }

  applyEffects(effects = {}) {
    if (effects.dopamine) {
      this.addDopamine(effects.dopamine);
    }

    if (effects.affection) {
      this.state.affection = constrain(this.state.affection + effects.affection, 0, 100);
    }
  }

  addDopamine(amount) {
    this.state.dopamine = constrain(this.state.dopamine + amount, 0, 100);
  }

  decideEnding() {
    if (this.state.dopamine < 40) return "low";
    if (this.state.dopamine > 70) return "high";
    if (this.state.affection < 40) return "bad";
    return "good";
  }

  drawStatus() {
    this.drawMeter(32, 28, "도파민", this.state.dopamine, "#f06a7a");
    // this.drawMeter(32, 74, "호감도", this.state.affection, "#6cc4a1");
  }

  drawMeter(x, y, label, value, colorHex) {
    noStroke();
    fill("#f5f2ea");
    textAlign(LEFT, CENTER);
    textSize(18);
    text(`${label} ${Math.round(value)}`, x, y + 12);

    fill("#2a303d");
    rect(x + 110, y, 220, 24, 4);
    fill(colorHex);
    rect(x + 110, y, map(value, 0, 100, 0, 220), 24, 4);
  }
}
