'use client';

import store from "./store";
import { useSelector } from "@xstate/store/react";

export default function TTSClientStrategy() {
  const voices = useSelector(store, (state) => state.context.strategies.client.voices);
  const pickedVoice = useSelector(store, (state) => state.context.strategies.client.pickedVoice);
  const volume = useSelector(store, (state) => state.context.strategies.client.volume);
  const rate = useSelector(store, (state) => state.context.strategies.client.rate);
  const pitch = useSelector(store, (state) => state.context.strategies.client.pitch);

  const handleClientVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    store.send( { type: "changeClientVoice", voiceName: event.target.value } );
  };

  return (
    <>
      <div className="voiceSelector mb-2 border border-gray-700 rounded-sm p-2">
        <label htmlFor="clientVoices" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a voice</label>
        <select id="clientVoices"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={pickedVoice?.name}
          onChange={handleClientVoiceChange}
        >
          {voices.map((voice) => (
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
            value={volume}
            onChange={ (e) => { store.send( { type: "changeClientUtteranceSettings", volume: parseFloat(e.target.value) } ); } }
          />
          <input
            id="number-input-volume-range" type="number"
            min="0" max="1" step="0.01"
            aria-describedby="helper-text-explanation"
            className="w-11/40 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={volume}
            onChange={ (e) => { store.send( { type: "changeClientUtteranceSettings", volume: parseFloat(e.target.value) } ); } }
          />
        </div>
      </div>

      <div data-description="rate" className="mb-2 border border-gray-700 rounded-sm p-2">
        <label htmlFor="slider-rate-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rate</label>
        <div className="flex items-center gap-1.5">
          <input
            id="slider-rate-range" type="range"
            min="0.1" max="10" step="0.01"
            className="w-29/40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            value={rate}
            onChange={ (e) => { store.send( { type: "changeClientUtteranceSettings", rate: parseFloat(e.target.value) } ); } }
          />
          <input
            id="number-input-rate-range" type="number"
            min="0.1" max="10" step="0.01"
            aria-describedby="helper-text-explanation"
            className="w-11/40 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={rate}
            onChange={ (e) => { store.send( { type: "changeClientUtteranceSettings", rate: parseFloat(e.target.value) } ); } }
          />
        </div>
      </div>

      <div data-description="pitch" className="mb-2 border border-gray-700 rounded-sm p-2">
        <label htmlFor="slider-pitch-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pitch</label>
        <div className="flex items-center gap-1.5">
          <input
            id="slider-pitch-range" type="range"
            min="0.1" max="2" step="0.01"
            className="w-29/40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            value={pitch}
            onChange={ (e) => { store.send( { type: "changeClientUtteranceSettings", pitch: parseFloat(e.target.value) } ); } }
          />
          <input
            id="number-input-pitch-range" type="number"
            min="0.1" max="2" step="0.01"
            aria-describedby="helper-text-explanation"
            className="w-11/40 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={pitch}
            onChange={ (e) => { store.send( { type: "changeClientUtteranceSettings", pitch: parseFloat(e.target.value) } ); } }
          />
        </div>
      </div>

    </>
  );
}
