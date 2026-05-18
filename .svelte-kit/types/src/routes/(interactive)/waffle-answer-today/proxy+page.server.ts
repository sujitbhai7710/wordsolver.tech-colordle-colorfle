// @ts-nocheck
import { getWaffleDataForDate } from '$lib/waffle';
import { subDays, addDays, startOfDay, isBefore } from 'date-fns';
import { format } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

export const load = async ({ setHeaders }: Parameters<PageServerLoad>[0]) => {
    const today = getPuzzleDateForGame('waffle');
    const data = await getWaffleDataForDate(today);

    if (!data) {
        const formattedDate = format(today, 'MMMM d, yyyy');
        return {
            error: true,
            formattedDate,
            meta: {
                title: `Waffle Answer Today (${formattedDate}) - Grid Solution and Hints`,
                description: `Get Waffle hints and the confirmed Waffle answer for today, ${formattedDate}.`,
                keywords: `waffle answer today, waffle answer, waffle hint, waffle hint today, waffle answer for ${formattedDate}`
            },
            schemas: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: `Waffle Hints and Answer for Today (${formattedDate})`,
                description: `Get Waffle hints and the confirmed Waffle answer for today, ${formattedDate}.`,
                url: 'https://wordsolverx.com/waffle-answer-today'
            })
        };
    }

    const { formattedDate, puzzle, solution, words, definitions, number } = data;
    setHeaders({
        'X-Puzzle-Date': data.date.toISOString().split('T')[0]
    });
    const prevDate = subDays(data.date, 1);
    const nextDate = addDays(data.date, 1);

    const formatArchiveHref = (d: Date) => `/waffle-archive?date=${d.toISOString().split('T')[0]}`;
    const prevSlug = formatArchiveHref(prevDate);
    const nextSlug = formatArchiveHref(nextDate);
    const showNext = isBefore(startOfDay(nextDate), addDays(startOfDay(today), 1));

    const pageTitle = `Waffle Answer Today (${formattedDate}) - Grid Solution and Hints`;
    const pageDescription = `Get Waffle hints and the confirmed Waffle answer for today, ${formattedDate}. View the solved grid, complete word list, and definitions for puzzle #${number}.`;
    const pageKeywords = `waffle answer today, waffle answer, waffle hint, waffle hint today, waffle answer for ${formattedDate}`;
    const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: pageTitle, description: pageDescription, datePublished: new Date(today).toISOString(), author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' } });

    return {
        error: false,
        formattedDate, puzzle, solution, words, definitions, number,
        prevSlug, nextSlug, showNext, date: data.date,
        dateKey: data.date.toISOString().split('T')[0],
        schemas: jsonLd,
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
        },
    };
};

