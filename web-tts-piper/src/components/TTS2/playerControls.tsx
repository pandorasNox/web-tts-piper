'use client';

import classnames from '@/util/classnames';
import store from './store'
import { useSelector } from '@xstate/store/react';
import { playerStates } from '../TextToSpeech/state';

import SettingsDrawer from './settingsDrawer';

export default function Controls({} : {}) {
  const playerState = useSelector(store, (state) => state.context.playerState);

  return (
    <>
      {/* <div className="controls p-4 flex justify-between items-center gap-2 bg-gray-700 rounded-2xl"> */}
      <div className="controls p-4 grid grid-cols-9 items-center gap-2 bg-gray-700 rounded-2xl">

        <button
          data-description="backward button"
          className="col-3 p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700 cursor-pointer"
          onClick={() => store.send({type: "moveReadingPositionBackward"})}
        >
          {/* backward  */}
          <svg className="-scale-x-100 w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.027 10.9a8.729 8.729 0 0 1 6.422-3.62v-1.2A2.061 2.061 0 0 1 12.61 4.2a1.986 1.986 0 0 1 2.104.23l5.491 4.308a2.11 2.11 0 0 1 .588 2.566 2.109 2.109 0 0 1-.588.734l-5.489 4.308a1.983 1.983 0 0 1-2.104.228 2.065 2.065 0 0 1-1.16-1.876v-.942c-5.33 1.284-6.212 5.251-6.25 5.441a1 1 0 0 1-.923.806h-.06a1.003 1.003 0 0 1-.955-.7A10.221 10.221 0 0 1 5.027 10.9Z"/>
          </svg>
        </button>

        <button
          data-description="play button"
          // className="p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700"
          className={classnames(
            "p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700 cursor-pointer",
            {
              "bg-gray-500":        playerState !== playerStates.IsPlaying,
              "hover:bg-gray-400":  playerState !== playerStates.IsPlaying,
              "bg-green-600":         playerState === playerStates.IsPlaying,
              "hover:bg-green-500":   playerState === playerStates.IsPlaying,
            },
          )}
          onClick={ () => { store.send({"type": "startTts"}) } }
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clipRule="evenodd"/>
          </svg>
          {/* <span>Play</span> */}
        </button>

        <button
          data-description="pause button"
          className={classnames(
            "p-2 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-700 cursor-pointer",
            {
              "bg-gray-500":        playerState !== playerStates.IsPaused,
              "hover:bg-gray-400":  playerState !== playerStates.IsPaused,
              "bg-blue-600":         playerState === playerStates.IsPaused,
              "hover:bg-blue-500":   playerState === playerStates.IsPaused,
            },
          )}
          onClick={ () => { store.send({"type": "pauseTts"}) } }
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8Zm7 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z" clipRule="evenodd"/>
          </svg>
        </button>

        <button
          data-description="stop button"
          className="p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700 cursor-pointer"
          onClick={ () => { store.send({"type": "stopTts"}) } }
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z"/>
          </svg>
        </button>

        <button
          data-description="forward button"
          className="p-2 bg-gray-500 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-700 cursor-pointer"
          onClick={() => store.send({type: "moveReadingPositionForward"})}
        >
          {/* forward */}
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.027 10.9a8.729 8.729 0 0 1 6.422-3.62v-1.2A2.061 2.061 0 0 1 12.61 4.2a1.986 1.986 0 0 1 2.104.23l5.491 4.308a2.11 2.11 0 0 1 .588 2.566 2.109 2.109 0 0 1-.588.734l-5.489 4.308a1.983 1.983 0 0 1-2.104.228 2.065 2.065 0 0 1-1.16-1.876v-.942c-5.33 1.284-6.212 5.251-6.25 5.441a1 1 0 0 1-.923.806h-.06a1.003 1.003 0 0 1-.955-.7A10.221 10.221 0 0 1 5.027 10.9Z"/>
          </svg>
        </button>

        <div className='col-9'>
          <SettingsDrawer />
        </div>
      </div>
    </>
  );
}
