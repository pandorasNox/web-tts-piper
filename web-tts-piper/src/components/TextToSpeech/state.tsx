
type TTSState = {
  ttsStrategy: TTSStrategy,
  inputText: string,
  playerState: PlayerState,
  textToBeSpoken: TextToBeSpoken,
  strategies: {
    client: {
      isSupported: boolean,
      voices: SpeechSynthesisVoice[],
      prepickVoiceIfExits: string,
      pickedVoice: SpeechSynthesisVoice | null,
      volume: number,
      // const [volume, setVolume] = useState(1); // 0 (lowest) and 1 (highest)
      // const [rate, setRate] = useState(1); // 0.1 (lowest) and 10 (highest), with 1 being the default rate
      // const [pitch, setPitch] = useState(1); // 0 (lowest) and 2 (highest)
    },
    serverPiper: {},
  },
};

enum TTSStrategy {
  Client = 'TTSStrategy_CLIENT',
  ServerPiper = 'TTSStrategy_SERVER_PIPER',
}

// type PlayerState = "Player.IsPlaying" | "Player.IsStopped";
const playerStates = {
  IsPlaying: "Player.IsPlaying",
  IsPaused: "Player.IsPaused",
  IsStopped: "Player.IsStopped",
} as const;
type PlayerState = (typeof playerStates)[keyof typeof playerStates];

type TextToBeSpoken = {
  paragraphsSegments: Intl.Segments[],
  paragraphs: Paragraphs,
  readingPosition: {paragraphIndex: number, sentenceIndex: number},
}

type Paragraphs = Sentences[]
type Sentences = string[]

// =============================================================================

export type { TTSState, TTSStrategy, PlayerState, TextToBeSpoken, Paragraphs, Sentences, }
export { playerStates, TTSStrategy as ttsStrategies, }
