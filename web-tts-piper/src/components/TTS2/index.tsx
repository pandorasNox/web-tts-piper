'use client';

import store from './store';

import { createRef, useRef, useEffect, SVGProps, useState } from 'react';

import PlayerControls from './playerControls'
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
    store.send( { "type": "toggleAutoScrollFocuse" } )
  };

  const inputRef = useRef(null);
  const sentenceRefs = useRef(new Map<string, HTMLSpanElement>);

  // useEffect(() => {}, []); // effect runs once after initial render

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
      <div className="h-16"></div>
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
                text-gray-900 dark:text-white
                border-t border-x border-double rounded-t-lg border-gray-400 px-2
              "
            >input</label>
          </h3>
          <textarea id="message" ref={inputRef} rows={4}
          className="block p-2.5 w-full md:min-h-96 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={inputText}
          onChange={ (e) => { store.send({ "type": "updateInputText", inputText: e.target.value, process: false }) } }
          ></textarea>
        </div>

        {/* process btn  */}
        <div data-description="process button" className="md:col-span-1 flex justify-center md:pt-8">
          <button
            type="button"
            className="text-white bg-gray-800 max-h-20 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 sm:me-0 sm:mb-0 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            // onClick={() => {console.log("clicked")}}
            // onClick={updateTextSnippets}
            onClick={ (e) => { store.send({ "type": "processInputText" }) } }
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
            <span className="border-t border-x border-double rounded-t-lg border-gray-400 px-2">output:</span>
            <div className='w-full px-2'>
              {/* progress bar */}
              <div className="bg-gray-200 rounded-full dark:bg-gray-700 scale-[0.85]">
                <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: readingProgress + "%"}}> {readingProgress}%</div>
              </div>
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
              h-[65.5dvh]
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
                  let key = `p${pi}s${si}`;
                  return (
                    <span
                      key={key}
                      // ref={el => el ? sentenceRefs?.current?.set(item.id, el) : refs.current.delete(item.id)}>
                      // ref={ el => el ? sentenceRefs?.current?.set(key, el) : sentenceRefs?.current?.delete(key) }>
                      ref={ (el) => { el ? sentenceRefs.current.set(key, el) : sentenceRefs.current.delete(key) } }
                      className={classnames("inline-block hover:bg-sky-800", {"bg-teal-700": readingPosition.paragraphIndex === pi && readingPosition.sentenceIndex === si})}
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

import * as React from "react"
const _SvgAutoFocus = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    // Icon setTabler Icons
    // LicenseMIT License
    // AuthorTabler
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    stroke="white"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2M10 15v-4a2 2 0 1 1 4 0v4M10 13h4" />
  </svg>
);
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

const _SVGManualScroll = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 5L12.5303 4.46967C12.2374 4.17678 11.7626 4.17678 11.4697 4.46967L12 5ZM12 13L11.4697 13.5303C11.7626 13.8232 12.2374 13.8232 12.5303 13.5303L12 13ZM9.46967 6.46967C9.17678 6.76256 9.17678 7.23744 9.46967 7.53033C9.76256 7.82322 10.2374 7.82322 10.5303 7.53033L9.46967 6.46967ZM13.4697 7.53033C13.7626 7.82322 14.2374 7.82322 14.5303 7.53033C14.8232 7.23744 14.8232 6.76256 14.5303 6.46967L13.4697 7.53033ZM10.5303 10.4697C10.2374 10.1768 9.76256 10.1768 9.46967 10.4697C9.17678 10.7626 9.17678 11.2374 9.46967 11.5303L10.5303 10.4697ZM14.5303 11.5303C14.8232 11.2374 14.8232 10.7626 14.5303 10.4697C14.2374 10.1768 13.7626 10.1768 13.4697 10.4697L14.5303 11.5303ZM3.25 10V14H4.75V10H3.25ZM20.75 14V10H19.25V14H20.75ZM11.25 5V13H12.75V5H11.25ZM11.4697 4.46967L9.46967 6.46967L10.5303 7.53033L12.5303 5.53033L11.4697 4.46967ZM11.4697 5.53033L13.4697 7.53033L14.5303 6.46967L12.5303 4.46967L11.4697 5.53033ZM12.5303 12.4697L10.5303 10.4697L9.46967 11.5303L11.4697 13.5303L12.5303 12.4697ZM12.5303 13.5303L14.5303 11.5303L13.4697 10.4697L11.4697 12.4697L12.5303 13.5303ZM20.75 10C20.75 5.16751 16.8325 1.25 12 1.25V2.75C16.0041 2.75 19.25 5.99594 19.25 10H20.75ZM12 22.75C16.8325 22.75 20.75 18.8325 20.75 14H19.25C19.25 18.0041 16.0041 21.25 12 21.25V22.75ZM3.25 14C3.25 18.8325 7.16751 22.75 12 22.75V21.25C7.99594 21.25 4.75 18.0041 4.75 14H3.25ZM4.75 10C4.75 5.99594 7.99594 2.75 12 2.75V1.25C7.16751 1.25 3.25 5.16751 3.25 10H4.75Z"
      fill="#000000"
    />
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
