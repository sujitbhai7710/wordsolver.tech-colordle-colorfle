// @ts-nocheck
import { getGlobleDataForDate } from '$lib/globle-date';
import { format, subDays } from 'date-fns';
import { redirect } from '@sveltejs/kit';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

export const load = async () => {
    const today = getPuzzleDateForGame('globle');
    const data = await getLatestAvailableGlobleData(today);

    if (!data) {
        throw redirect(302, '/globle-archive');
    }

    const { country, formattedDate, date } = data;
    const dateKey = date instanceof Date ? format(date, 'yyyy-MM-dd') : String(date).split('T')[0];
    const featuredImage = 'https://wordsolverx.com/images/globle-answer-today.webp';
    const pageTitle = `Globle Answer Today (${formattedDate}) - Country Answer and Hints`;
    const pageDescription = `Today's Globle country revealed — ${formattedDate}. Use the color feedback, continent, subregion, and flag hints to narrow it down, or check the answer directly.`;
    const pageKeywords = `globle answer today, globle answer, globle hint, globle hint today, globle answer for ${formattedDate}`;
    const faqItems = [
        { '@type': 'Question', name: `What is the Globle answer for ${formattedDate}?`, acceptedAnswer: { '@type': 'Answer', text: `The Globle answer for ${formattedDate} is ${country.name}.` } },
        { '@type': 'Question', name: `What are the Globle hints for ${formattedDate}?`, acceptedAnswer: { '@type': 'Answer', text: `The Globle hints include the country flag, continent, subregion, and map-distance clues that lead to ${country.name}.` } },
        { '@type': 'Question', name: 'When does the Globle answer update?', acceptedAnswer: { '@type': 'Answer', text: 'This page updates on the Tokyo/JST day boundary at midnight JST.' } }
    ];

    const jsonLd = JSON.stringify([
        { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems },
        {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: pageTitle,
            datePublished: new Date(date).toISOString(),
            dateModified: new Date(date).toISOString(),
            author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' },
            publisher: { '@type': 'Organization', name: 'WordSolverX' },
            description: pageDescription,
            image: [featuredImage],
            mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/globle-answer-today' }
        }
    ]);

    return {
        country,
        formattedDate,
        dateKey,
        schemas: jsonLd,
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
            featuredImage
        }
    };
};

async function getLatestAvailableGlobleData(baseDate: Date) {
    for (let offset = 0; offset < 7; offset += 1) {
        const candidate = subDays(baseDate, offset);
        const data = await getGlobleDataForDate(candidate);
        if (data) {
            return data;
        }
    }

    return null;
}

;null as any as PageServerLoad;