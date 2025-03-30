'use client'

import TextToSpeech from '../../components/TextToSpeech'

export default function Home() {
  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div>
        <nav className="pb-6 mb-2 bg-white border-gray-200 dark:bg-gray-900">
          <span>nav:</span>
        </nav>
      {/* <main className="flex flex-col gap-[16px] row-start-2 items-center sm:items-start"> */}
      <main
        className='w-full'
        // className="flex flex-col gap-[16px] items-center sm:items-start"
      >
        <TextToSpeech />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
