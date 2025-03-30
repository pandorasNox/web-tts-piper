'use client'

import { useState, useReducer, useEffect, createContext, useContext, useRef, } from 'react'

import type { TTSState, TTSStrategy, PlayerState, TextToBeSpoken, } from './state'
import { playerStates, ttsStrategies,  } from './state'

import { ttsStoreReducer, setPlayerStateByDispatch, } from './reducer'

import classnames from '../../util/classnames'
import placeholderText from '../../util/placeholderText'
import { buildUtterance, clientTTSSpeak, initClientTts } from './clientTts'
import usePrevious from '@/hooks/usePrevious'

const initalTTSState: TTSState = {
  ttsStrategy: ttsStrategies.Client,
  inputText: placeholderText,
  playerState: playerStates.IsStopped,
  textToBeSpoken: {
    paragraphsSegments: [],
    paragraphs: [],
    readingPosition: {paragraphIndex: 0 , sentenceIndex: 0},
  },
  strategies: {
    client: {
      isSupported: false,
      voices: [],
      prepickVoiceIfExits: "Daniel",
      pickedVoice: null,
      volume: parseFloat(0.5.toPrecision(2)), // TODO
    },
    serverPiper: {},
  },
}

const ClientTTSContext = createContext({
  state: initalTTSState.strategies.client,
  updateVolume: (vol: number) => {},
});

// =============================================================================

