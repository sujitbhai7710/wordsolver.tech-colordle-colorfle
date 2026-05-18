// @ts-nocheck
import type { PageServerLoad } from './$types';
import {
        getNerdleAllModeAnswerForDate,
        type NerdleAllModeAnswerData,
        type NerdleAnswerFetchOptions
} from '$lib/nerdle-answers';
import { getPuzzleWindow } from '$lib/puzzle-window';

function formatDateLabel(dateKey: string): string {
        const date = new Date(`${dateKey}T00:00:00Z`);
        if (Number.isNaN(date.getTime())) {
                return dateKey;
        }

        return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Asia/Tokyo'
        });
}

export const load = async ({ setHeaders, platform, fetch }: Parameters<PageServerLoad>[0]) => {
        const fetchOptions: NerdleAnswerFetchOptions = {
                platform,
                fetchImpl: fetch
        };
        const fallbackDate = getPuzzleWindow('nerdle').effectivePuzzleDate;
        const answerData =
                (await getNerdleAllModeAnswerForDate(fallbackDate, fetchOptions)) ??
                ({
                        date: fallbackDate,
                        classicPuzzleNumber: Number.NaN,
                        modes: []
                } satisfies NerdleAllModeAnswerData);
        const formattedDate = formatDateLabel(answerData.date);
        const hasValidTodayData =
                Number.isFinite(answerData.classicPuzzleNumber) &&
                Array.isArray(answerData.modes) &&
                answerData.modes.length > 0;
        const fallbackCacheTtlSeconds = 60;

        setHeaders({
                'X-Puzzle-Date': answerData.date,
                'X-Edge-Cache-Bypass': '0',
                ...(hasValidTodayData ? {} : { 'X-Edge-Cache-TTL': String(fallbackCacheTtlSeconds) }),
                'Cache-Control': hasValidTodayData
                        ? 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600'
                        : `public, max-age=0, s-maxage=${fallbackCacheTtlSeconds}, stale-while-revalidate=300`
        });

        const pageTitle = `Nerdle Answer Today (${formattedDate}) - All Modes and Hints`;
        const pageDescription = `Get all Nerdle answers for ${formattedDate}: Classic, Micro, Mini, Midi, Maxi, Mini Bi, Quad, Speed, and Instant.`;
        const faqItems = [
                {
                        question: `What is the Nerdle classic answer for ${formattedDate}?`,
                        answer:
                                answerData.modes.find((mode) => mode.id === 'classic')?.answers.map((entry) => entry.answer).join(', ') ??
                                'The latest Nerdle classic answer is listed in the Classic section above.'
                },
                {
                        question: 'Does this page include all Nerdle modes?',
                        answer:
                                'Yes. This page lists the current answers for Classic, Micro, Mini, Midi, Maxi, Mini Bi, Quad, Speed, and Instant whenever that mode is available.'
                },
                {
                        question: 'Where can I solve old Nerdle puzzles?',
                        answer:
                                'Use the Nerdle Solver and the Nerdle Archive on WordSolverX to check older dates, mode answers, and puzzle history.'
                }
        ];

        const schemas = JSON.stringify([
                {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: pageTitle,
                        description: pageDescription,
                        datePublished: `${answerData.date}T00:00:00+09:00`,
                        dateModified: `${answerData.date}T00:00:00+09:00`,
                        mainEntityOfPage: 'https://wordsolverx.com/nerdle-answer-today',
                        author: {
                                '@type': 'Person',
                                name: 'Preston Hayes',
                                url: 'https://wordsolverx.com/about#preston-hayes',
                                image: 'https://wordsolverx.com/author-wordsolverx.webp',
                                jobTitle: 'Word Puzzle Analyst',
                                knowsAbout: ['Wordle', 'Word Puzzles', 'Daily Puzzle Answers', 'Puzzle Solver Tools', 'Information Theory'],
                                sameAs: [
                                        'https://www.linkedin.com/in/preston-hayes-wordsolverx/',
                                        'https://x.com/WordSolverX',
                                        'https://www.facebook.com/wordsolverx/',
                                        'https://t.me/wordsolverx'
                                ]
                        },
                        publisher: {
                                '@type': 'Organization',
                                name: 'WordSolverX',
                                logo: {
                                        '@type': 'ImageObject',
                                        url: 'https://wordsolverx.com/images/nerdle-answer-today.webp'
                                }
                        }
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wordsolverx.com' },
                                { '@type': 'ListItem', position: 2, name: 'Today', item: 'https://wordsolverx.com/today' },
                                {
                                        '@type': 'ListItem',
                                        position: 3,
                                        name: 'Nerdle Answer Today',
                                        item: 'https://wordsolverx.com/nerdle-answer-today'
                                }
                        ]
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqItems.map((item) => ({
                                '@type': 'Question',
                                name: item.question,
                                acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: item.answer
                                }
                        }))
                }
        ]);

        return {
                answerData,
                formattedDate,
                faqItems,
                meta: {
                        title: pageTitle,
                        description: pageDescription,
                        keywords: `nerdle answer today, nerdle all modes answer, nerdle classic micro mini midi maxi quad speed instant, nerdle archive, nerdle answer ${formattedDate}`,
                        canonical: 'https://wordsolverx.com/nerdle-answer-today'
                },
                schemas
        };
};
