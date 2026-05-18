// @ts-nocheck
import type { PageServerLoad } from './$types';
import { fetchTodayContextoAnswer, type ContextoAnswerPayload } from '$lib/contexto-api';
import { formatContextoDate, getContextoTodayDate } from '$lib/contexto';

export const load = async ({ setHeaders }: Parameters<PageServerLoad>[0]) => {
  try {
    const latestAnswer = await fetchTodayContextoAnswer();

    setHeaders({
      'X-Puzzle-Date': latestAnswer.date
    });

    return {
      initialAnswer: latestAnswer,
      latestDate: latestAnswer.date,
      error: null
    };
  } catch (error) {
    console.error('Contexto load error:', error);

    const fallbackDate = formatContextoDate(getContextoTodayDate());
    return {
      initialAnswer: null as ContextoAnswerPayload | null,
      latestDate: fallbackDate,
      error: 'Failed to load Contexto answer'
    };
  }
};
