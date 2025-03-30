
import { type TTSStoreAction } from "./reducer"
import { playerStates, type PlayerState, type TextToBeSpoken, type TTSState } from "./state"

function initClientTts(
  ttsStore: TTSState, ttsDispatch: (action: TTSStoreAction) => void, speechSynthesis: SpeechSynthesis
) {
  const voices = speechSynthesis.getVoices()

  if (voices.length === 0) {
    return
  }

  ttsDispatch({ type: 'update_client_tts_voices', voices})

  let maybeFoundPrepickVoiceIndexIfExits = voices.findIndex((v) => {
    return v.name === ttsStore.strategies.client.prepickVoiceIfExits
  })

  if (maybeFoundPrepickVoiceIndexIfExits === -1) {
    ttsDispatch({ type: 'update_client_tts_pickedVoice', voice: voices[0]})
    return
  }

  ttsDispatch({ type: 'update_client_tts_pickedVoice', voice: voices[maybeFoundPrepickVoiceIndexIfExits]})
}

function clientTTSSpeak(
  synth: SpeechSynthesis,
  textToBeSpoken: TextToBeSpoken,
  voice: SpeechSynthesisVoice,
  volume: number,
  playerState: PlayerState,
  prevPlayerState: PlayerState | undefined,
  onend: (event: SpeechSynthesisEvent) => void
){
  const textToBeSpeak = textToBeSpoken.paragraphs[textToBeSpoken.readingPosition.paragraphIndex][textToBeSpoken.readingPosition.sentenceIndex]

  const utterance = buildUtterance(
    textToBeSpeak, voice, volume, onend,
  )

  synth.speak(utterance);
}

function buildUtterance(
  textToBeSpeak: string,
  voice: SpeechSynthesisVoice,
  volume: number,
  onend: (event: SpeechSynthesisEvent) => void,
 ) {
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = textToBeSpeak;
  utterance.voice = voice
  utterance.volume = volume

  utterance.onstart = () => console.debug("utterance.onstart")
  utterance.onerror = (e) => console.debug("utterance.onerror", e)
  utterance.onend = onend;

  return utterance
}

export { initClientTts, buildUtterance, clientTTSSpeak }