export default function TextToSpeechController() {
  const [ttsStore, ttsDispatch] = useReducer(ttsStoreReducer, initalTTSState)
  const prevStateRef = usePrevious<TTSState>(initalTTSState)

  const setPlayerState = (newState: PlayerState) => {setPlayerStateByDispatch(newState, ttsDispatch)}

  // Create a ref to hold the latest playerState
  const playerStateRef = useRef(ttsStore.playerState);
  // Sync the ref with the current state whenever it changes
  useEffect(() => {
    playerStateRef.current = ttsStore.playerState;
  }, [ttsStore.playerState]);

  // hooks run after render
  useEffect(() => {
    if (window.speechSynthesis === undefined ) {
      return;
    }

    ttsDispatch({ type: 'update_client_is_supported', isSupported: true});

    initClientTts(ttsStore, ttsDispatch, window.speechSynthesis)
    // no return cleanup function needed here
  }, []); // with '[]' (empty array) => will only run after the initial render

  // hooks run after render
  useEffect(() => {
    console.debug("== start: run useEffect for client tts");
    // console.debug("          previous state:", prevStateRef !== undefined && prevStateRef);
    console.debug("          current  ttsStore.playerState:", ttsStore.playerState);

    if ( ! ttsStore.strategies.client.isSupported) {
      console.debug("  -- return after:", "if ( ! ttsStore.strategies.client.isSupported)");
      return
    }

    if (ttsStore.strategies.client.pickedVoice === null) {
      console.debug("  -- return after:", "if (ttsStore.strategies.client.pickedVoice === null)");
      return
    }

    if (ttsStore.textToBeSpoken.paragraphs.length === 0) {
      console.debug("  -- return after:", "if (ttsStore.textToBeSpoken.paragraphs.length === 0)");
      return
    }

    const synth = window.speechSynthesis;
    const textToBeSpeak = ttsStore.textToBeSpoken.paragraphs[ttsStore.textToBeSpoken.readingPosition.paragraphIndex][ttsStore.textToBeSpoken.readingPosition.sentenceIndex]
    const onend = (event: SpeechSynthesisEvent) => {
      console.debug( `  >> ${event.name} reached after ${event.elapsedTime} seconds. ttsStore.playerState:`, ttsStore.playerState,);
      const timeoutId = setTimeout(() => {
        console.debug("** run setTimeout:", "ttsStore.playerState=", ttsStore.playerState, "playerStateRef.current=", playerStateRef.current);
        clearTimeout(timeoutId); playerStateRef.current === playerStates.IsPlaying && nextReadingPosition()
      }, 100)
    }
    const utterance = buildUtterance(textToBeSpeak, ttsStore.strategies.client.pickedVoice, ttsStore.strategies.client.volume, onend,)
    utterance.onend = onend

    if (ttsStore.playerState === playerStates.IsPaused) {
      console.debug("  -- return after:", "if (ttsStore.playerState === playerStates.IsPaused)");
      // utterance.onend = () => {}
      window.speechSynthesis.cancel()
      return
    }

    const {paragraphIndex, sentenceIndex} = ttsStore.textToBeSpoken.readingPosition;

    if (ttsStore.playerState === playerStates.IsStopped && (paragraphIndex === 0 && sentenceIndex === 0)) {
      console.debug("  -- return after:", "if (ttsStore.playerState === playerStates.IsStopped && (paragraphIndex === 0 && sentenceIndex === 0))");
      window.speechSynthesis.cancel()
      return
    }

    if (ttsStore.playerState === playerStates.IsStopped && paragraphIndex > 0) {
      console.debug("  -- return after:", "if (ttsStore.playerState === playerStates.IsStopped && paragraphIndex > 0)");
      window.speechSynthesis.cancel()
      ttsDispatch({type: 'update_reading_position', readingPosition: {paragraphIndex: 0, sentenceIndex: 0}})
      return
    }

    if (ttsStore.playerState === playerStates.IsStopped && sentenceIndex > 0) {
      console.debug("  -- return after:", "if (ttsStore.playerState === playerStates.IsStopped && sentenceIndex > 0)");
      window.speechSynthesis.cancel()
      ttsDispatch({type: 'update_reading_position', readingPosition: {paragraphIndex: 0, sentenceIndex: 0}})
      return
    }

    const currentParagraphSentences = ttsStore.textToBeSpoken.paragraphs[ttsStore.textToBeSpoken.readingPosition.paragraphIndex]
    if (currentParagraphSentences.length === 0) {
      console.debug("  -- return after:", "if (currentParagraphSentences.length === 0)");
      nextReadingPosition();
      return
    }

    console.debug("  -- run useEffect for client tts", "after currentParagraph.length === 0");
    synth.speak(utterance);
    // const timeoutId = setTimeout(() => {
    //   console.debug("** run setTimeout:", "ttsStore.playerState=", ttsStore.playerState, "playerStateRef.current=", playerStateRef.current);
    //   clearTimeout(timeoutId); playerStateRef.current === playerStates.IsPlaying && nextReadingPosition()
    // }, 2000)

    // clientTTSSpeak(
    //   window.speechSynthesis,
    //   ttsStore.textToBeSpoken,
    //   ttsStore.strategies.client.pickedVoice,
    //   ttsStore.strategies.client.volume /*volume*/,
    //   ttsStore.playerState,
    //   prevStateRef?.playerState,
    //   nextReadingPosition,
    // )

    console.debug("== end: run useEffect for client tts");
    // no return cleanup function needed here
  }, [ttsStore.strategies.client.isSupported, ttsStore.playerState, ttsStore.textToBeSpoken.readingPosition]);

  function processInputTextForTTS() {
    const segmenterEn = new Intl.Segmenter('en' /* alt. e.g. 'en-US' */, {
      granularity: 'sentence'
    });

    const rawParagraphs = ttsStore.inputText.split(/\n/)
    const paragraphsSegments = rawParagraphs.map( (p) => {
      return segmenterEn.segment(p)
    })

    const paragraphs = paragraphsSegments.map( (p) => {
      return Array.from(p).map( (s) => { return s.segment})
    })

    ttsDispatch({type: "set_textToBeSpoken", textToBeSpoken: {
      paragraphsSegments: paragraphsSegments,
      paragraphs: paragraphs,
    }})
  }

  function updateReadingPosition(paragraphIndex: number, sentanceIndex: number) {
    if (
      ! Number.isInteger(paragraphIndex) || paragraphIndex < 0
      || ! Number.isInteger(sentanceIndex) || sentanceIndex < 0
    ) {
      return
    }

    ttsDispatch({type: 'update_reading_position', readingPosition: {paragraphIndex: paragraphIndex, sentenceIndex: sentanceIndex}})
  }

  // function nextReadingPosition(paragraphs: any[][], currentPosition: Position): Position | null {
  function nextReadingPosition() {
    const { paragraphIndex, sentenceIndex } = ttsStore.textToBeSpoken.readingPosition;
    const paragraphs = ttsStore.textToBeSpoken.paragraphs

    // Ensure the outer array exists at the current position
    if (paragraphIndex >= paragraphs.length) {
      return; // No further position available
    }

    const currentParagraph = paragraphs[paragraphIndex];

    if (sentenceIndex >= currentParagraph.length - 1) {
      // Move to the next paragraph
      const maybeNextParagraphIndex = paragraphIndex + 1;
      if (maybeNextParagraphIndex >= paragraphs.length) {
        return; // No further position available
      }

      ttsDispatch({type: 'update_reading_position', readingPosition: {paragraphIndex: maybeNextParagraphIndex, sentenceIndex: 0}})
      return;
    }

    // Otherwise, move to the next sentence
    // return { paragraphIndex, sentenceIndex: sentanceIndex + 1 };
    ttsDispatch({type: 'update_reading_position', readingPosition: {paragraphIndex: paragraphIndex, sentenceIndex: sentenceIndex + 1}})
  }

  function previousReadingPosition() {
    const { paragraphIndex, sentenceIndex } = ttsStore.textToBeSpoken.readingPosition;
    const paragraphs = ttsStore.textToBeSpoken.paragraphs;

    // Ensure the outer array exists at the current position
    if (paragraphIndex < 0 || paragraphIndex >= paragraphs.length) {
      return; // No previous position available
    }

    // If we're at the beginning of a paragraph, move to the last sentence of the previous paragraph
    if (sentenceIndex <= 0) {
      const maybePreviousParagraphIndex = paragraphIndex - 1;
      if (maybePreviousParagraphIndex < 0) {
        return; // No previous position available
      }

      const previousParagraph = paragraphs[maybePreviousParagraphIndex];
      ttsDispatch({
        type: 'update_reading_position',
        readingPosition: {
          paragraphIndex: maybePreviousParagraphIndex,
          sentenceIndex: previousParagraph.length === 0 ? 0 : previousParagraph.length - 1,
        },
      });
      return;
    }

    // Otherwise, move to the previous sentence within the current paragraph
    ttsDispatch({
      type: 'update_reading_position',
      readingPosition: {
        paragraphIndex: paragraphIndex,
        sentenceIndex: sentenceIndex - 1,
      },
    });
  }

  const changeClientVoice = (voiceName: string) => {
    let cv = ttsStore.strategies.client.voices.find((v) => v.name === voiceName)

    if (cv === undefined) {
      return
    }

    ttsDispatch({ type: 'update_client_tts_pickedVoice', voice: cv})
  }

  // const handleClientVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

  const updateVolume = (volume: number) => {
    if ( ! (0 <= volume && volume <= 1) ) {
      return
    }

    ttsDispatch({ type: 'update_client_tts_volume', volume: volume})
  }

  return (
    <ClientTTSContext value={ {state: ttsStore.strategies.client, updateVolume: updateVolume} }>
      <TextToSpeech
        ttsStrategy={ttsStore.ttsStrategy}
        dispatchStrategyChange={(ttss: TTSStrategy) => {ttsDispatch({type: 'change_strategy', strategy: ttss})}}
        inputText={ttsStore.inputText}
        updateInputText={(input: string) => {ttsDispatch({type: 'update_inputText', inputText: input})}}
        textToBeSpoken={ttsStore.textToBeSpoken}
        updateTextSnippets={processInputTextForTTS}
        updateReadingPosition={updateReadingPosition}
        nextReadingPosition={nextReadingPosition}
        previousReadingPosition={previousReadingPosition}
        playerState={ttsStore.playerState}
        setPlayerState={setPlayerState}
        changeClientVoice={changeClientVoice}
      />
    </ClientTTSContext>
  );
}

