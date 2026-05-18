const EPISODES = {
  EP1: [
    {
      type: NODE_TYPES.BACKGROUND,
      name: "dummy"
    },
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "주인공",
      text: "나는 주인공이야"
    },
    {
      type: NODE_TYPES.CHARACTER_IN,
      name: "수진",
      emotion: "일반"
    },
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "수진",
      text: "나는 수진이야. 이 게임의 여주인공이야."
    },
    {
      type: NODE_TYPES.CHARACTER_IN,
      name: "혜지",
      emotion: "일반"
    },
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "혜지",
      text: "안녕 나는 혜지야"
    },
    {
      type: NODE_TYPES.CHARACTER_IN,
      name: "건호",
      emotion: "일반"
    },
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "건호",
      text: "나는 건호야"
    },
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "수진",
      text: "야 너희들 뭐야!"
    },
    {
      type: NODE_TYPES.CHARACTER_OUT,
      name: "혜지" 
    },
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "혜지",
      text: "쳇"
    },
    {
      type: NODE_TYPES.CHARACTER_OUT,
      name: "건호",
    },
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "건호",
      text: "도망가자!"
    },
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "수진",
      text: "이상한 놈들이었어..."
    },
    {
      type: NODE_TYPES.CHOICE,
      prompt: "쟤들은 누굴까?",
      choices: [
        {
          text: "이상한 놈들이다",
          effects: { affection: 10, dopamine: -5 },
          next: "EP2"
        },
        {
          text: "웃긴 놈들이다",
          effects: { affection: 15, dopamine: 12 },
          next: "EP2"
        }
      ]
    }
  ],

  EP2: [
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "주인공",
      text: "연극동아리 OT. 그런데 편의점에서 봤던 그 사람이 있다."
    },
    {
      type: NODE_TYPES.CHOICE,
      prompt: "옆자리에 앉은 수진에게 말을 건다.",
      choices: [
        {
          text: "여기 앉아도 될까요?",
          effects: { affection: 15 },
          next: NEXT_TARGETS.MINIGAME
        },
        {
          text: "그때 편의점... 기억하세요?",
          condition: { dopamineMin: 51 },
          effects: { affection: 20, dopamine: 8 },
          next: NEXT_TARGETS.MINIGAME
        }
      ]
    }
  ],

  EP_AFTER_MINIGAME: [
    {
      type: NODE_TYPES.DIALOGUE,
      speaker: "도파민",
      text: "오늘의 감정 농도가 정해졌다. 이제 고백의 순간으로 간다."
    },
    {
      type: NODE_TYPES.ENDING_CHECK
    }
  ]
};
