// @ts-nocheck
import {
        getColordleTodayPayload,
        type ColordleTodayPayload
} from '$lib/colordle-date';
import { colorDiff, hexToRgb, type RGB } from '$lib/colordle';
import { getColordleDailyArticle } from '$lib/daily-article-content';
import { format } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

interface GuessStep {
        name: string;
        hex: string;
        percent: number;
}

interface GameNarrative {
        difficulty: 'easy' | 'medium' | 'tricky';
        difficultyLabel: string;
        attempts: number;
        guesses: GuessStep[];
}

const OPENING_COLORS = [
        { name: 'red', hex: '#FF0000' },
        { name: 'blue', hex: '#0000FF' },
        { name: 'green', hex: '#008000' },
        { name: 'yellow', hex: '#FFFF00' },
        { name: 'orange', hex: '#FFA500' },
        { name: 'purple', hex: '#800080' },
        { name: 'pink', hex: '#FFC0CB' },
        { name: 'brown', hex: '#A52A2A' },
        { name: 'gray', hex: '#808080' },
        { name: 'teal', hex: '#008080' },
        { name: 'navy', hex: '#000080' },
        { name: 'coral', hex: '#FF7F50' },
        { name: 'gold', hex: '#FFD700' },
        { name: 'silver', hex: '#C0C0C0' },
        { name: 'beige', hex: '#F5F5DC' },
        { name: 'tan', hex: '#D2B48C' },
        { name: 'olive', hex: '#808000' },
        { name: 'maroon', hex: '#800000' },
        { name: 'crimson', hex: '#DC143C' },
        { name: 'indigo', hex: '#4B0082' },
        { name: 'turquoise', hex: '#40E0D0' },
        { name: 'magenta', hex: '#FF00FF' },
        { name: 'lime', hex: '#00FF00' },
        { name: 'cyan', hex: '#00FFFF' },
        { name: 'plum', hex: '#DDA0DD' },
        { name: 'sky blue', hex: '#87CEEB' },
        { name: 'salmon', hex: '#FA8072' },
        { name: 'ivory', hex: '#FFFFF0' },
        { name: 'khaki', hex: '#F0E68C' },
        { name: 'lavender', hex: '#E6E6FA' }
];

const MID_COLORS = [
        { name: 'forest green', hex: '#228B22' },
        { name: 'royal blue', hex: '#4169E1' },
        { name: 'dark red', hex: '#8B0000' },
        { name: 'light green', hex: '#90EE90' },
        { name: 'dark green', hex: '#006400' },
        { name: 'steel blue', hex: '#4682B4' },
        { name: 'dark orange', hex: '#FF8C00' },
        { name: 'light blue', hex: '#ADD8E6' },
        { name: 'deep pink', hex: '#FF1493' },
        { name: 'dark blue', hex: '#00008B' },
        { name: 'pale green', hex: '#98FB98' },
        { name: 'chocolate', hex: '#D2691E' },
        { name: 'sienna', hex: '#A0522D' },
        { name: 'firebrick', hex: '#B22222' },
        { name: 'medium blue', hex: '#0000CD' },
        { name: 'dark slate gray', hex: '#2F4F4F' },
        { name: 'cadet blue', hex: '#5F9EA0' },
        { name: 'slate gray', hex: '#708090' },
        { name: 'medium aquamarine', hex: '#66CDAA' },
        { name: 'light coral', hex: '#F08080' },
        { name: 'rosy brown', hex: '#BC8F8F' },
        { name: 'dark goldenrod', hex: '#B8860B' },
        { name: 'medium purple', hex: '#9370DB' },
        { name: 'medium sea green', hex: '#3CB371' },
        { name: 'dark cyan', hex: '#008B8B' },
        { name: 'saddle brown', hex: '#8B4513' },
        { name: 'slate blue', hex: '#6A5ACD' },
        { name: 'midnight blue', hex: '#191970' },
        { name: 'olive drab', hex: '#6B8E23' },
        { name: 'sea green', hex: '#2E8B57' }
];