// ============================================================================

function TextToSpeech({
  ttsStrategy,
  dispatchStrategyChange,
  inputText,
  updateInputText,
  textToBeSpoken,
  updateTextSnippets,
  updateReadingPosition,
  nextReadingPosition,
  previousReadingPosition,
  playerState,
  setPlayerState,
  changeClientVoice,
} : {
  ttsStrategy: TTSStrategy,
  dispatchStrategyChange: (ttss: TTSStrategy) => void,
  inputText: string,
  updateInputText: (inputText: string) => void,
  textToBeSpoken: TextToBeSpoken,
  updateTextSnippets: () => void,
  updateReadingPosition: (paragraphIndex: number, sentanceIndex: number) => void,
  nextReadingPosition: () => void,
  previousReadingPosition: () => void,
  playerState: PlayerState,
  setPlayerState: (ps: PlayerState) => void,
  changeClientVoice: (voiceName: string) => void,
}) {
  return (
    <div className="p-2">
      <div className="h-16"></div>
      <nav
        // className="mb-2 p-2 flex justify-center"
        className={
          classnames(
            "mb-2 p-2 flex justify-center",
            "fixed top-0 left-0 w-full bg-gray-800 text-white shadow-lg z-50"
          )}
      >
        <Controls
            ttsStrategy={ttsStrategy}
            dispatchStrategyChange={dispatchStrategyChange}
            textToBeSpoken={textToBeSpoken}
            updateReadingPosition={updateReadingPosition}
            nextReadingPosition={nextReadingPosition}
            previousReadingPosition={previousReadingPosition}
            playerState={playerState}
            setPlayerState={setPlayerState}
            changeClientVoice={changeClientVoice}
        />
      </nav>

      <div className="md:grid md:grid-cols-22 md:gap-2 md:min-h-96">

        {/* input  */}
        <div className="md:col-span-7 mb-2 md:min-h-9/10">
          <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Your input</label>
          <textarea id="message" rows={4}
          className="block p-2.5 w-full md:min-h-96 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={inputText}
          onChange={ (e) => updateInputText(e.target.value) }
          ></textarea>
        </div>

        <div className="md:col-span-1 flex justify-center md:pt-8">
          <button
            type="button"
            className="text-white bg-gray-800 max-h-20 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 sm:me-0 sm:mb-0 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            // onClick={() => {console.log("clicked")}}
            onClick={updateTextSnippets}
          >
            {/* <span>↡↧⇊⇓⇟⇣⇩</span> */}
            <span className="block md:hidden rotate-180">⇪</span>
            <span className="hidden md:block rotate-90">⇪</span>
          </button>
        </div>

        <section
          className='md:col-span-14 w-full md:pr-1'
        >
          <h3 className="mb-2">output:</h3>
          <article
            className="
              p-2
              border
              border-gray-400
              border-double
              rounded-sm
            "
          >
            {textToBeSpoken.paragraphs.map((ps,pi) => (
              <p key={pi}
                className={classnames(
                  "p-1.5 rounded-sm hover:bg-gray-800",
                  { "bg-gray-800": textToBeSpoken.readingPosition.paragraphIndex === pi,}
                )}
              >
                {ps.map( (s,si) => (
                  <span key={si} className={classnames("inline-block hover:bg-teal-700", {"bg-teal-700": textToBeSpoken.readingPosition.paragraphIndex === pi && textToBeSpoken.readingPosition.sentenceIndex === si})}>{s}</span>
                ) )}
                <br />
              </p>
            ))}
          </article>
        </section>
      </div>
    </div>
  );
}

