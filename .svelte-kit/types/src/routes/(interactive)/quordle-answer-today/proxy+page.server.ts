// @ts-nocheck
import { getQuordleToday, getQuordleDataForDate } from '$lib/quordle';
import { generateBreadcrumbSchema, generatePersonAuthorSchema } from '$lib/seo';
import { format, subDays } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

export const load = async () => {
    const today = getPuzzleDateForGame('quordle');
    const formattedDate = format(today, 'MMMM d, yyyy');
    const dateKey = format(today, 'yyyy-MM-dd');
    const todayData = getQuordleToday();
    const quordleData = getQuordleDataForDate(today);
    const todayWords = todayData ? todayData.d.join(', ').replace(/, ([^,]*)$/, ', and $1') : '';

    const last10Days = Array.from({ length: 10 }, (_, i) => {
        const date = subDays(today, i + 1);
        return getQuordleDataForDate(date);
    }).filter(Boolean);
    const pageTitle = `Quordle Answer Today (${formattedDate}) - All Modes and Answers`;
    const pageDescription = `Get Quordle hints and the confirmed Quordle answers for today, ${formattedDate}. Check Classic, Chill, Extreme, Sequence, Rescue, and Weekly solutions in one place.`;
    const pageKeywords = `quordle answer today, quordle answer, quordle hint, quordle hint today, quordle answer for ${formattedDate}`;

    const faqItems = [
        { '@type': 'Question', name: `What is the Quordle answer for today, ${formattedDate}?`, acceptedAnswer: { '@type': 'Answer', text: `The Quordle answer for today, ${formattedDate}, is ${todayWords}.` } },
        { '@type': 'Question', name: `How many vowels are in today's Quordle words for ${formattedDate}?`, acceptedAnswer: { '@type': 'Answer', text: `The Quordle words for today contain multiple vowels. Check the hints section for exact counts.` } },
        { '@type': 'Question', name: 'When does Quordle reset?', acceptedAnswer: { '@type': 'Answer', text: 'Quordle resets every day at midnight JST for Daily modes. The Weekly puzzle resets every Monday.' } },
        ...last10Days.map(d => ({ '@type': 'Question', name: `What was the Quordle answer for ${d!.formattedDate}?`, acceptedAnswer: { '@type': 'Answer', text: `The Quordle answer for ${d!.formattedDate} was ${d!.d.join(', ').replace(/, ([^,]*)$/, ', and $1')}.` } })),
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            { '@type': 'FAQPage', mainEntity: faqItems },
            {
                '@type': 'Article',
                headline: pageTitle,
                datePublished: new Date(today).toISOString(),
                dateModified: new Date(today).toISOString(),
                author: generatePersonAuthorSchema('Preston Hayes', 'https://wordsolverx.com/about#preston-hayes', 'https://wordsolverx.com/author-wordsolverx.webp'),
                publisher: { '@type': 'Organization', name: 'WordSolverX' },
                description: pageDescription,
                mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/quordle-answer-today' },
            },
            generateBreadcrumbSchema([
                { name: 'Home', url: 'https://wordsolverx.com' },
                { name: 'Today', url: 'https://wordsolverx.com/today' },
                { name: 'Quordle Answer Today', url: 'https://wordsolverx.com/quordle-answer-today' },
            ]),
        ],
    };

    return {
        today,
        formattedDate,
        dateKey,
        todayData,
        quordleData,
        todayWords,
        last10Days,
        publishedDate: `${dateKey}T00:00:00Z`,
        schemas: JSON.stringify(jsonLd),
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
        },
    };
};

;null as any as PageServerLoad;