const CLOSE_COLORS = [
        { name: 'jade', hex: '#00A86B' },
        { name: 'sage', hex: '#BCB88A' },
        { name: 'smoke', hex: '#738276' },
        { name: 'aqua', hex: '#00FFFF' },
        { name: 'cream', hex: '#FFFDD0' },
        { name: 'sand', hex: '#C2B280' },
        { name: 'wine', hex: '#722F37' },
        { name: 'mahogany', hex: '#C04000' },
        { name: 'chartreuse', hex: '#7FFF00' },
        { name: 'emerald', hex: '#50C878' },
        { name: 'ruby', hex: '#E0115F' },
        { name: 'sapphire', hex: '#0F52BA' },
        { name: 'amber', hex: '#FFBF00' },
        { name: 'copper', hex: '#B87333' },
        { name: 'bronze', hex: '#CD7F32' },
        { name: 'scarlet', hex: '#FF2400' },
        { name: 'navy blue', hex: '#000080' },
        { name: 'hunter green', hex: '#355E3B' },
        { name: 'cherry', hex: '#DE3163' },
        { name: 'cinnamon', hex: '#D2691E' },
        { name: 'mocha', hex: '#967964' },
        { name: 'caramel', hex: '#FFD59A' },
        { name: 'periwinkle', hex: '#CCCCFF' },
        { name: 'cerulean', hex: '#007BA7' },
        { name: 'chestnut', hex: '#954535' },
        { name: 'slate', hex: '#708090' },
        { name: 'marigold', hex: '#EAA221' },
        { name: 'pewter', hex: '#96A8A1' },
        { name: 'moss', hex: '#8A9A5B' },
        { name: 'rust', hex: '#B7410E' }
];

function scoreColorList(
        colors: { name: string; hex: string }[],
        targetRgb: RGB,
        targetName: string
): GuessStep[] {
        return colors
                .filter((g) => g.name.toLowerCase() !== targetName.toLowerCase())
                .map((g) => {
                        const rgb = hexToRgb(g.hex);
                        if (!rgb) return null;
                        return {
                                name: g.name,
                                hex: g.hex,
                                percent: Math.round(colorDiff(targetRgb, rgb) * 100) / 100
                        };
                })
                .filter((g): g is GuessStep => g !== null)
                .sort((a, b) => b.percent - a.percent);
}

function getHueFamily(hex: string): string {
        const rgb = hexToRgb(hex);
        if (!rgb) return 'neutral';
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        if (d < 0.1) {
                return max < 0.3 ? 'dark-neutral' : max > 0.7 ? 'light-neutral' : 'neutral';
        }
        let h = 0;
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h = ((h * 60) + 360) % 360;
        if (h < 30 || h >= 330) return 'red';
        if (h < 70) return 'orange';
        if (h < 90) return 'yellow';
        if (h < 160) return 'green';
        if (h < 200) return 'cyan';
        if (h < 260) return 'blue';
        if (h < 300) return 'purple';
        return 'pink';
}

const CONTRAST_FAMILIES: Record<string, string[]> = {
        red: ['blue', 'cyan', 'green'],
        orange: ['blue', 'cyan', 'purple'],
        yellow: ['blue', 'purple', 'pink'],
        green: ['red', 'pink', 'purple'],
        cyan: ['red', 'orange', 'pink'],
        blue: ['orange', 'yellow', 'red'],
        purple: ['yellow', 'orange', 'green'],
        pink: ['green', 'cyan', 'blue'],
        neutral: ['blue', 'red', 'green'],
        'dark-neutral': ['yellow', 'orange', 'pink'],
        'light-neutral': ['blue', 'purple', 'green']
};

const OPENER_BY_FAMILY: Record<string, { name: string; hex: string }> = {
        red: { name: 'blue', hex: '#0000FF' },
        orange: { name: 'navy', hex: '#000080' },
        yellow: { name: 'purple', hex: '#800080' },
        green: { name: 'crimson', hex: '#DC143C' },
        cyan: { name: 'coral', hex: '#FF7F50' },
        blue: { name: 'orange', hex: '#FFA500' },
        purple: { name: 'gold', hex: '#FFD700' },
        pink: { name: 'teal', hex: '#008080' },
        neutral: { name: 'blue', hex: '#0000FF' },
        'dark-neutral': { name: 'yellow', hex: '#FFFF00' },
        'light-neutral': { name: 'indigo', hex: '#4B0082' }
};

