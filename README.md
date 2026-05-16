# 도파민때문에

`도파민때문에`는 p5.js로 만든 스토리 선택형 미니게임입니다.  
플레이어는 대사를 읽고 선택지를 고르며, 선택 결과로 `dopamine`과 `affection` 수치가 바뀝니다. 중간의 미니게임 결과까지 반영한 뒤 최종 엔딩이 결정됩니다.

## 실행 방법

`index.html`을 브라우저로 열면 바로 실행됩니다.

p5.js는 `libraries/` 폴더의 로컬 파일을 사용합니다.

## 파일 구조

```text
도파민때문에/
  index.html       실행 파일. p5.js와 게임 JS 파일을 순서대로 불러온다.
  styles.css       캔버스와 페이지 기본 스타일.
  config.js        캔버스 크기, 도파민/호감도 초기값.
  story-data.js    에피소드, 대사, 선택지, 선택 효과 데이터.
  ui.js            Button, TextBox 같은 공통 UI 객체.
  mini-game.js     도파민 미니게임 객체.
  game.js          전체 게임 상태, 장면 전환, 선택지 처리, 엔딩 판정.
  sketch.js        p5.js의 setup/draw/mousePressed를 Game 객체에 연결.
```

## 전체 실행 흐름

브라우저가 `index.html`을 열면 JS 파일이 아래 순서로 로드됩니다.

```text
config.js
  -> story-data.js
  -> ui.js
  -> mini-game.js
  -> game.js
  -> sketch.js
```

이 순서가 중요합니다. `Game` 객체는 `CONFIG`, `EPISODES`, `Button`, `TextBox`, `DopamineGame`을 사용하기 때문에, 관련 파일들이 먼저 로드되어야 합니다.

`sketch.js`는 p5.js가 호출하는 기본 함수만 가지고 있습니다.

```js
function setup() {
  createCanvas(CONFIG.width, CONFIG.height);
  game = new Game();
}

function draw() {
  game.update();
  game.draw();
}

function mousePressed() {
  game.mousePressed();
}
```

즉, 실제 게임 로직은 대부분 `Game` 객체 안에 있고, p5.js는 매 프레임마다 `game.update()`와 `game.draw()`를 불러주는 역할을 합니다.

## 주요 게임 객체

### Game

파일: `game.js`

`Game`은 프로젝트의 중심 객체입니다. 현재 장면, 현재 에피소드, 플레이어 수치, UI 객체, 미니게임 객체를 모두 관리합니다.

```js
this.state = {
  scene: "title",
  episodeId: "EP1",
  nodeIndex: 0,
  dopamine: CONFIG.initialDopamine,
  affection: CONFIG.initialAffection,
  ending: null
};
```

`state`의 의미는 다음과 같습니다.

| 속성 | 역할 |
| --- | --- |
| `scene` | 현재 화면. `"title"`, `"story"`, `"minigame"`, `"ending"` 중 하나 |
| `episodeId` | 현재 읽고 있는 에피소드 ID. `EPISODES`의 key와 연결됨 |
| `nodeIndex` | 현재 에피소드 안에서 몇 번째 노드를 보여줄지 결정 |
| `dopamine` | 도파민 수치. 선택지와 미니게임으로 변함 |
| `affection` | 호감도 수치. 선택지로 변함 |
| `ending` | 마지막에 결정된 엔딩 종류 |

`Game`의 핵심 메서드는 다음과 같습니다.

| 메서드 | 역할 |
| --- | --- |
| `changeScene(scene)` | 현재 화면을 바꾸고, 필요한 객체나 선택지를 준비 |
| `update()` | 미니게임 진행 상태를 갱신하고, 끝나면 스토리로 복귀 |
| `draw()` | 현재 `scene`에 맞는 화면 그리기 함수 호출 |
| `mousePressed()` | 현재 `scene`에 맞는 클릭 처리 함수 호출 |
| `handleStoryClick()` | 대사 클릭 시 다음 노드로 이동하거나 선택지 버튼 처리 |
| `refreshChoices()` | 현재 선택지 데이터를 읽어서 `Button` 객체 배열 생성 |
| `applyEffects(effects)` | 선택지 효과를 도파민/호감도에 반영 |
| `decideEnding()` | 최종 수치에 따라 엔딩 결정 |