function Controls({
  ttsStrategy,
  dispatchStrategyChange,
  textToBeSpoken,
  updateReadingPosition,
  nextReadingPosition,
  previousReadingPosition,
  playerState,
  setPlayerState,
  changeClientVoice,
} : {
  ttsStrategy: TTSStrategy,
  dispatchStrategyChange: (ttss: TTSStrategy) => void,
  textToBeSpoken: TextToBeSpoken,
  updateReadingPosition: (paragraphIndex: number, sentanceIndex: number) => void,
  nextReadingPosition: () => void,
  previousReadingPosition: () => void,
  playerState: PlayerState,
  setPlayerState: (ps: PlayerState) => void,
  changeClientVoice: (voiceName: string) => void,
}) {

  return (
    <>
      {/* <div className="controls p-4 flex justify-between items-center gap-2 bg-gray-700 rounded-2xl"> */}
      <div className="controls p-4 grid grid-cols-9 items-center gap-2 bg-gray-700 rounded-2xl">

        <button className="col-3 p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700"
            onClick={previousReadingPosition}
          >
          {/* backward  */}
          <svg className="-scale-x-100 w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.027 10.9a8.729 8.729 0 0 1 6.422-3.62v-1.2A2.061 2.061 0 0 1 12.61 4.2a1.986 1.986 0 0 1 2.104.23l5.491 4.308a2.11 2.11 0 0 1 .588 2.566 2.109 2.109 0 0 1-.588.734l-5.489 4.308a1.983 1.983 0 0 1-2.104.228 2.065 2.065 0 0 1-1.16-1.876v-.942c-5.33 1.284-6.212 5.251-6.25 5.441a1 1 0 0 1-.923.806h-.06a1.003 1.003 0 0 1-.955-.7A10.221 10.221 0 0 1 5.027 10.9Z"/>
          </svg>
        </button>

        <button
          // className="p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700"
          className={classnames(
            "p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700",
            {
              "bg-gray-500":        playerState !== playerStates.IsPlaying,
              "hover:bg-gray-400":  playerState !== playerStates.IsPlaying,
              "bg-red-700":         playerState === playerStates.IsPlaying,
              "hover:bg-red-600":   playerState === playerStates.IsPlaying,
            },
          )}
          onClick={ () => {setPlayerState(playerStates.IsPlaying)} }
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clipRule="evenodd"/>
          </svg>
          {/* <span>Play</span> */}
        </button>

        <button className="p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700"
          onClick={ () => {setPlayerState(playerStates.IsPaused)} }
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8Zm7 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z" clipRule="evenodd"/>
          </svg>
        </button>

        <button className="p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700"
          onClick={ () => {setPlayerState(playerStates.IsStopped)} }
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z"/>
          </svg>
        </button>

        <button className="p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700"
          onClick={() => {playerState === playerStates.IsStopped && setPlayerState(playerStates.IsPaused); nextReadingPosition()}}
        >
          {/* forward */}
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.027 10.9a8.729 8.729 0 0 1 6.422-3.62v-1.2A2.061 2.061 0 0 1 12.61 4.2a1.986 1.986 0 0 1 2.104.23l5.491 4.308a2.11 2.11 0 0 1 .588 2.566 2.109 2.109 0 0 1-.588.734l-5.489 4.308a1.983 1.983 0 0 1-2.104.228 2.065 2.065 0 0 1-1.16-1.876v-.942c-5.33 1.284-6.212 5.251-6.25 5.441a1 1 0 0 1-.923.806h-.06a1.003 1.003 0 0 1-.955-.7A10.221 10.221 0 0 1 5.027 10.9Z"/>
          </svg>
        </button>

        <div className='col-9'>
          <SettingsDrawer
            ttsStrategy={ttsStrategy}
            dispatchStrategyChange={dispatchStrategyChange}
            textToBeSpoken={textToBeSpoken}
            updateReadingPosition={updateReadingPosition}
            nextReadingPosition={nextReadingPosition}
            playerState={playerState}
            setPlayerState={setPlayerState}
            changeClientVoice={changeClientVoice}
          />
        </div>
      </div>
    </>
  );
}

