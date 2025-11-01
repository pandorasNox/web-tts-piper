import { describe, it, expect } from "vitest";
import { type Paragraphs } from '../components/TextToSpeech/state';
import {Result, Ok, Err} from './resultType'
import { nextReadingPosition, previousReadingPosition } from "./readingPosition.jsx";

describe("getNextIndex", () => {
  const paragraphs: Paragraphs = [
    ["A", "B"],
    [],
    ["C"],
    ["D", "E", "F"],
  ];

  it("returns next sentence in same paragraph", () => {
    const result = nextReadingPosition(paragraphs, { paragraphIndex: 0, sentenceIndex: 0 });
    expect(result).toEqual(new Ok({ paragraphIndex: 0, sentenceIndex: 1 }));
  });

  it("skips empty paragraph and goes to next non-empty", () => {
    const result = nextReadingPosition(paragraphs, { paragraphIndex: 0, sentenceIndex: 1 });
    expect(result).toEqual(new Ok({ paragraphIndex: 2, sentenceIndex: 0 }));
  });

  it("navigates to next paragraph correctly", () => {
    const result = nextReadingPosition(paragraphs, { paragraphIndex: 2, sentenceIndex: 0 });
    expect(result).toEqual(new Ok({ paragraphIndex: 3, sentenceIndex: 0 }));
  });

  it("returns EndOfContent at last sentence", () => {
    const result = nextReadingPosition(paragraphs, { paragraphIndex: 3, sentenceIndex: 2 });
    expect(result).toEqual(new Err({ errorType: "EndOfContent" }));
  });

  it("returns InvalidIndex for out-of-bounds input", () => {
    const result = nextReadingPosition(paragraphs, { paragraphIndex: 5, sentenceIndex: 0 });
    expect(result).toEqual(new Err({ errorType: "InvalidIndex", index: { paragraphIndex: 5, sentenceIndex: 0 }}));
  });
});

// describe("getNextIndex edge case", () => {
//   const paragraphs: Paragraphs = [
//     ["", ""],
//     [""],
//     ["C"],
//     ["D", "E", "F"],
//   ];

//   it("returns next sentence in same paragraph", () => {
//     const result = nextReadingPosition(paragraphs, { paragraphIndex: 0, sentenceIndex: 0 });
//     expect(result).toEqual(new Ok({ paragraphIndex: 2, sentenceIndex: 0 }));
//   });
// });

describe("getPreviousIndex", () => {
  const paragraphs: Paragraphs = [
    ["A", "B"],
    [],
    ["C"],
    ["D", "E", "F"],
  ];

  it("returns previous sentence in same paragraph", () => {
    const result = previousReadingPosition(paragraphs, { paragraphIndex: 3, sentenceIndex: 2 });
    expect(result).toEqual(new Ok({ paragraphIndex: 3, sentenceIndex: 1 }));
  });

  it("skips empty paragraph and goes to last sentence of previous non-empty", () => {
    const result = previousReadingPosition(paragraphs, { paragraphIndex: 2, sentenceIndex: 0 });
    expect(result).toEqual(new Ok({ paragraphIndex: 0, sentenceIndex: 1 }));
  });

  it("navigates to previous paragraph correctly", () => {
    const result = previousReadingPosition(paragraphs, { paragraphIndex: 3, sentenceIndex: 0 });
    expect(result).toEqual(new Ok({ paragraphIndex: 2, sentenceIndex: 0 }));
  });

  it("returns StartOfContent at very beginning", () => {
    const result = previousReadingPosition(paragraphs, { paragraphIndex: 0, sentenceIndex: 0 });
    expect(result).toEqual(new Err({ errorType: "StartOfContent" }));
  });

  it("returns InvalidIndex for out-of-bounds input", () => {
    const result = previousReadingPosition(paragraphs, { paragraphIndex: -1, sentenceIndex: 0 });
    expect(result).toEqual(new Err({ errorType: "InvalidIndex", index: { paragraphIndex: -1, sentenceIndex: 0 }}));
  });
});

describe("Edge cases for getNextIndex and getPreviousIndex", () => {
  it("handles empty document", () => {
    const empty: Paragraphs = [];
    expect(nextReadingPosition(empty, { paragraphIndex: 0, sentenceIndex: 0 })).toEqual(new Err({ errorType: "InvalidIndex", index: { paragraphIndex: 0, sentenceIndex: 0 }}));
    expect(previousReadingPosition(empty, { paragraphIndex: 0, sentenceIndex: 0 })).toEqual(new Err({ errorType: "InvalidIndex", index: { paragraphIndex: 0, sentenceIndex: 0 }}));
  });

  it("handles single-sentence paragraph", () => {
    const single: Paragraphs = [["Only"]];
    expect(nextReadingPosition(single, { paragraphIndex: 0, sentenceIndex: 0 })).toEqual(new Err({ errorType: "EndOfContent" }));
    expect(previousReadingPosition(single, { paragraphIndex: 0, sentenceIndex: 0 })).toEqual(new Err({ errorType: "StartOfContent" }));
  });

  it("skips multiple empty paragraphs", () => {
    const sparse: Paragraphs = [["A"], [], [], ["B"]];
    expect(nextReadingPosition(sparse, { paragraphIndex: 0, sentenceIndex: 0 })).toEqual(new Ok({ paragraphIndex: 3, sentenceIndex: 0 }));
    expect(previousReadingPosition(sparse, { paragraphIndex: 3, sentenceIndex: 0 })).toEqual(new Ok({ paragraphIndex: 0, sentenceIndex: 0 }));
  });

  it("handles paragraph with empty array and valid index", () => {
    const weird: Paragraphs = [[], ["X"]];
    expect(nextReadingPosition(weird, { paragraphIndex: 1, sentenceIndex: 0 })).toEqual(new Err({ errorType: "EndOfContent" }));
    expect(previousReadingPosition(weird, { paragraphIndex: 1, sentenceIndex: 0 })).toEqual(new Err({ errorType: "StartOfContent" }));
  });
});
