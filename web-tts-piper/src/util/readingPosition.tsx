import { type Paragraphs } from '../components/TextToSpeech/state';
import { type Result, Ok, Err } from './resultType'

interface ReadingIndex {
  paragraphIndex: number;
  sentenceIndex: number;
}

// export interface ReadingPositionError {
//   error: "InvalidIndex" | "EndOfContent" | "StartOfContent";
// }
// class StartOfContentError extends Error { /* ... */ }
// class EndOfContentError extends Error { /* ... */ }
// class InvalidIndexError extends Error { /* ... */ }
type StartOfContentError = { errorType: "StartOfContent"; message?: string };
type EndOfContentError = { errorType: "EndOfContent"; message?: string };
type InvalidIndexError = { errorType: "InvalidIndex"; index: ReadingIndex; message?: string };

type ReadingPositionError = StartOfContentError | EndOfContentError | InvalidIndexError;


// usage:
//
//   const result = getNextIndex(paragraphs, { paragraphIndex: 2, sentenceIndex: 1 });
//
//   if ("nextIndex" in result) {
//     console.log("Next index:", result.nextIndex);
//   } else {
//     console.error("Error:", result.error);
//   }
export function nextReadingPosition(paragraphs: Paragraphs, current: ReadingIndex): Result<ReadingIndex, ReadingPositionError> {
  const { paragraphIndex, sentenceIndex } = current;

  if (
    paragraphIndex < 0 || paragraphIndex >= paragraphs.length ||
    sentenceIndex < 0 || sentenceIndex >= paragraphs[paragraphIndex].length
  ) {
    return new Err({ errorType: "InvalidIndex", index: current});
  }

  const currentParagraph = paragraphs[paragraphIndex];

  // next sentence exists
  if (sentenceIndex + 1 < currentParagraph.length) {
    return new Ok({
      paragraphIndex,
      sentenceIndex: sentenceIndex + 1,
    });
  }

  for (let i = paragraphIndex + 1; i < paragraphs.length; i++) {
    if (paragraphs[i].length > 0) {
      return new Ok({
        paragraphIndex: i,
        sentenceIndex: 0,
      });
    }
  }

  return new Err({ errorType: "EndOfContent"});
}

export function previousReadingPosition(paragraphs: Paragraphs, current: ReadingIndex): Result<ReadingIndex, ReadingPositionError> {
  const { paragraphIndex, sentenceIndex } = current;

  if (
    paragraphIndex < 0 ||
    paragraphIndex >= paragraphs.length ||
    sentenceIndex < 0 ||
    sentenceIndex >= paragraphs[paragraphIndex].length
  ) {
    return new Err({ errorType: "InvalidIndex", index: current });
  }

  // Case 1: Previous sentence exists in current paragraph
  if (sentenceIndex > 0) {
    return new Ok({
      paragraphIndex,
      sentenceIndex: sentenceIndex - 1,
    });
  }

  // Case 2: Move to last sentence of previous non-empty paragraph
  for (let i = paragraphIndex - 1; i >= 0; i--) {
    if (paragraphs[i].length > 0) {
      return new Ok({
        paragraphIndex: i,
        sentenceIndex: paragraphs[i].length - 1,
      });
    }
  }

  // Case 3: No previous sentence found
  return new Err({ errorType: "StartOfContent" });
}