// handleClientVoiceChange:(event: React.ChangeEvent<HTMLSelectElement>) => void,
// handleClientVolumeChange:(event: React.ChangeEvent<HTMLInputElement>) => void,

function SettingsDrawer({
  ttsStrategy,
  dispatchStrategyChange,
  textToBeSpoken,
  updateReadingPosition,
  nextReadingPosition,
  playerState,
  setPlayerState,
  changeClientVoice
} : {
  ttsStrategy: TTSStrategy,
  dispatchStrategyChange: (ttss: TTSStrategy) => void,
  textToBeSpoken: TextToBeSpoken,
  updateReadingPosition: (paragraphIndex: number, sentanceIndex: number) => void,
  nextReadingPosition: () => void,
  playerState: PlayerState,
  setPlayerState: (ps: PlayerState) => void,
  changeClientVoice: (voiceName: string) => void,
}) {
  const [showSettingsState, setShowSettingsState] = useState(false)

  return (
    <>
      {/* <!-- drawer init and toggle --> */}
      <div className="text-center">
        <button className="p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700"
            onClick={_ => setShowSettingsState(!showSettingsState)}
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M6 4v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2m6-16v2m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v10m6-16v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2"/>
            </svg>
          </button>
      </div>

      {/* <!-- drawer component --> */}
      <div id="drawer-right-example"
        // className="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform translate-x-full bg-white w-80 dark:bg-gray-800"

        className={classnames(
            "fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform bg-white w-80 dark:bg-gray-800",
            {"transform-none": showSettingsState, "translate-x-full": !showSettingsState},
        )}
        tabIndex={-1} aria-labelledby="drawer-right-label"
      >
          <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"><svg className="w-4 h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
        </svg>Settings</h5>
        <button
          type="button" data-drawer-hide="drawer-right-example" aria-controls="drawer-right-example" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={_ => setShowSettingsState(false)}
        >
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span className="sr-only">Close menu</span>
        </button>
        <section>
          {/* <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Supercharge your hiring by taking advantage of our <a href="#" className="text-blue-600 underline font-medium dark:text-blue-500 hover:no-underline">limited-time sale</a> for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.</p>
          <div className="grid grid-cols-2 gap-4">
              <a href="#" className="px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Learn more</a>
              <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Get access <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
          </svg></a>
          </div> */}
          <TTSStrategyContent
            ttsStrategy={ttsStrategy}
            dispatchStrategyChange={dispatchStrategyChange}
            textToBeSpoken={textToBeSpoken}
            updateReadingPosition={updateReadingPosition}
            nextReadingPosition={nextReadingPosition}
            playerState={playerState}
            setPlayerState={setPlayerState}
            changeClientVoice={changeClientVoice}
          />
        </section>
      </div>
    </>
  );
}

