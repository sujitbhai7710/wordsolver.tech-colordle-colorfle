// @ts-nocheck
import type { PageServerLoad } from './$types';
import { format, subDays } from 'date-fns';
import spotleData from '../../../../static/spotle_data.json';
import {
	COUNTRY_NAMES,
	GENDER_NAMES,
	formatSpotleDate,
	parseSpotleDate,
	type SpotleArtist,
	type SpotleAnswer,
	type SpotleData
} from '$lib/spotle';
import { getPuzzleDateForGame } from '$lib/puzzle-window';

interface SpotleDay {
	date: string;
	dayNumber: number;
	artistName: string;
	track: string | null;
	soundcloudUrl: string | null;
	artist: SpotleArtist | null;
}

function getArtistByName(artists: SpotleArtist[], artistName: string | undefined): SpotleArtist | null {
	if (!artistName) {
		return null;
	}

	return artists.find((artist) => artist.artist.toLowerCase() === artistName.toLowerCase()) ?? null;
}

export const load = async ({ setHeaders }: Parameters<PageServerLoad>[0]) => {
	const data = spotleData as SpotleData;
	const artists = data?.artists ?? [];
	const answers = data?.answers ?? [];
	const todayStr = formatSpotleDate(getPuzzleDateForGame('spotle'));
	const activeAnswers = answers
		.filter((entry) => entry.date <= todayStr)
		.sort((a, b) => b.date.localeCompare(a.date));
	const latestAnswer = activeAnswers[0] ?? null;
	const todayAnswer = answers.find((entry) => entry.date === todayStr) ?? latestAnswer;
	const displayDate = todayAnswer?.date ?? todayStr;
	const displayDateObject = parseSpotleDate(displayDate);
	const todayArtist = getArtistByName(artists, todayAnswer?.artist);

	setHeaders({
		'X-Puzzle-Date': displayDate,
		...(!todayAnswer || !todayArtist ? { 'X-Edge-Cache-Bypass': '1' } : {})
	});

	const last30Days: SpotleDay[] = [];
	for (let i = 0; i < 30; i += 1) {
		const date = subDays(displayDateObject, i);
		const dateStr = formatSpotleDate(date);
		const answer = answers.find((entry) => entry.date === dateStr);
		if (!answer) {
			continue;
		}

		last30Days.push({
			date: dateStr,
			dayNumber: answer.dayNumber,
			artistName: answer.artist,
			track: answer.track ?? null,
			soundcloudUrl: answer.soundcloudUrl ?? null,
			artist: getArtistByName(artists, answer.artist)
		});
	}

	const faqItems = [
		{
			question: `What is the Spotle answer for ${format(displayDateObject, 'MMMM d, yyyy')}?`,
			answer: todayAnswer
				? `The Spotle answer for ${format(displayDateObject, 'MMMM d, yyyy')} is ${todayAnswer.artist}. This is Day #${todayAnswer.dayNumber}.`
			: `The Spotle answer for ${format(displayDateObject, 'MMMM d, yyyy')} has not been posted yet.`
		},
		{
			question: 'Where can I check older Spotle answers?',
			answer:
				'Open the Spotle archive page to browse older artist answers by date with the same profile details shown on this page.'
		},
		{
			question: 'Does this page show extra Spotle info besides the artist?',
			answer:
				'Yes. When the source provides it, this page also shows the featured track, SoundCloud link, rank, country, genre, debut year, and group details.'
		}
	];

	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqItems.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer }
		}))
	};

	const todayFormatted = format(displayDateObject, 'MMMM d, yyyy');
	const metaTitle = `Spotle Answer Today (${todayFormatted}) - Artist Answer and Clues`;
	const metaDescription =
		`Get the Spotle answer for ${todayFormatted}${todayArtist ? `, including artist details for ${todayArtist.artist}` : ''}${todayAnswer?.track ? ` and the featured track ${todayAnswer.track}` : ''}.`;
	const metaKeywords =
		`spotle answer today, spotle answer, spotle archive, spotle artist today, spotle hints ${todayFormatted}`;

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://wordsolverx.com'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Today',
				item: 'https://wordsolverx.com/today'
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: 'Spotle Answer Today',
				item: 'https://wordsolverx.com/spotle-answer-today'
			}
		]
	};

	const webPageSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: metaTitle,
		description: metaDescription,
		url: 'https://wordsolverx.com/spotle-answer-today',
		inLanguage: 'en',
		isPartOf: {
			'@type': 'WebSite',
			name: 'WordSolverX',
			url: 'https://wordsolverx.com'
		}
	};

	return {
		todayStr,
		todayFormatted,
		todayAnswer: todayAnswer as SpotleAnswer | null,
		todayArtist,
		artists,
		answers: activeAnswers,
		last30Days,
		faqItems,
		schemaJson: JSON.stringify([webPageSchema, breadcrumbSchema, faqSchema]),
		meta: {
			title: metaTitle,
			description: metaDescription,
			keywords: metaKeywords
		},
		stats: {
			totalArtists: artists.length,
			totalAnswers: activeAnswers.length,
			lastSyncedAt: data?.metadata?.lastSyncedAt ?? null
		},
		labels: {
			countryNames: COUNTRY_NAMES,
			genderNames: GENDER_NAMES
		}
	};
};
