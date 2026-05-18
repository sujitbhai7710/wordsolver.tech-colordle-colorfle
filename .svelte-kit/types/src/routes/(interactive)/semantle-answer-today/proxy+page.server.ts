// @ts-nocheck
import { getTodaySemantleData, getSemantleDataForDate } from '$lib/semantle';
import { format, subDays } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { fetchDatamuseClues } from '$lib/datamuse';
import type { PageServerLoad } from './$types';

export const load = async ({ fetch }: Parameters<PageServerLoad>[0]) => {
    const today = getPuzzleDateForGame('semantle');
    const dateKey = format(today, 'yyyy-MM-dd');
    const data = getTodaySemantleData();

    if (!data) {
        return { error: true };
    }

    const { word, puzzleNumber, formattedDate } = data;
    const clues = await fetchDatamuseClues(word, fetch);

    const last10Days = Array.from({ length: 10 }, (_, i) => {
        const date = subDays(today, i + 1);
        return getSemantleDataForDate(date);
    }).filter(Boolean);
    const pageTitle = `Semantle Answer Today (${formattedDate}) - Word and Clue Breakdown`;
    const pageDescription = `Get Semantle hints and the confirmed Semantle answer for today, ${formattedDate}. Today's secret word is ${word} and this is puzzle #${puzzleNumber}.`;
    const pageKeywords = `semantle answer today, semantle answer, semantle hint, semantle hint today, semantle answer for ${formattedDate}`;

    const faqItems = [
        { '@type': 'Question', name: `What is the Semantle answer for today, ${formattedDate}?`, acceptedAnswer: { '@type': 'Answer', text: `The Semantle answer for today, ${formattedDate}, is "${word}". Puzzle #${puzzleNumber}.` } },
        { '@type': 'Question', name: 'What is Semantle?', acceptedAnswer: { '@type': 'Answer', text: 'Semantle is a word-guessing game based on semantic similarity.' } },
        ...last10Days.map(d => ({ '@type': 'Question', name: `What was the Semantle answer for ${d!.formattedDate}?`, acceptedAnswer: { '@type': 'Answer', text: `The answer was "${d!.word}" (Puzzle #${d!.puzzleNumber}).` } })),
    ];

    const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'FAQPage', mainEntity: faqItems }, { '@type': 'Article', headline: pageTitle, description: pageDescription, datePublished: new Date(formattedDate).toISOString(), author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' } }] });

    return { word, puzzleNumber, formattedDate, dateKey, last10Days, clues, schemas: jsonLd, meta: { title: pageTitle, description: pageDescription, keywords: pageKeywords } };
};

