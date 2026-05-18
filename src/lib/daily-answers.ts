// Daily answer generation for build time
import { getColordleDailyAnswer, getColordleDayNumber } from './colordle.js';
import { buildColorfleAnswerPayload, getPuzzleAnswer } from './colorfle.js';
import { rgbToHex } from './color-utils.js';

export interface DailyAnswers {
  date: string;
  colordle: {
    colorName: string;
    hex: string;
    dayNumber: number;
  };
  colorfle: {
    colorIndices: number[];
    colorNames: string[];
    colorHexes: string[];
    targetHex: string;
    weights: number[];
    puzzleNumber: number;
  };
}

export function generateDailyAnswers(date: Date = new Date()): DailyAnswers {
  const colordleAnswer = getColordleDailyAnswer(date);
  const colorflePayload = buildColorfleAnswerPayload(date, 0);
  const colorfleAnswer = getPuzzleAnswer(date, 0);

  return {
    date: date.toISOString().slice(0, 10),
    colordle: {
      colorName: colordleAnswer.name,
      hex: colordleAnswer.hex,
      dayNumber: getColordleDayNumber(date),
    },
    colorfle: {
      colorIndices: colorfleAnswer.colors,
      colorNames: colorfleAnswer.colorNames,
      colorHexes: colorfleAnswer.colorHexes,
      targetHex: colorfleAnswer.targetHex,
      weights: [0.5, 0.34, 0.16],
      puzzleNumber: colorfleAnswer.puzzleNumber,
    },
  };
}
