import { type TTSState,  type TTSStrategy, type Paragraphs, type PlayerState, playerStates, } from "./state";

type TTSStoreAction = {
  type: "change_strategy",
  strategy: TTSStrategy,
} | {
  type: "update_inputText",
  inputText: string,
} | {
  type: "play_tts",
} | {
  type: "pause_tts",
} | {
  type: "stop_tts",
} | {
  type: "set_textToBeSpoken",
  textToBeSpoken: {
    paragraphsSegments: Intl.Segments[],
    paragraphs: Paragraphs,
  }
} | {
  type: 'update_reading_position',
  readingPosition: {paragraphIndex: number, sentenceIndex: number},
} | {
  type: 'update_client_is_supported',
  isSupported: boolean,
} | {
  type: 'update_client_tts_voices',
  voices: SpeechSynthesisVoice[],
} | {
  type: 'update_client_tts_pickedVoice',
  voice: SpeechSynthesisVoice,
} | {
  type: 'update_client_tts_volume',
  volume: number,
};

function ttsStoreReducer(state: TTSState, action: TTSStoreAction): TTSState {
  switch (action.type) {
    case 'change_strategy': {
      return {
        ...state,
        ttsStrategy: action.strategy,
      };
    }
    case 'update_inputText': {
      return {
        ...state,
        inputText: action.inputText,
      };
    }
    case 'play_tts': {
      return {
        ...state,
        playerState: playerStates.IsPlaying,
      };
    }
    case 'pause_tts': {
      return {
        ...state,
        playerState: playerStates.IsPaused,
      };
    }
    case 'stop_tts': {
      return {
        ...state,
        playerState: playerStates.IsStopped,
      };
    }
    case 'set_textToBeSpoken': {
      return {
        ...state,
        textToBeSpoken: {
          ...action.textToBeSpoken,
          readingPosition: {paragraphIndex: 0 , sentenceIndex: 0},
        },
      }
    }
    case 'update_reading_position': {
      if ( action.readingPosition.paragraphIndex < 0 || action.readingPosition.sentenceIndex < 0 ) {
        return state
      }

      return {
        ...state,
        textToBeSpoken: {
          ...state.textToBeSpoken,
          readingPosition: action.readingPosition,
        },
      }
    }
    case 'update_client_is_supported': {
      return {
        ...state,
        strategies: {
          ...state.strategies,
          client: {
            ...state.strategies.client,
            isSupported: action.isSupported,
          }
        },
      }
    }
    case 'update_client_tts_voices': {
      return {
        ...state,
        strategies: {
          ...state.strategies,
          client: {
            ...state.strategies.client,
            voices: action.voices,
          }
        },
      }
    }
    case 'update_client_tts_pickedVoice': {
      return {
        ...state,
        strategies: {
          ...state.strategies,
          client: {
            ...state.strategies.client,
            pickedVoice: action.voice,
          }
        },
      }
    }
    case 'update_client_tts_volume': {
      if ( ! (0 <= action.volume && action.volume <= 1) ) {
        return state
      }

      return {
        ...state,
        strategies: {
          ...state.strategies,
          client: {
            ...state.strategies.client,
            volume: action.volume,
          }
        },
      }
    }
    // default: {
    //   throw Error('Unknown action: ' + action.type);
    // }
  }
}

// =============================================================================

function setPlayerStateByDispatch(newState: PlayerState, ttsDispatch: (action: TTSStoreAction) => void) {
  switch (newState) {
    case playerStates.IsPlaying: {
      ttsDispatch({type: 'play_tts'})
      return
    }
    case playerStates.IsPaused: {
      ttsDispatch({type: 'pause_tts'})
      return
    }
    case playerStates.IsStopped: {
      ttsDispatch({type: 'stop_tts'})
      return
    }
    default: {
      ttsDispatch({type: 'pause_tts'})
    }
  }
}

// =============================================================================

export type { TTSStoreAction, }
export { ttsStoreReducer, setPlayerStateByDispatch, }
