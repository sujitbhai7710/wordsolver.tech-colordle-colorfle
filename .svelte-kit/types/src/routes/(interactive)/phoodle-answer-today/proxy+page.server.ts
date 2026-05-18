// @ts-nocheck
import { getPhoodleTodaySummary } from '$lib/phoodle';
import { getPuzzleWindow, parsePuzzleDateKey } from '$lib/puzzle-window';
import { format } from 'date-fns';
import type { PageServerLoad } from './$types';

export const load = async ({ setHeaders }: Parameters<PageServerLoad>[0]) => {
    const summary = await getPhoodleTodaySummary(10);
    const data = summary.current;

    if (!data) {
        return {
            error: true,
            formattedDate: format(parsePuzzleDateKey(getPuzzleWindow('phoodle').effectivePuzzleDate), 'MMMM d, yyyy')
        };
    }

    const { word, description, recipe_name, formattedDate } = data;
    const upperWord = word.toUpperCase();

    setHeaders({
        'X-Puzzle-Date': data.date.toISOString().split('T')[0]
    });

    const last10Days = summary.recent;
    const pageTitle = `Phoodle Answer Today (${formattedDate}) - Food Word and Hints`;
    const pageDescription = `Get Phoodle hints and the confirmed Phoodle answer for today, ${formattedDate}. Today's food word is ${upperWord}, with recent answers and recipe context.`;
    const pageKeywords = `phoodle answer today, phoodle answer, phoodle hint, phoodle hint today, phoodle answer for ${formattedDate}`;

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            { '@type': 'Question', name: `What is the Phoodle answer for today, ${formattedDate}?`, acceptedAnswer: { '@type': 'Answer', text: `The Phoodle answer for today, ${formattedDate}, is "${upperWord}".` } },
            { '@type': 'Question', name: 'What is Phoodle?', acceptedAnswer: { '@type': 'Answer', text: 'Phoodle is a daily word puzzle game where players guess a food-related five-letter word in six attempts.' } },
            { '@type': 'Question', name: 'When does the Phoodle puzzle reset?', acceptedAnswer: { '@type': 'Answer', text: 'A new Phoodle puzzle is available every day at midnight JST.' } },
            ...last10Days.map(d => ({ '@type': 'Question', name: `What was the Phoodle answer for ${d!.formattedDate}?`, acceptedAnswer: { '@type': 'Answer', text: `The Phoodle answer for ${d!.formattedDate} was "${d!.word.toUpperCase()}".` } })),
        ],
    };

    return {
        word,
        upperWord,
        description,
        recipe_name,
        formattedDate,
        dateKey: data.date.toISOString().split('T')[0],
        last10Days,
        schemas: JSON.stringify([faqSchema]),
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
        },
    };
};