function TTSStrategyContent({
  ttsStrategy,
  dispatchStrategyChange,
  textToBeSpoken,
  updateReadingPosition,
  nextReadingPosition,
  playerState,
  setPlayerState,
  changeClientVoice,
} : {
  ttsStrategy: TTSStrategy,
  dispatchStrategyChange: (ttss: TTSStrategy) => void,
  textToBeSpoken: TextToBeSpoken,
  updateReadingPosition: (paragraphIndex: number, sentanceIndex: number) => void,
  nextReadingPosition: () => void,
  playerState: PlayerState,
  setPlayerState: (ps: PlayerState) => void,
  changeClientVoice: (voiceName: string) => void,
}) {

  let startComp = <p>No strategy selected</p>

  if (ttsStrategy === ttsStrategies.Client) {
    startComp = <TTSClientStrategy
      changeClientVoice={changeClientVoice}
    />;
  }

  if (ttsStrategy === ttsStrategies.ServerPiper) {
    startComp = (
      <>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Server Strategy</h3>
        <p className="mb-2">This is some placeholder content for server strategy.</p>
        <p>Some more content.</p>
      </>
    );
  }

  return (
    <section className="mb-2 border rounded-lg border-gray-500">
      {/* <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select TTS strategy</label>
          <select id="tabs" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { if (event.target.value === "Client") {dispatchStrategyChange(ttsStrategies.Client)}; if (event.target.value === "Server") {dispatchStrategyChange(ttsStrategies.ServerPiper)}; }}
          >
              <option>Client</option>
              <option>Server</option>
          </select>
      </div> */}
      {/* <ul className="hidden text-sm font-medium text-center text-gray-500 border-b border-gray-500 rounded-lr-lg shadow-sm sm:flex dark:divide-gray-700 dark:text-gray-400"> */}
      <ul className="flex text-sm font-medium text-center text-gray-500 border-b border-gray-500 rounded-lr-lg shadow-sm dark:divide-gray-700 dark:text-gray-400">
          <li className="w-full focus-within:z-10">
              <a href="#"
                // className="
                //   inline-block w-full p-4

                //   text-gray-900
                //   bg-gray-100

                //   border-r
                //   border-gray-200
                //   dark:border-gray-700
                //   rounded-tl-lg

                //   focus:ring-4 focus:ring-blue-300 active focus:outline-none dark:bg-gray-700 dark:text-white
                // "
                className={classnames(
                  "inline-block w-full p-4",
                  {
                    "focus:ring-4": true,
                    "focus:ring-blue-300": true,
                    "border-r": true,
                    "border-gray-200": true,
                    "rounded-tl-lg": true,
                    "dark:border-gray-700": true,
                    "focus:outline-none": true,

                    "text-gray-900": ttsStrategy === ttsStrategies.Client,
                    "bg-gray-100": ttsStrategy === ttsStrategies.Client,
                    "dark:bg-gray-700": ttsStrategy === ttsStrategies.Client,
                    "dark:text-white": ttsStrategy === ttsStrategies.Client,

                    "bg-white": ttsStrategy !== ttsStrategies.ServerPiper,
                    "hover:text-gray-700": ttsStrategy !== ttsStrategies.ServerPiper,
                    "hover:bg-gray-50": ttsStrategy !== ttsStrategies.ServerPiper,
                    "dark:hover:text-white": ttsStrategy !== ttsStrategies.ServerPiper,
                    "dark:bg-gray-800": ttsStrategy !== ttsStrategies.ServerPiper,
                    "dark:hover:bg-gray-700": ttsStrategy !== ttsStrategies.ServerPiper,

                    "active": ttsStrategy === ttsStrategies.Client,
                  }
                )}
                onClick={() => {dispatchStrategyChange(ttsStrategies.Client)}}
              >Client</a>
          </li>
          <li className="w-full focus-within:z-10">
              <a href="#"
                // className="
                //   inline-block w-full p-4

                //   bg-white
                //   border-s-0
                //   border-gray-200
                //   rounded-tr-lg
                //   dark:border-gray-700
                //   hover:text-gray-700
                //   hover:bg-gray-50
                //   focus:ring-4
                //   focus:ring-blue-300
                //   focus:outline-none
                //   dark:hover:text-white
                //   dark:bg-gray-800
                //   dark:hover:bg-gray-700
                // "
                className={classnames(
                  "inline-block w-full p-4",
                  {
                    "focus:ring-4": true,
                    "focus:ring-blue-300": true,
                    "border-s-0": true,
                    "border-gray-200": true,
                    "rounded-tr-lg": true,
                    "dark:border-gray-700": true,
                    "focus:outline-none": true,

                    "text-gray-900": ttsStrategy !== ttsStrategies.Client,
                    "bg-gray-100": ttsStrategy !== ttsStrategies.Client,
                    "dark:bg-gray-700": ttsStrategy !== ttsStrategies.Client,
                    "dark:text-white": ttsStrategy !== ttsStrategies.Client,

                    "bg-white": ttsStrategy === ttsStrategies.ServerPiper,
                    "hover:text-gray-700": ttsStrategy === ttsStrategies.ServerPiper,
                    "hover:bg-gray-50": ttsStrategy === ttsStrategies.ServerPiper,
                    "dark:hover:text-white": ttsStrategy === ttsStrategies.ServerPiper,
                    "dark:bg-gray-800": ttsStrategy === ttsStrategies.ServerPiper,
                    "dark:hover:bg-gray-700": ttsStrategy === ttsStrategies.ServerPiper,

                    "active": ttsStrategy === ttsStrategies.ServerPiper,
                  }
                )}
                onClick={() => {dispatchStrategyChange(ttsStrategies.ServerPiper)}}
              >Server</a>
          </li>
      </ul>

      <div
        // className="col-span-4 p-6 bg-gray-50 text-medium text-gray-500 dark:text-gray-400 dark:bg-gray-800 rounded-lg"
        className="p-2 h-48"
      >
        {startComp}
      </div>
    </section>
  );
}

