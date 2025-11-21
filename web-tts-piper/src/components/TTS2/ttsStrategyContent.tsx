'use client';

import { PlayerState, TextToBeSpoken, ttsStrategies, TTSStrategy } from "../TextToSpeech/state";

import store from './store'
import { useSelector } from "@xstate/store/react";

import classnames from "@/util/classnames";
import TTSClientStrategy from "./ttsClientStrategy";


export default function TTSStrategyContent({} : {}) {
  const ttsStrategy: TTSStrategy = useSelector(store, (state) => state.context.ttsStrategy);

  let startComp = <p>No strategy selected</p>

  if (ttsStrategy === ttsStrategies.Client) {
    startComp = <TTSClientStrategy />;
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
                onClick={ () => store.send({type: "changeStrategy", strategy: ttsStrategies.Client}) }
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
                onClick={ () => store.send({type: "changeStrategy", strategy: ttsStrategies.ServerPiper}) }
              >Server</a>
          </li>
      </ul>

      <div
        // className="col-span-4 p-6 bg-gray-50 text-medium text-gray-500 dark:text-gray-400 dark:bg-gray-800 rounded-lg"
        className="p-2"
      >
        {startComp}
      </div>
    </section>
  );
}
