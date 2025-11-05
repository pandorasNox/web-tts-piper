'use client';

import store, { registerSentenceRef } from './store';

import { createRef, useRef, useEffect } from 'react';

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

  const sentenceRefs = useRef(new Map<string, HTMLSpanElement>);

  // useEffect(() => {}, []); // effect runs once after initial render

  useEffect(() => {
    store.trigger.putSentenceRefs( {sentenceRefs: sentenceRefs.current} );
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

      <div className="md:grid md:grid-cols-22 md:gap-2 md:min-h-96">

        {/* input  */}
        <div className="md:col-span-7 mb-2 md:min-h-9/10">
          <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Your input</label>
          <textarea id="message" rows={4}
          className="block p-2.5 w-full md:min-h-96 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={inputText}
          onChange={ (e) => { store.send({ "type": "updateInputText", inputText: e.target.value, process: false }) } }
          ></textarea>
        </div>

        <div className="md:col-span-1 flex justify-center md:pt-8">
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

        <section
          className='md:col-span-14 w-full md:pr-1'
        >
          <h3 className="mb-2 flex items-center">
            <span>output:</span>
            <div className='w-full px-2'>
              {/* progress bar */}
              <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: readingProgress + "%"}}> {readingProgress}%</div>
              </div>
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
              h-[70dvh] overflow-y-scroll
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
                      // ref={(el) => registerSentenceRef(key, el)}
                      ref={ (el) => { el ? sentenceRefs.current.set(key, el) : sentenceRefs.current.delete(key) } }
                      className={classnames("inline-block hover:bg-sky-800", {"bg-teal-700": readingPosition.paragraphIndex === pi && readingPosition.sentenceIndex === si})}
                    >
                      <span className="cursor-pointer" onClick={ () => store.send( { "type": "updateReadingPosition", "paragraphIndex": pi, "sentenceIndex": si } ) }> ▶ </span>
                      {sText}
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