function TTSClientStrategy({
  changeClientVoice,
} : {
  changeClientVoice: (voiceName: string) => void,
}) {
  const clientStrategy = useContext(ClientTTSContext)

  // console.debug("choosenClientVoice.name:", choosenClientVoice?.name)

  const handleClientVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    changeClientVoice(event.target.value)
  };

  return (
    <>
      <div className="voiceSelector mb-2 border border-gray-700 rounded-sm p-2">
        <label htmlFor="clientVoices" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a voice</label>
        <select id="clientVoices"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={clientStrategy.state.pickedVoice?.name}
          onChange={handleClientVoiceChange}
        >
          {clientStrategy.state.voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} [ {voice.lang} ]
            </option>
          ))}
        </select>
      </div>
      <div className="slider mb-2 border border-gray-700 rounded-sm p-2">
        <label htmlFor="slider-volume-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Volume</label>
        <div className="flex items-center gap-1.5">
          <input
            id="slider-volume-range" type="range"
            min="0" max="1" step="0.01"
            className="w-29/40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            value={clientStrategy.state.volume}
            onChange={(e) => {clientStrategy.updateVolume(parseFloat(e.target.value))}}
          />
          <input
            id="number-input-volume-range" type="number"
            min="0" max="1" step="0.01"
            aria-describedby="helper-text-explanation"
            className="w-11/40 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={clientStrategy.state.volume}
            onChange={(e) => {clientStrategy.updateVolume(parseFloat(e.target.value))}}
          />
        </div>
      </div>
    </>
  );
}