function generateGameNarrative(targetColor: { name: string; hex: string }): GameNarrative {
        const targetRgb = hexToRgb(targetColor.hex);
        if (!targetRgb) {
                return { difficulty: 'medium', difficultyLabel: 'a moderate challenge', attempts: 3, guesses: [] };
        }

        const targetFamily = getHueFamily(targetColor.hex);
        const scoredOpeners = scoreColorList(OPENING_COLORS, targetRgb, targetColor.name);
        const scoredMid = scoreColorList(MID_COLORS, targetRgb, targetColor.name);
        const scoredClose = scoreColorList(CLOSE_COLORS, targetRgb, targetColor.name);

        const guesses: GuessStep[] = [];

        const contrastOpener = OPENER_BY_FAMILY[targetFamily];
        if (contrastOpener) {
                const rgb = hexToRgb(contrastOpener.hex);
                const pct = rgb ? Math.round(colorDiff(targetRgb, rgb) * 100) / 100 : 0;
                guesses.push({ name: contrastOpener.name, hex: contrastOpener.hex, percent: pct });
        } else if (scoredOpeners.length > 0) {
                guesses.push(scoredOpeners[scoredOpeners.length - 1]);
        }

        const secondFamilyOptions = CONTRAST_FAMILIES[targetFamily] ?? ['orange', 'green', 'pink'];
        const secondCandidates = OPENING_COLORS.filter(
                (c) => secondFamilyOptions.includes(getHueFamily(c.hex)) && c.name.toLowerCase() !== targetColor.name.toLowerCase()
        );
        const scoredSecond = scoreColorList(secondCandidates, targetRgb, targetColor.name);
        if (scoredSecond.length > 0) {
                guesses.push(scoredSecond[0]);
        }

        const lastGuessPercent = guesses[guesses.length - 1]?.percent ?? 0;
        const betterMid = scoredMid.find((g) => g.percent > lastGuessPercent + 5);
        if (betterMid) {
                guesses.push(betterMid);
        }

        const midPercent = guesses[guesses.length - 1]?.percent ?? 0;
        const betterClose = scoredClose.find((g) => g.percent > midPercent + 3);
        if (betterClose) {
                guesses.push(betterClose);
        } else if (scoredClose.length > 0 && scoredClose[0].percent > midPercent + 1) {
                guesses.push(scoredClose[0]);
        }

        guesses.push({ name: targetColor.name, hex: targetColor.hex, percent: 100 });

        const seen = new Set<string>();
        const uniqueGuesses = guesses.filter((g) => {
                if (seen.has(g.name.toLowerCase())) return false;
                seen.add(g.name.toLowerCase());
                return true;
        });

        const bestOpenerPercent = scoredOpeners[0]?.percent ?? 0;
        const unusualNames = [
                'cheese', 'smoke', 'night sky', 'tea', 'blood', 'snow', 'hot',
                'snot', 'booger', 'poop', 'slime', 'dirt', 'mud', 'fog', 'haze',
                'dust', 'ash', 'pea', 'pickle', 'cucumber', 'mint', 'toothpaste',
                'bubblegum', 'sunflower', 'fire', 'flame', 'ice', 'ocean', 'rain',
                'storm', 'thunder', 'lightning', 'moon', 'star', 'planet'
        ];
        const isUnusual = unusualNames.includes(targetColor.name.toLowerCase());

        let difficulty: 'easy' | 'medium' | 'tricky';
        let difficultyLabel: string;
        if (isUnusual || bestOpenerPercent < 30) {
                difficulty = 'tricky';
                difficultyLabel = 'on the trickier side';
        } else if (bestOpenerPercent > 55) {
                difficulty = 'easy';
                difficultyLabel = 'pretty straightforward';
        } else {
                difficulty = 'medium';
                difficultyLabel = 'a moderate challenge';
        }

        return {
                difficulty,
                difficultyLabel,
                attempts: uniqueGuesses.length,
                guesses: uniqueGuesses
        };
}

