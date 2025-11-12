import { createStore } from '@xstate/store';

import { TTSState, TTSStrategy, PlayerState, TextToBeSpoken, } from '../TextToSpeech/state'
import { playerStates, ttsStrategies,  } from '../TextToSpeech/state'

import placeholderText from '../../util/placeholderText'

import { nextReadingPosition, previousReadingPosition } from '@/util/readingPosition';
import { createRef, RefObject } from 'react';
import { Result, toResult } from '@/util/resultType';
import { waitFor } from '@/util/waitFor';

// inital state
const initalTTSState: TTSState = {
  playerState: playerStates.IsStopped,
  inputText: placeholderText,
  textToBeSpoken: {
    paragraphsSegments: [],
    paragraphs: [],
    readingPosition: { paragraphIndex: 0 , sentenceIndex: 0 },
    inputRef: createRef(),
    ttsArticleContentRef: createRef(),
    sentenceRefs: createRef(),
    autoScrollFocuseEnabled: true,
  },
  ttsStrategy: ttsStrategies.Client,
  strategies: {
    client: {
      isSupported: false,
      isCanceling: false,
      voices: [],
      prepickVoiceIfExits: "Daniel",
      pickedVoice: null,
      //     utterance: null as SpeechSynthesisUtterance | null, // TODO
      volume: parseFloat(0.5.toPrecision(2)), // TODO
    },
    serverPiper: {},
  },
}

