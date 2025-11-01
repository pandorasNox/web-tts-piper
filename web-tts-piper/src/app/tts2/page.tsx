'use client';

import TTS2 from '../../components/TTS2'

export default function Home() {
  return (
    <div>
        <nav className="pb-6 mb-2 bg-white border-gray-200 dark:bg-gray-900">
          <span>nav:</span>
        </nav>
      <main
        className='w-full'
      >
        <TTS2 />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
