// @ts-nocheck
import type { PageServerLoad } from './$types';
import { loadGameDleToday, type GameDleAnswer } from '$lib/game-dle/today';

interface ParsedContent {
    champion_name?: string;
}

function parseContent(jsonContent: string): ParsedContent {
    try {
        return JSON.parse(jsonContent) as ParsedContent;
    } catch {
        return {};
    }
}

function formatSeoDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
}

export const load = async ({ fetch, setHeaders }: Parameters<PageServerLoad>[0]) => {
    const result = await loadGameDleToday({
        fetchFn: fetch,
        setHeaders,
        game: 'smashdle',
        gameTitle: 'Smashdle'
    });

    if (result.error) {
        return result;
    }

    const answers = result.answers as GameDleAnswer[];
    const latestDate = result.latestDate;
    const dateStr = result.dateStr;
    try {
        const seoDate = formatSeoDate(latestDate);
        const featuredImage = 'https://wordsolverx.com/images/smashdle-answer-today.webp';
        const uniqueNames = Array.from(new Set(
            answers
                .map((answer) => parseContent(answer.json_content).champion_name?.trim())
                .filter((name): name is string => Boolean(name))
        ));
        const answerSummary = uniqueNames.slice(0, 4).join(', ');
        const pageTitle = seoDate
            ? `Smashdle Hints and Answers for Today (${seoDate})`
            : 'Smashdle Hints and Answers for Today';
        const pageDescription = seoDate
            ? `Get Smashdle hints and the confirmed Smashdle answers for today, ${seoDate}. Check the classic, emoji, silhouette, Final Smash, and Kirby answers across all available regions${answerSummary ? `, including ${answerSummary}` : ''}.`
            : 'Get Smashdle hints and the confirmed Smashdle answers for today across every available mode and region.';
        const pageKeywords = seoDate
            ? `smashdle answer today, smashdle answer, smashdle hint, smashdle hint today, smashdle answer for ${seoDate}`
            : 'smashdle answer today, smashdle answer, smashdle hint, smashdle hint today';
        const faqItems = [
            {
                '@type': 'Question',
                name: seoDate ? `What are the Smashdle answers for today, ${seoDate}?` : 'What are the Smashdle answers for today?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: answerSummary
                        ? `Today's Smashdle answers include ${answerSummary}. Check each mode and region card for the full set of verified solutions.`
                        : 'Check each mode and region card for the latest verified Smashdle solutions.'
                }
            },
            {
                '@type': 'Question',
                name: seoDate ? `What are the Smashdle hints for today, ${seoDate}?` : 'What are the Smashdle hints for today?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'This page includes mode-by-mode and region-by-region hints covering Classic, Emoji, Silhouette, Final Smash, and Kirby Copy.'
                }
            },
            {
                '@type': 'Question',
                name: 'When does Smashdle update?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Smashdle typically resets at midnight UTC (00:00 UTC) each day.'
                }
            }
        ];
        const schemas = {
            '@context': 'https://schema.org',
            '@graph': [
                { '@type': 'FAQPage', mainEntity: faqItems },
                {
                    '@type': 'Article',
                    headline: pageTitle,
                    description: pageDescription,
                    image: [featuredImage],
                    mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/smashdle-answer-today' },
                    author: { '@type': 'Organization', name: 'WordSolverX' },
                    publisher: { '@type': 'Organization', name: 'WordSolverX' },
                    ...(latestDate ? { datePublished: `${latestDate}T00:00:00Z`, dateModified: `${latestDate}T00:00:00Z` } : {})
                }
            ]
        };

        return {
            answers,
            dateStr,
            meta: {
                title: pageTitle,
                heading: pageTitle,
                description: pageDescription,
                keywords: pageKeywords,
                featuredImage
            },
            schemas,
            error: null
        };
    } catch (err) {
        console.error('Error fetching Smashdle data:', err);
        setHeaders({ 'X-Edge-Cache-Bypass': '1' });
        return {
            answers: [],
            dateStr: '',
            error: err instanceof Error ? err.message : 'Failed to load Smashdle answers'
        };
    }
};