// Create a store
const store = createStore({
  context: initalTTSState,
  on: {
    putRefs: (context, event: { inputRef: RefObject<null>, sentenceRefs: Map<string, HTMLSpanElement> }, enqueue) => {
      console.log("run store.on.putRefs");

      // ensure playerStates.IsStopped
      if (context.playerState !== playerStates.IsStopped) {
        return context;
      }

      const sRef = createRef<Map<string, HTMLSpanElement>>();
      sRef.current = event.sentenceRefs;

      return {
        ...context,
        textToBeSpoken: {
          ...context.textToBeSpoken,
          inputRef: event.inputRef,
          sentenceRefs: sRef,
        },
      };
    },
    clearSentenceRefs: (context) => {
      return {
        ...context,
        textToBeSpoken: {
          ...context.textToBeSpoken,
          sentenceRefs: createRef<Map<string, HTMLSpanElement>>(),
        },
      };
    },
    init: (context, event: { ttsArticleContentRef: RefObject<HTMLElement | null> }, enqueue) => {
      console.log("run store.on.init");

      // ensure playerStates.IsStopped
      if (context.playerState !== playerStates.IsStopped) {
        return context;
      }

      enqueue.effect(async () => {
        (() => {
          if (typeof window !== 'undefined') {
            window.addEventListener('keydown', (event: KeyboardEvent) => {
              const inputRef = store.getSnapshot().context.textToBeSpoken.inputRef;

              // const inputRefHasFocus = document.activeElement === inputRef.current
              const inputRefHasFocus = ( inputRef.current
                && inputRef.current.contains(document.activeElement)
                && document.activeElement instanceof HTMLTextAreaElement
              );
              if (inputRefHasFocus) {
                return
              }

              let key = event.key.toLowerCase();
              const playerState = store.select((state) => state.playerState).get();

              switch (key) {
                case 'k':
                  if (playerState === playerStates.IsPlaying) {
                    store.send( { "type": "pauseTts"} );
                  }
                  if (playerState === playerStates.IsStopped || playerState === playerStates.IsPaused) {
                    store.send( { "type": "startTts"} );
                  }
                  break;
                case 'arrowleft':
                case 'arrowup':
                  store.send( { "type": "moveReadingPositionBackward"} );
                  break;
                case 'arrowright':
                case 'arrowdown':
                  store.send( { "type": "moveReadingPositionForward"} );
                  break;
                case 'escape':
                  break;
              }

            });
          }
        })();

        store.send( { "type": "initSpeechSynthesis"} );
      });

      return {
        ...context,
        textToBeSpoken: {
          ...context.textToBeSpoken,
          ttsArticleContentRef: event.ttsArticleContentRef,
        },
      };

    },
    initSpeechSynthesis: (context, _event, enqueue) => {
      console.log("run store.on.initSpeechSynthesis");

      // ensure playerStates.IsStopped
      if (context.playerState !== playerStates.IsStopped) {
        return context;
      }

      if (typeof window === "undefined") return context;
      if (window.speechSynthesis === undefined ) return context;

      const voices = speechSynthesis.getVoices();

      if (voices.length <= 0) {
        speechSynthesis.onvoiceschanged = () => {
          store.send( { "type": "initSpeechSynthesis" } );
        };
      }

      let nextContext = {...context};
      nextContext.strategies.client.voices = voices;

      let maybeFoundPrepickVoiceIndexIfExits = voices.findIndex((v) => {
        return v.name === context.strategies.client.prepickVoiceIfExits;
      })

      if (maybeFoundPrepickVoiceIndexIfExits !== -1) {
        nextContext.strategies.client.pickedVoice = voices[maybeFoundPrepickVoiceIndexIfExits];
      }

      return nextContext;
    },
    toggleAutoScrollFocuse: (context, _, enqueue) => {
      const ttsArticleContentRef = context.textToBeSpoken.ttsArticleContentRef;
      const sentenceRefs = context.textToBeSpoken.sentenceRefs;

      const scrollToSentence = (key: string) => {
        const container = ttsArticleContentRef.current;
        const sentence = sentenceRefs.current?.get(key);
        if (!container || !sentence) return;

        const containerRect = container.getBoundingClientRect();
        const sentenceRect = sentence.getBoundingClientRect();

        const containerScrollTop = container.scrollTop;
        const sentenceOffsetTop = sentenceRect.top - containerRect.top;

        const scrollTo =
          containerScrollTop +
          sentenceOffsetTop -
          container.clientHeight / 2 +
          sentence.offsetHeight / 2;

        container.scrollTo({ top: scrollTo, behavior: 'smooth' });
      };

      enqueue.effect(async () => {
        const readingPosition = store.getSnapshot().context.textToBeSpoken.readingPosition;
        const autoScrollFocuseEnabled = store.getSnapshot().context.textToBeSpoken.autoScrollFocuseEnabled;
        autoScrollFocuseEnabled && scrollToSentence(`p${readingPosition.paragraphIndex}s${readingPosition.sentenceIndex}`);
      });

      return {
        ...context,
        textToBeSpoken: {
          ...context.textToBeSpoken,
          autoScrollFocuseEnabled: !context.textToBeSpoken.autoScrollFocuseEnabled,
        },
      }
    },
    changeStrategy: (context, event: { strategy: TTSStrategy }) => ({
      ...context,
      ttsStrategy: event.strategy,
    }),
    startTts: (context, _event, enqueue) => {
      if (context.playerState === playerStates.IsPlaying) {
        return context;
      }

      const nextContext = {...context};

      enqueue.effect(async () => {
        store.send( { "type": "speak" } );
        activateMediaCurator();
      });

      nextContext.playerState = playerStates.IsPlaying;
      nextContext.strategies.client.isCanceling = false;
      return nextContext;
    },
    speak: (context, _event, enqueue) => {
      console.log("store.on.speak");

      // ensure IsPlaying
      if (context.playerState !== playerStates.IsPlaying) {
        return context;
      }

      if (typeof window === "undefined") return context;

      const paragraphs = context.textToBeSpoken.paragraphs;
      const readingPosition = context.textToBeSpoken.readingPosition;

      if (typeof paragraphs[readingPosition.paragraphIndex] === 'undefined') {
        enqueue.effect(async () => {
          window.speechSynthesis.cancel();
          await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
          store.send( { "type": "stopTts" } );
        });
        return context;
      }
      if (typeof paragraphs[readingPosition.paragraphIndex][readingPosition.sentenceIndex] === 'undefined') {
        enqueue.effect(async () => {
          window.speechSynthesis.cancel();
          await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
          store.send( { "type": "stopTts" } );
        });
        return context;
      }

      const textToBeSpoken = paragraphs[readingPosition.paragraphIndex][readingPosition.sentenceIndex];

      const voice = context.strategies.client.pickedVoice;
      if (voice === null) {
        return context;
      }
      const volume = context.strategies.client.volume;

      const speak = (text: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance();
          utterance.text = text;
          utterance.voice = voice;
          utterance.volume = volume;
          utterance.rate = 0.85;

          utterance.onend = () => {
            resolve();
          };

          utterance.onerror = (event) => {
            reject(new Error(`Speech synthesis error: ${event.error}`));
          };

          window.speechSynthesis.speak(utterance);
        });
      };

      const ttsArticleContentRef = context.textToBeSpoken.ttsArticleContentRef;
      const sentenceRefs = context.textToBeSpoken.sentenceRefs;

      const scrollToSentence = (key: string) => {
        const container = ttsArticleContentRef.current;
        const sentence = sentenceRefs.current?.get(key);
        if (!container || !sentence) return;

        const containerRect = container.getBoundingClientRect();
        const sentenceRect = sentence.getBoundingClientRect();

        const containerScrollTop = container.scrollTop;
        const sentenceOffsetTop = sentenceRect.top - containerRect.top;

        const scrollTo =
          containerScrollTop +
          sentenceOffsetTop -
          container.clientHeight / 2 +
          sentence.offsetHeight / 2;

        container.scrollTo({ top: scrollTo, behavior: 'smooth' });
      };

      enqueue.effect(async () => {
        window.speechSynthesis.cancel();
        await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );

        const autoScrollFocuseEnabled = store.getSnapshot().context.textToBeSpoken.autoScrollFocuseEnabled;
        autoScrollFocuseEnabled && scrollToSentence(`p${readingPosition.paragraphIndex}s${readingPosition.sentenceIndex}`);

        const _speakRes = await toResult(speak(textToBeSpoken));

        if (!store.getSnapshot().context.strategies.client.isCanceling) {
          store.send( { "type": "moveReadingPositionForward" } );
        }
      });

      const nextContext = {...context};
      nextContext.strategies.client.isCanceling = false;
      return nextContext;
    },
    pauseTts: (context, _event, enqueue) => {
      if (typeof window === "undefined") return context;

      enqueue.effect(async () => {
        window.speechSynthesis.cancel();
        await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
      });

      const nextContext = {...context};
      nextContext.playerState = playerStates.IsPaused;
      nextContext.strategies.client.isCanceling = true;

      return nextContext;
    },
    stopTts: (context, _event, enqueue) => {
      if (typeof window === "undefined") return context;

      enqueue.effect(async () => {
        window.speechSynthesis.cancel();
        await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
        store.trigger.speechEnded();
      });

      const nextContext = {...context};
      nextContext.playerState = playerStates.IsStopped;
      nextContext.textToBeSpoken.readingPosition = {paragraphIndex: 0, sentenceIndex: 0};
      nextContext.strategies.client.isCanceling = true;

      return nextContext;
    },
    moveReadingPositionBackward: (context, _event, enqueue) => {

      if (typeof window === "undefined") return context;

      const paragraphs = context.textToBeSpoken.paragraphs;
      const readingPosition = context.textToBeSpoken.readingPosition;
      const res = previousReadingPosition(paragraphs, readingPosition);

      let nextContext = {...context};

      switch (context.playerState) {
        case playerStates.IsPlaying:
          if (res.ok) {
            enqueue.effect(async () => {
              window.speechSynthesis.cancel();
              await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
              store.send( { "type": "speak"} );
            });

            nextContext.textToBeSpoken.readingPosition = res.value;
            nextContext.strategies.client.isCanceling = true;
            return nextContext;
          }

          return nextContext;
        case playerStates.IsPaused:
          enqueue.effect(async () => {
            window.speechSynthesis.cancel();
            await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
          });
          if (res.ok) {
            nextContext.textToBeSpoken.readingPosition = res.value;
            return nextContext;
          }

          switch (res.error.errorType) {
            case "InvalidIndex":
            case "StartOfContent":
            case "EndOfContent":
              return context;
          }
        case playerStates.IsStopped:
          return context;
      }

      return context;
    },
    moveReadingPositionForward: (context, _event, enqueue) => { // move forword while playing + move forward while stop/paused
      console.log("store.on.moveReadingPositionForward");

      if (typeof window === "undefined") return context;

      const paragraphs = context.textToBeSpoken.paragraphs;
      const readingPosition = context.textToBeSpoken.readingPosition;
      const res = nextReadingPosition(paragraphs, readingPosition);

      let nextContext = {...context};

      switch (context.playerState) {
        case playerStates.IsPlaying:
          if (res.ok) {
            enqueue.effect(async () => {
              window.speechSynthesis.cancel();
              await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
              store.send( { "type": "speak"} );
            });

            nextContext.textToBeSpoken.readingPosition = res.value;
            nextContext.strategies.client.isCanceling = true;
            return nextContext;
          }

          switch (res.error.errorType) {
            case "InvalidIndex":
            case "StartOfContent":
            case "EndOfContent":
              enqueue.effect(async () => {
                store.send( { "type": "stopTts"} );
              });
              return nextContext;
          }

          return nextContext;
        case playerStates.IsPaused:
          enqueue.effect(async () => {
            window.speechSynthesis.cancel();
            await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
          });
          if (res.ok) {
            nextContext.textToBeSpoken.readingPosition = res.value;
            return nextContext;
          }

          switch (res.error.errorType) {
            case "InvalidIndex":
            case "StartOfContent":
            case "EndOfContent":
              return context;
          }
        case playerStates.IsStopped:
          return context;
      }

      return context;
    },
    updateReadingPosition: (context, event: { paragraphIndex: number, sentenceIndex: number}, enqueue) => {
      if (typeof window === "undefined") return context;

      const { paragraphIndex, sentenceIndex } = event;
      if (
        ! Number.isInteger(paragraphIndex) || paragraphIndex < 0
        || ! Number.isInteger(sentenceIndex) || sentenceIndex < 0
      ) {
        return context;
      }

      const lastParagraphIndex = context.textToBeSpoken.paragraphs.length - 1;
      if (paragraphIndex > lastParagraphIndex) {
        return context;
      }

      const lastSentenceIndexInTargetParagraph = context.textToBeSpoken.paragraphs[paragraphIndex].length -1 ;
      if (sentenceIndex > lastSentenceIndexInTargetParagraph) {
        return context
      }

      const nextContext = {...context};

      switch (context.playerState) {
        case playerStates.IsPlaying:
          enqueue.effect(async () => {
            window.speechSynthesis.cancel();
            await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
            store.send( { "type": "speak"} );
          });

          nextContext.textToBeSpoken.readingPosition = {
            paragraphIndex: paragraphIndex, sentenceIndex: sentenceIndex
          };
          nextContext.strategies.client.isCanceling = true;

          return nextContext
        case playerStates.IsPaused:
        case playerStates.IsStopped:
          nextContext.textToBeSpoken.readingPosition = {
            paragraphIndex: paragraphIndex, sentenceIndex: sentenceIndex
          };
          return nextContext
      }

      return nextContext
    },
    updateInputText: (context, event: { inputText: string, process: boolean }, enqueue) => {
      return {...context, inputText: event.inputText};
    },
    processInputText: (context, _event, enqueue) => {
      const segmenterEn = new Intl.Segmenter('en' /* alt. e.g. 'en-US' */, {
        granularity: 'sentence'
      });

      const trimLeadingEmpty = (arr: string[]): string[] => { return arr.slice(arr.findIndex(s => s !== "")); };

      const rawParagraphs = trimLeadingEmpty(context.inputText.split(/\n/));
      const paragraphsSegments = rawParagraphs.map( (p) => {
        return segmenterEn.segment(p)
      })

      const paragraphs = paragraphsSegments.map( (p) => {
        return Array.from(p).map( (s) => { return s.segment})
      })

      enqueue.effect(async () => {
        window.speechSynthesis.cancel();
        await toResult( waitFor( {conditionFn: () => (!window.speechSynthesis.speaking), interval: 50, timeout: 500} ) );
      });

      return {
        ...context,
        playerState: playerStates.IsStopped,
        textToBeSpoken: {
          ...context.textToBeSpoken,
          paragraphsSegments: paragraphsSegments,
          paragraphs: paragraphs,
          readingPosition: { paragraphIndex: 0, sentenceIndex: 0 },
        },
      };
    },
    changeClientVoice: (context, event: { voiceName: string }) => {
      const cv = context.strategies.client.voices.find((v) => v.name === event.voiceName);
      if (cv === undefined) {
        console.warn("couldn't change voice to '%s'", event.voiceName);
        return context;
      }

      let nextContext = {...context};
      nextContext.strategies.client.pickedVoice = cv;

      return nextContext;
    },
    changeClientVolume: (context, event: { volume: number }) => {
      const volume = event.volume;

      if ( ! (0 <= volume && volume <= 1) ) {
        return context;
      }

      let nextContext = {...context};
      nextContext.strategies.client.volume = volume;
      return nextContext;
    },
    speechEnded: (context) => {
      // enqueue.emit.speechEnded(); // TODO
      return {...context, playerState: playerStates.IsStopped}
    },
  },
});

function activateMediaCurator() {
  // try to gain media session focus
  const mockAudio = new Audio();
  const sound= 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  mockAudio.src = sound;
  mockAudio.volume = 0; // ensure silence
  mockAudio.load();
  mockAudio.play().then(() => {
    // TODO: https://web.dev/articles/media-session
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'ttsRead',
      artist: 'ttsPlayerVoice',
    });
    navigator.mediaSession.setActionHandler('play', () => { store.trigger.startTts() } );
    navigator.mediaSession.setActionHandler('pause', () => { store.trigger.pauseTts() } );
    navigator.mediaSession.setActionHandler('nexttrack', () => { store.trigger.moveReadingPositionForward() } );
    navigator.mediaSession.setActionHandler('previoustrack', () => { store.trigger.moveReadingPositionBackward() } );

    mockAudio.pause();
  }).catch(err => {
    console.error('Silent playback failed:', err);
  });
}

export default store