### Button

파일: `ui.js`

`Button`은 클릭 가능한 사각형 버튼입니다.

```js
new Button(x, y, w, h, label, onClick)
```

| 속성/메서드 | 역할 |
| --- | --- |
| `x, y, w, h` | 버튼 위치와 크기 |
| `label` | 버튼에 표시할 글자 |
| `onClick` | 클릭되었을 때 실행할 함수 |
| `contains(px, py)` | 마우스가 버튼 안에 있는지 확인 |
| `draw()` | hover 상태를 반영해 버튼을 그림 |
| `mousePressed()` | 클릭 위치가 버튼 안이면 `onClick()` 실행 |

`Game`은 시작 버튼, 다시 시작 버튼, 선택지 버튼을 모두 `Button`으로 만듭니다.

### TextBox

파일: `ui.js`

`TextBox`는 스토리 대사를 보여주는 말풍선/대화창 객체입니다.

```js
this.textBox.draw(node.speaker, node.text);
```

`speaker`와 `text`를 받아 화면 아래쪽에 대화창을 그립니다. 대사 진행 자체는 `TextBox`가 아니라 `Game.handleStoryClick()`이 담당합니다.

### DopamineGame

파일: `mini-game.js`

`DopamineGame`은 중간에 실행되는 미니게임 객체입니다. 움직이는 수용체가 중앙에 가까울 때 클릭하면 점수가 오르고, 멀 때 클릭하면 점수가 내려갑니다.

```js
this.score = 50;
this.shotsLeft = 5;
this.finished = false;
this.receptorX = width / 2;
this.receptorDirection = 1;
```

| 속성 | 역할 |
| --- | --- |
| `score` | 미니게임 점수. 50에서 시작 |
| `shotsLeft` | 남은 클릭 기회. 5회 |
| `finished` | 미니게임 종료 여부 |
| `receptorX` | 움직이는 수용체의 x 좌표 |
| `receptorDirection` | 수용체 이동 방향 |

미니게임의 결과는 `getDopamineChange()`로 계산됩니다.

```js
getDopamineChange() {
  return Math.round(this.score - 50);
}
```

예를 들어 최종 점수가 63이면 도파민이 `+13` 증가하고, 35이면 `-15` 감소합니다.

## 스토리 데이터 구조

파일: `story-data.js`

스토리는 `EPISODES` 객체에 저장됩니다.

```js
const EPISODES = {
  EP1: [
    { type: "dialogue", speaker: "...", text: "..." },
    { type: "choice", prompt: "...", choices: [...] }
  ]
};
```

각 에피소드는 노드 배열입니다. `Game.state.episodeId`가 어떤 에피소드를 볼지 정하고, `Game.state.nodeIndex`가 그 안의 몇 번째 노드를 볼지 정합니다.

### dialogue 노드

대사를 보여주는 노드입니다.

```js
{
  type: "dialogue",
  speaker: "주인공",
  text: "..."
}
```

스토리 화면에서 클릭하면 `nodeIndex`가 1 증가하면서 다음 노드로 넘어갑니다.

### choice 노드

선택지를 보여주는 노드입니다.

```js
{
  type: "choice",
  prompt: "...",
  choices: [
    {
      text: "...",
      effects: { affection: 10, dopamine: -5 },
      next: "EP2"
    }
  ]
}
```

선택지를 누르면 다음 일이 순서대로 일어납니다.

1. `applyEffects(choice.effects)`로 도파민/호감도 변화 적용.
2. `choice.next`가 `"MINIGAME"`이면 미니게임 화면으로 전환.
3. 그렇지 않으면 `episodeId`를 `choice.next`로 바꾸고 `nodeIndex`를 0으로 초기화.
4. 새 에피소드의 선택지가 있으면 `refreshChoices()`로 버튼 다시 생성.

### endingCheck 노드

엔딩 판정을 실행하는 노드입니다.

```js
{
  type: "endingCheck"
}
```

이 노드에 도달하면 `decideEnding()`으로 엔딩을 정하고 `scene`을 `"ending"`으로 바꿉니다.

## 장면 전환 구조

