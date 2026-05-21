import { fetchTodayBundle } from './answer-source.js';
import { getColordleDailyAnswer, getColordleDayNum } from './colordle.js';
import { buildColorfleAnswerPayload } from './colorfle.js';
import { dateFromDateKey, formatDateKey, formatDisplayDate, getIstDateKey } from './site-date.js';

let hasWarnedAboutFallback = false;
let fallbackTodayBundle = null;

function buildColordleFallback(dateKey) {
  const date = dateFromDateKey(dateKey);
  const answer = getColordleDailyAnswer(date);

  return {
    colorName: answer.name,
    hex: answer.hex,
    dayNum: getColordleDayNum(date),
    formattedDate: formatDisplayDate(date),
    dateKey,
  };
}

function buildColorfleFallback(dateKey) {
  const date = dateFromDateKey(dateKey);
  const answer = buildColorfleAnswerPayload(date, 0);

  return {
    ...answer,
    date: dateKey,
    formattedDate: formatDisplayDate(date),
  };
}

function warnAboutFallback(error) {
  if (hasWarnedAboutFallback) {
    return;
  }

  hasWarnedAboutFallback = true;
  console.warn('Falling back to local daily answer generation because the answer API was unavailable.', error);
}

function normalizeColordleAnswer(answer) {
  return {
    colorName: answer.colorName,
    hex: answer.colorHex,
    dayNum: answer.dayNumber,
    formattedDate: answer.formattedDate,
    dateKey: answer.date,
  };
}

function normalizeColorfleAnswer(answer) {
  return {
    ...answer,
    formattedDate: answer.formattedDate,
    date: answer.date,
  };
}

async function getFallbackTodayBundle() {
  if (!fallbackTodayBundle) {
    const todayDateKey = getIstDateKey();
    fallbackTodayBundle = {
      colordle: buildColordleFallback(todayDateKey),
      colorfle: buildColorfleFallback(todayDateKey),
    };
  }

  return fallbackTodayBundle;
}

export async function getTodayAnswers() {
  try {
    const payload = await fetchTodayBundle();

    if (!payload?.colordle || !payload?.colorfle) {
      throw new Error('Today API response did not include both game payloads.');
    }

    return {
      colordle: normalizeColordleAnswer(payload.colordle),
      colorfle: normalizeColorfleAnswer(payload.colorfle),
    };
  } catch (error) {
    warnAboutFallback(error);
    return getFallbackTodayBundle();
  }
}

export async function getColordleTodayData() {
  const { colordle } = await getTodayAnswers();
  return colordle;
}

export async function getColorfleTodayData() {
  const { colorfle } = await getTodayAnswers();
  return colorfle;
}

export async function getRecentColorfleEntries(days = 7) {
  const todayDateKey = getIstDateKey();
  const todayDate = dateFromDateKey(todayDateKey);

  return Array.from({ length: days }, (_, index) => {
    const entryDate = new Date(todayDate);
    entryDate.setUTCDate(entryDate.getUTCDate() - index);
    return buildColorfleFallback(formatDateKey(entryDate));
  });
}
