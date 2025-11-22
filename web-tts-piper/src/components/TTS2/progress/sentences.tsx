'use client';

import store from './../store'
import { useSelector } from '@xstate/store/react';
import { Paragraphs, ttsStrategies } from './../../TextToSpeech/state';
import { useEffect, useRef, useState } from 'react';

type Mode = "sentences" | "words" | "est";

export default function Progress() {
  const paragraphs = useSelector(store, (state) => state.context.textToBeSpoken.paragraphs);
  const readingPosition = useSelector(store, (state) => state.context.textToBeSpoken.readingPosition);

  const ttsStrategy = useSelector(store, (state) => state.context.ttsStrategy);
  const clientRate = useSelector(store, (state) => state.context.strategies.client.rate);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("est");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const countSentences = paragraphs.reduce((accumulator, current) => {
    return accumulator.concat(current)
  }, []/*inital val*/).length;

  const currentSentenceCount = paragraphs.map((s) => s.length)
    .reduce((accumulator, currentVal, cIndex) => {
      if (cIndex < readingPosition.paragraphIndex) {
        return accumulator + currentVal;
      }
      if (cIndex === readingPosition.paragraphIndex) {
        return accumulator + (readingPosition.sentenceIndex);
      }
      return accumulator;
  }, 0);

  /**
   * Counts words in a nested array of paragraphs and sentences.
   * @param paragraphs - Array of paragraphs, each paragraph is an array of sentences.
   * @returns Total word count across all paragraphs and sentences.
   */
  function countParagraphsWords(paragraphs: Paragraphs): number {
    return paragraphs.flat().reduce((sum, sentence) => sum + countSentenceWords(sentence), 0);
  }

  // Split sentence by whitespace, filter out empty strings
  const countSentenceWords = (sentence: string): number => sentence.trim().split(/\s+/).filter(Boolean).length;

  const currentWordCount =
    // flatten all previous paragraphs into a single array of sentences
    [...paragraphs.slice(0, readingPosition.paragraphIndex).flat(),
    // add sentences from the current paragraph before the current sentence
    ...paragraphs[readingPosition.paragraphIndex]?.slice(0, readingPosition.sentenceIndex) ?? []
    ]
    // sum their word counts
    .reduce((sum, sentence) => sum + countSentenceWords(sentence), 0);
  const totalWords = countParagraphsWords(paragraphs);

  function estimateReadingTime(wordCount: number, wordsPerMinute: number = 200): string {
    // total seconds based on reading speed
    const totalSeconds = Math.round((wordCount / wordsPerMinute) * 60);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // pad with leading zeros
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  }

  const rate = ttsStrategy === ttsStrategies.Client ? clientRate : 1;
  const estTime = estimateReadingTime(totalWords-currentWordCount, 200*rate); //TODO add client tts rate

  // Display content based on mode
  const displayTop =
    mode === "sentences"
      ? `${currentSentenceCount} / ${countSentences}`
      : mode === "words"
      ? `${currentWordCount} / ${totalWords}`
      : `${estTime}`;

  const displayBottom =
    mode === "sentences" ? <span>sentences</span> : mode === "words" ? <span>words</span> : <span>estimate</span>;

  // Options with helper text
  const options: { id: Mode; label: string; helper: string }[] = [
    { id: "est", label: "Estimate time", helper: "Show estimated time left based on words" },
    { id: "words", label: "Words", helper: "Show word count and words left" },
    { id: "sentences", label: "Sentences", helper: "Show sentence count and sentences left" },
  ];

  return (
    <>
      <div className="relative inline-flex border rounded border-gray-600 mb-1.5" ref={dropdownRef} >
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex flex-row items-center justify-around text-xs/2.5 w-24 py-0.5 rounded hover:bg-neutral-800 text-fg-brand"
        >
          <span className="inline-flex flex-col items-center w-[70%] pl-1">
            <span className="text-nowrap">{displayTop}</span>
            {displayBottom}
          </span>
          {/* Arrow down icon */}
          <span className='w-[30%] pr-1 inline-flex items-center justify-center'>
            <svg
              className='h-[1rem]'
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </span>
        </button>

      {/* Dropdown menu (dark mode, radios + helper texts) */}
      {open && (
        <div
          role="menu"
          aria-labelledby="progress-dropdown-button"
          className="absolute z-10 mt-7 bg-neutral-900 border border-neutral-700 rounded-base shadow-lg w-60 text-white"
        >
          <ul className="p-2 text-sm font-medium">
            {options.map((opt) => (
              <li key={opt.id}>
                <div className="inline-flex items-start w-full p-2 hover:bg-neutral-800 rounded">
                  <div className="flex items-center h-5">
                    <input
                      id={`radio-${opt.id}`}
                      type="radio"
                      name="progress-mode"
                      value={opt.id}
                      checked={mode === opt.id}
                      onChange={() => {
                        setMode(opt.id);
                        setOpen(false); // close on select
                      }}
                      className="w-4 h-4 border border-neutral-600 rounded-full bg-neutral-700 text-brand focus:ring-2 focus:ring-brand-soft"
                    />
                  </div>
                  <div className="ms-2 text-sm">
                    <label
                      htmlFor={`radio-${opt.id}`}
                      className="font-medium text-white select-none cursor-pointer"
                    >
                      <div className="mb-0.5">{opt.label}</div>
                      <p className="text-xs font-normal text-neutral-400">
                        {opt.helper}
                      </p>
                    </label>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Optional preview row at bottom to show current values for each mode */}
          {/* <div className="px-3 py-2 border-t border-neutral-800 text-xs text-neutral-300">
            <div className="flex justify-between">
              <span>Sentences</span>
              <span>
                {currentSentenceCount} / {totalSentences} ({sentencesLeft} left)
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Words</span>
              <span>
                {currentWordCount} / {totalWords} ({wordsLeft} left)
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>EST</span>
              <span>{estMinutes} min</span>
            </div>
          </div> */}
        </div>
      )}
    </div>








      {/* <span className='inline-flex flex-col text-xs/2.5 items-center'>
        <span className='text-nowrap'>{currentSentenceCount} / {countSentences}</span>
        <span>sentences</span>
      </span> */}
    </>
  )
}

        // {/* Dropdown menu */}
        // {open && (
        //   <div className="absolute z-10 mt-2 bg-neutral-900 border border-neutral-700 rounded-base shadow-lg w-40 text-white">
        //     <ul className="p-2 text-sm font-medium">
        //       <li>
        //         <button
        //           onClick={() => {
        //             setMode("sentences");
        //             setOpen(false);
        //           }}
        //           className="flex w-full p-2 hover:bg-neutral-800 rounded"
        //         >
        //           Sentences
        //         </button>
        //       </li>
        //       <li>
        //         <button
        //           onClick={() => {
        //             setMode("words");
        //             setOpen(false);
        //           }}
        //           className="flex w-full p-2 hover:bg-neutral-800 rounded"
        //         >
        //           Words
        //         </button>
        //       </li>
        //       <li>
        //         <button
        //           onClick={() => {
        //             setMode("est");
        //             setOpen(false);
        //           }}
        //           className="flex w-full p-2 hover:bg-neutral-800 rounded"
        //         >
        //           EST (time)
        //         </button>
        //       </li>
        //     </ul>
        //   </div>
        // )}