export const load = async ({ fetch, setHeaders }: Parameters<PageServerLoad>[0]) => {
        const today = getPuzzleDateForGame('colordle');
        const requestedFormattedDate = format(today, 'MMMM d, yyyy');
        let todayData: ColordleTodayPayload | null = null;

        try {
                const response = await fetch('/api/colordle/today');
                const payload = (await response.json().catch(() => null)) as
                        | ({ success?: boolean } & Partial<ColordleTodayPayload>)
                        | null;

                if (response.ok && payload?.success && payload.color && payload.formattedDate) {
                        todayData = payload as ColordleTodayPayload;
                        const puzzleDateHeader = response.headers.get('X-Puzzle-Date');
                        if (puzzleDateHeader) {
                                setHeaders({
                                        'X-Puzzle-Date': puzzleDateHeader
                                });
                        }
                }
        } catch (error) {
                console.warn('Colordle today API request failed, using local dataset fallback:', error);
        }

        todayData ??= getColordleTodayPayload(today);

        if (!todayData) {
                return {
                        error: true,
                        color: null,
                        dayNum: null,
                        formattedDate: requestedFormattedDate,
                        requestedFormattedDate,
                        isFallback: false,
                        availableThroughFormattedDate: null,
                        yesterdayData: null,
                        last100Days: [],
                        schemas: null,
                        gameNarrative: null,
                        meta: {
                                title: 'Colordle Answer Today',
                                description: '',
                                keywords: 'colordle answer today, colordle answer, colordle hint, colordle hint today',
                                featuredImage: '/images/colordle-answer-today.webp'
                        }
                };
        }

        const {
                color,
                dayNum,
                formattedDate,
                isFallback,
                availableThroughFormattedDate,
                yesterdayData,
                last100Days,
                actualDateKey
        } = todayData;
        const generatedArticle = getColordleDailyArticle(actualDateKey);

        setHeaders({
                'X-Puzzle-Date': actualDateKey
        });

        const currentMonth = format(today, 'MMMM');
        const pageTitle = `Colordle Answer Today (${formattedDate}) - Daily Color Puzzle Solution & Tips | WordSolver`;
        const pageDescription = `Verified Colordle answer for ${formattedDate} with hex code, scoring breakdown, strategy tips, and a full answer archive. Updated daily by real players.`;
        const pageKeywords = `colordle answer today, colordle color puzzle, daily color solution, colordle hex code, colordle tips, colordle archive`;

        const faqItems = [
                {
                        '@type': 'Question',
                        name: `What is the Colordle answer for today, ${formattedDate}?`,
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: `For ${formattedDate}, the daily color is ${color.name} with hex code ${color.hex}.`
                        }
                },
                {
                        '@type': 'Question',
                        name: 'What was the Colordle answer for yesterday?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: yesterdayData
                                        ? `The previous daily color was ${yesterdayData.color.name} with hex code ${yesterdayData.color.hex} on ${yesterdayData.formattedDate}.`
                                        : 'Yesterday Colordle data is not available right now.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'How do you play Colordle?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'You see a target color and guess a named color. After each guess the game gives you a percentage score showing how close your pick is to the target. You keep guessing until you land on the exact match. There is no guess limit.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'How many guesses do you get in Colordle?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'There is no hard limit on guesses. You can keep trying until you hit 100%. Most players aim to solve it in under six guesses.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'What does the percentage score mean in Colordle?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'The percentage reflects how visually similar your guess is to the target color. It is calculated using the CIEDE2000 color-difference formula in LAB color space. A score of 100 means an exact match.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'When does the new daily color release?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'A new Colordle puzzle is released every day at midnight JST (Japan Standard Time), which is 3 PM GMT or 11 AM Eastern Time.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'What is a hex code?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'A hex code is a 6-character code like #FF5733 representing a specific color. The first 2 characters = red, next 2 = green, last 2 = blue values in the RGB spectrum.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'How can I browse earlier Colordle daily colors?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Use the built-in search on this page to scan recent entries by date, color name, or hex code. For the full calendar view, visit the Colordle archive page.'
                        }
                }
        ];

        const jsonLd = JSON.stringify([
                { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems },
                {
                        '@context': 'https://schema.org',
                        '@type': 'HowTo',
                        name: 'How to Play Colordle',
                        description: 'Step-by-step guide for the daily color guessing game Colordle.',
                        step: [
                                { '@type': 'HowToStep', position: 1, text: 'Visit colordle.ryantanen.com and look at the target color on screen.' },
                                { '@type': 'HowToStep', position: 2, text: 'Type a color name as your first guess. Start with something broad like "blue" or "red" to gauge direction.' },
                                { '@type': 'HowToStep', position: 3, text: 'Review the percentage feedback. A higher score means your guess is perceptually closer to the target.' },
                                { '@type': 'HowToStep', position: 4, text: 'Adjust one property at a time — brightness, hue family, or warmth — based on the feedback.' },
                                { '@type': 'HowToStep', position: 5, text: 'Continue refining with more specific names until you reach a 100% match.' }
                        ]
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wordsolverx.com' },
                                { '@type': 'ListItem', position: 2, name: 'Game Answers', item: 'https://wordsolverx.com/game-answers' },
                                { '@type': 'ListItem', position: 3, name: 'Colordle Answer Today', item: 'https://wordsolverx.com/colordle-answer-today' }
                        ]
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: pageTitle,
                        datePublished: `${todayData.actualDateKey}T00:00:00.000Z`,
                        dateModified: today.toISOString(),
                        author: {
                                '@type': 'Person',
                                name: 'Preston Hayes',
                                image: 'https://wordsolverx.com/author-wordsolverx.webp',
                                url: 'https://wordsolverx.com/about#preston-hayes'
                        },
                        publisher: { '@type': 'Organization', name: 'WordSolverX' },
                        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/colordle-answer-today' },
                        description: pageDescription,
                        image: ['/colordle-answer-today.webp']
                }
        ]);

        return {
                error: false,
                color,
                dayNum,
                formattedDate,
                requestedFormattedDate,
                isFallback,
                availableThroughFormattedDate,
                yesterdayData,
                last100Days,
                publishedDate: `${actualDateKey}T00:00:00Z`,
                schemas: jsonLd,
                gameNarrative: generateGameNarrative(color),
                generatedArticle,
                meta: {
                        title: pageTitle,
                        description: pageDescription,
                        keywords: pageKeywords,
                        featuredImage: '/images/colordle-answer-today.webp'
                }
        };
};