현재 화면은 `Game.state.scene` 하나로 결정됩니다.

```text
title
  -> story
  -> minigame
  -> story
  -> ending
```

각 장면에서 실행되는 함수는 다음과 같습니다.

| scene | draw 처리 | 클릭 처리 |
| --- | --- | --- |
| `title` | `drawTitle()` | 시작 버튼 클릭 시 `story`로 전환 |
| `story` | `drawStory()` | 대사 진행 또는 선택지 버튼 클릭 |
| `minigame` | `minigame.draw()` | 미니게임 클릭 판정 |
| `ending` | `drawEnding()` | 다시 시작 버튼 클릭 시 새로고침 |

## 도파민/호감도 변화 로직

선택지 효과는 `effects` 객체로 관리합니다.

```js
effects: { affection: 15, dopamine: 8 }
```

`Game.applyEffects()`는 이 값을 읽어 현재 수치에 더합니다.

도파민은 `addDopamine()`을 통해 0부터 100 사이로 제한됩니다.

```js
addDopamine(amount) {
  this.state.dopamine = constrain(this.state.dopamine + amount, 0, 100);
}
```

호감도도 0부터 100 사이로 제한됩니다.

```js
this.state.affection = constrain(this.state.affection + effects.affection, 0, 100);
```

## 선택지 조건

선택지는 조건을 걸 수 있습니다.

```js
condition: { dopamineMin: 51 }
```

`Game.canChoose()`가 조건을 검사합니다.

| 조건 | 의미 |
| --- | --- |
| `dopamineMin` | 현재 도파민이 이 값 이상일 때만 선택 가능 |
| `dopamineMax` | 현재 도파민이 이 값 이하일 때만 선택 가능 |

조건을 만족하지 못한 선택지는 버튼으로 생성되지 않습니다.

## 엔딩 판정

엔딩은 `Game.decideEnding()`에서 결정됩니다.

```js
decideEnding() {
  if (this.state.dopamine < 40) return "low";
  if (this.state.dopamine > 70) return "high";
  if (this.state.affection < 40) return "bad";
  return "good";
}
```

판정 순서가 중요합니다.

1. 도파민이 40 미만이면 `low`
2. 도파민이 70 초과이면 `high`
3. 호감도가 40 미만이면 `bad`
4. 위 조건에 모두 걸리지 않으면 `good`

즉, 호감도가 높아도 도파민이 너무 낮거나 높으면 `low` 또는 `high` 엔딩이 먼저 나옵니다.

## 새 스토리를 추가하는 방법

`story-data.js`에 새 에피소드 key를 추가합니다.

```js
EP3: [
  {
    type: "dialogue",
    speaker: "주인공",
    text: "새로운 장면..."
  },
  {
    type: "choice",
    prompt: "무엇을 할까?",
    choices: [
      {
        text: "선택지",
        effects: { dopamine: 5, affection: 10 },
        next: "EP4"
      }
    ]
  }
]
```

그 다음 기존 선택지의 `next`를 새 에피소드 ID로 연결하면 됩니다.

```js
next: "EP3"
```

미니게임으로 보내고 싶으면 `next`에 `"MINIGAME"`을 넣습니다.

```js
next: "MINIGAME"
```

## 자주 수정하는 위치

| 하고 싶은 일 | 수정할 파일 |
| --- | --- |
| 대사, 선택지, 선택 효과 바꾸기 | `story-data.js` |
| 도파민/호감도 초기값 바꾸기 | `config.js` |
| 장면 전환, 엔딩 조건 바꾸기 | `game.js` |
| 미니게임 규칙 바꾸기 | `mini-game.js` |
| 버튼/대화창 모양 바꾸기 | `ui.js` |
| 캔버스 크기 바꾸기 | `config.js` |

## 현재 게임 진행 요약

```text
타이틀
  -> EP1 대사와 선택지
  -> EP2 대사와 선택지
  -> 도파민 미니게임
  -> EP_AFTER_MINIGAME 대사
  -> 엔딩 판정
```

전체적으로 `story-data.js`는 게임 내용, `game.js`는 게임 규칙, `ui.js`와 `mini-game.js`는 화면에 보이는 객체를 담당한다고 보면 됩니다.
