import { getColordleDailyAnswer, getColordleDayNumber } from '../../src/lib/colordle.ts';

export const COLORDLE_START_DATE = new Date('2023-08-07T12:00:00Z');

function dateFromDateKey(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`);
}

export function getColordleAnswer(dateStr: string): {
  date: string;
  dayNumber: number;
  colorName: string;
  colorHex: string;
  formattedDate: string;
} {
  const date = dateFromDateKey(dateStr);
  const answer = getColordleDailyAnswer(date);

  return {
    date: dateStr,
    dayNumber: getColordleDayNumber(date),
    colorName: answer.name,
    colorHex: answer.hex,
    formattedDate: date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }),
  };
}

export function getTodayIST(): string {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs + now.getTimezoneOffset() * 60000);
  return istNow.toISOString().slice(0, 10);
}
