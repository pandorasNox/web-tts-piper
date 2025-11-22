'use client';

import store from './store';

import * as React from "react"
import { createRef, useRef, useEffect, SVGProps } from 'react';

import PlayerControls from './playerControls'
import SentenceProgress from './progress/sentences'
import classnames from '@/util/classnames';
import { useSelector } from '@xstate/store/react';
import { Paragraphs } from '../TextToSpeech/state';

const ttsArticleContentRef = createRef<HTMLElement>();

store.send( { "type": "init", ttsArticleContentRef: ttsArticleContentRef } );

export default function TTS2() {
  const inputText = useSelector(store, (state) => state.context.inputText);
  const paragraphs = useSelector(store, (state) => state.context.textToBeSpoken.paragraphs);
  const readingPosition = useSelector(store, (state) => state.context.textToBeSpoken.readingPosition);

  const autoScrollFocuseEnabled = useSelector(store, (state) => state.context.textToBeSpoken.autoScrollFocuseEnabled);
  const toggleAutoScrollFocuse = () => {
    store.send( { "type": "toggleAutoScrollFocuse" } );
  };

  const inputRef = useRef(null);
  const sentenceRefs = useRef(new Map<string, HTMLSpanElement>);

  // useEffect(() => {}, []); // effect runs once after initial render

  // useEffect(() => {
  //   const articleEl = ttsArticleContentRef.current;
  //   if (!articleEl) return;

  //   const handleScroll = (_event: Event) => {
  //     if (!autoScrollFocuseEnabled) return;
  //     store.send( { "type": "toggleAutoScrollFocuse" } );
  //   };

  //   // Attach listener
  //   articleEl.addEventListener("scroll", handleScroll);

  //   // Cleanup on unmount
  //   return () => {
  //     articleEl.removeEventListener("scroll", handleScroll);
  //   };
  // }, [paragraphs, autoScrollFocuseEnabled]); // effect runs after each render + if 'paragraphs' change

  useEffect(() => {
    store.trigger.putRefs( { inputRef: inputRef, sentenceRefs: sentenceRefs.current } );
    return store.trigger.clearSentenceRefs;
  }, [paragraphs]); // effect runs after each render + if 'paragraphs' change

  function calculateReadingProgress(
    paragraphs: Paragraphs,
    readingPosition: {
      paragraphIndex: number;
      sentenceIndex: number;
  }
  ): number {
    const totalSentences = paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0);

    let readSentences = 0;
    for (let i = 0; i < readingPosition.paragraphIndex; i++) {
      readSentences += paragraphs[i].length;
    }
    readSentences += readingPosition.sentenceIndex;

    const progress = (readSentences / totalSentences) * 100;
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
  }

  let readingProgress = "0";
  if (paragraphs.length > 0) {
    readingProgress = calculateReadingProgress(paragraphs, readingPosition).toFixed();
  }

  return (
    <div className="p-2">
      <div className="h-10 md:h-16"></div>
      <nav
        // className="mb-2 p-2 flex justify-center"
        className={
          classnames(
            "mb-2 p-2 flex justify-center",
            "fixed top-0 left-0 w-full bg-gray-800 text-white shadow-lg z-50"
          )}
      >
        <PlayerControls />
      </nav>

      <div className="md:grid md:grid-cols-22 md:gap-2 md:h-[70vhd]">

        {/* input  */}
        <div data-description="input" className="md:col-span-7 mb-2 md:min-h-9/10">
          <h3 className="pb-2 flex items-center justify-between flex-row h-5">
            <label htmlFor="message"
              className="
                w-18
                text-center
                text-gray-900 dark:text-white
                border-t border-x border-double rounded-t-lg border-gray-400 px-2
              "
            >input:</label>
          </h3>
          <textarea id="message" ref={inputRef} rows={4}
          className="
            block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
            h-[34dvh]
            md:h-[62dvh]
            mb-[1dvh]
          "
          placeholder={inputText}
          onChange={ (e) => { store.send({ "type": "updateInputText", inputText: e.target.value, process: false }) } }
          ></textarea>
          <div className='flex flex-row h-[5dvh] rounded-lg border border-gray-300 bg-gray-700 p-1'>
            <div
              className="
                flex items-center ps-4
              "
            >
                <input id="bordered-checkbox-1" type="checkbox" value="" name="bordered-checkbox"
                  className="w-4 h-4"
                />
                <label htmlFor="bordered-checkbox-1" className="select-none w-full py-4 ms-2 text-xs/3">with ending phrase:</label>
            </div>
            <input type="text" id="ending_phrase_text" className="bg-gray-600 border rounded border-gray-500 focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="the end" required />
          </div>
        </div>

        {/* process btn  */}
        <div data-description="process button" className="md:col-span-1 flex justify-center md:pt-8">
          <button
            type="button"
            className="text-white bg-gray-800 max-h-20 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 sm:me-0 sm:mb-0 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            // onClick={() => {console.log("clicked")}}
            // onClick={updateTextSnippets}
            onClick={ () => { store.send({ "type": "processInputText" }) } }
          >
            {/* <span>↡↧⇊⇓⇟⇣⇩</span> */}
            <span className="block md:hidden rotate-180">⇪</span>
            <span className="hidden md:block rotate-90">⇪</span>
          </button>
        </div>

        {/* output  */}
        <section
          data-description="output"
          className='flex flex-col md:col-span-14 w-full md:pr-1'
        >
          <h3 className="pb-2 flex items-center justify-between flex-row h-5">
            <span className="w-18 text-center border-t border-x border-double rounded-t-lg border-gray-400 px-2"
            >output:</span>
            <div className='w-[80%] px-2 inline-flex flex-row items-center justify-center'>
              {/* progress bar */}
              <div className="w-[80%] h-4 bg-gray-200 rounded-full dark:bg-gray-700 mr-2 scale-y-80 origin-left origin-top">
                <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: readingProgress + "%"}}> {readingProgress}%</div>
              </div>
              <SentenceProgress />
            </div>
            <div
              data-description="switch for on/off auto scroll focus / manual scrolling"
              className="inline-flex items-center justify-center"
              style={{ "--scale-multiplicator": "0.7" } as React.CSSProperties}
            >
              <SVGManualScroll width={"1.05em"} height={"1.05em"} />
              <div className="relative inline-flex items-center mx-1 w-11 h-5 w-[calc(11*var(--spacing)*var(--scale-multiplicator))] h-[calc(5*var(--spacing)*var(--scale-multiplicator))]">
                <input
                  checked={autoScrollFocuseEnabled}
                  onChange={() => toggleAutoScrollFocuse()}
                  id="switch-component-blue"
                  type="checkbox"
                  className="peer appearance-none w-11 h-5 w-[calc(var(--spacing)*11*var(--scale-multiplicator))] h-[calc(var(--spacing)*5*var(--scale-multiplicator))] bg-gray-600 rounded-full checked:bg-blue-600 cursor-pointer transition-colors duration-300"
                />
                <label
                  htmlFor="switch-component-blue"
                  className="absolute top-0 left-0 w-5 h-5 w-[calc(var(--spacing)*5*var(--scale-multiplicator))] h-[calc(var(--spacing)*5*var(--scale-multiplicator))] bg-white rounded-full border border-gray-800 shadow-sm transition-transform duration-300 peer-checked:translate-x-[calc(5.8*var(--spacing)*var(--scale-multiplicator))] peer-checked:border-blue-600 cursor-pointer"
                />
              </div>
              <SvgAutoFocus width={"1.05em"} height={"1.05em"} />
            </div>
          </h3>
          <article
            ref={ttsArticleContentRef}
            className="
              p-2
              border
              border-gray-400
              border-double
              rounded-sm
              h-[42dvh]
              md:h-[68dvh]
              overflow-y-scroll
            "
          >
            {paragraphs.map((ps,pi) => (
              <p key={pi}
                className={classnames(
                  "p-1.5 rounded-sm hover:bg-gray-800",
                  { "bg-gray-800": readingPosition.paragraphIndex === pi,}
                )}
              >
                {ps.map( (sText,si) => {
                  const key = `p${pi}s${si}`;
                  return (
                    <span
                      key={key}
                      ref={(el) => {
                        if (!el) { sentenceRefs.current.delete(key); return; }
                        sentenceRefs.current.set(key, el);
                      }}
                      className={classnames(
                          "inline-block hover:rounded-sm hover:bg-sky-800",
                          {
                            "rounded-sm bg-teal-700": readingPosition.paragraphIndex === pi && readingPosition.sentenceIndex === si,
                            "md:text-4xl": readingPosition.paragraphIndex === pi && readingPosition.sentenceIndex === si,
                          }
                      )}
                    >
                      <span className="cursor-pointer" onClick={ () => store.send( { "type": "updateReadingPosition", "paragraphIndex": pi, "sentenceIndex": si } ) }> ▶ </span>
                      <span>{sText}</span>
                      <span>&nbsp;</span>{/* non-breaking-space */}
                    </span>
                  );
                }
                )}
                <br />
              </p>
            ))}
          </article>
        </section>

      </div>

    </div>
  );
}

const SvgAutoFocus = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1.5em"
    height="1.5em"
    fill="white"
    stroke="white"
    {...props}
  >
    <path d="M19 19h-4v2h4c1.1 0 2-.9 2-2v-4h-2m0-12h-4v2h4v4h2V5c0-1.1-.9-2-2-2M5 5h4V3H5c-1.1 0-2 .9-2 2v4h2m0 6H3v4c0 1.1.9 2 2 2h4v-2H5v-4m2-4h2v2H7v-2m4 0h2v2h-2v-2m4 0h2v2h-2v-2Z" />
  </svg>
);

const SVGManualScroll = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1.5em"
    height="1.5em"
    fill="white"
    // stroke="white"
    {...props}
  >
    <path d="M20 6h3l-4-4-4 4h3v12h-3l4 4 4-4h-3V6M9 3.09c2.83.48 5 2.95 5 5.91H9V3.09M14 11v4c0 3.3-2.7 6-6 6s-6-2.7-6-6v-4h12M7 9H2c0-2.96 2.17-5.43 5-5.91V9Z" />
  </svg>
);
