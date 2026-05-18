// @ts-nocheck
import type { PageServerLoad } from './$types';

import {
  formatBetweenleDate,
  getBetweenleArchive,
  getBetweenleTodayAnswer,
  parseDateKey,
} from '$lib/betweenle/logic';

export const load = async ({ setHeaders }: Parameters<PageServerLoad>[0]) => {
  const todayAnswer = getBetweenleTodayAnswer();
  const archive = getBetweenleArchive();
  const todaySeoDate = parseDateKey(todayAnswer.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const pageTitle = `Betweenle Answer Today (${todaySeoDate}) - Hints and Answer`;
  const pageDescription = `Check Betweenle hints and reveal the official Betweenle answer for today, ${todaySeoDate}. Includes clue cards, puzzle number, recent previous answers, and quick links to the solver and archive hub.`;
  const pageKeywords = [
    'betweenle answer today',
    'betweenle answer',
    'betweenle hint today',
    'betweenle hints and answer for today',
    'betweenle daily answer',
    `betweenle answer for ${todaySeoDate}`,
    'betweenle solver',
    'betweenle previous answers',
    'betweenle archive',
  ].join(', ');

  setHeaders({
    'X-Puzzle-Date': todayAnswer.date
  });

  return {
    todayAnswer,
    archive,
    todayLabel: formatBetweenleDate(todayAnswer.date),
    todaySeoDate,
    meta: {
      title: pageTitle,
      description: pageDescription,
      keywords: pageKeywords,
      canonical: 'https://wordsolverx.com/betweenle-answer-today',
    },
  };
};
