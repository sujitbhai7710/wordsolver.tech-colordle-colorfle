// @ts-nocheck
import countriesData from '$lib/data/worldle/countries.json';
import citiesData from '$lib/data/worldle/cities.json';
import countryDetailsData from '$lib/data/worldle/country-details.json';
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateSoftwareApplicationSchema,
  generateWebPageSchema,
} from '$lib/seo';
import {
  getDailyWorldleAnswer,
  getDisplayDateLabel,
  getRecentWorldleAnswers,
} from '$lib/worldle/logic';
import type { WorldleCity, WorldleCountry, WorldleCountryDetailsMap } from '$lib/worldle/types';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

const countries = countriesData as WorldleCountry[];
const cities = citiesData as WorldleCity[];
const countryDetails = countryDetailsData as WorldleCountryDetailsMap;

export const load = async () => {
  const today = getPuzzleDateForGame('worldle');
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const todayAnswer = getDailyWorldleAnswer(countries, cities, countryDetails, todayDate);
  const recentAnswers = getRecentWorldleAnswers(10, countries, cities, countryDetails, todayDate);

  const formattedTodayDate = getDisplayDateLabel(todayDate);

  const faqEntries = recentAnswers.map((answer) => ({
    question: `What was the Worldle answer on ${getDisplayDateLabel(answer.date)}?`,
    answer: `The Worldle answer on ${getDisplayDateLabel(answer.date)} was ${answer.country.name}. That puzzle was Worldle #${answer.worldleNumber}.`,
  }));

  const pageTitle = `Worldle Answer Today (${formattedTodayDate}) - Country Answer and Map`;
  const pageDescription = `Get Worldle hints and the confirmed Worldle answer for today, ${formattedTodayDate}. Today's country is ${todayAnswer.country.name}, with a direct link to the full Worldle archive for older puzzles.`;
  const pageKeywords = `worldle answer today, worldle answer, worldle hint, worldle hint today, worldle answer for ${formattedTodayDate}`;

  const pageUrl = 'https://wordsolverx.com/worldle-answer-today';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Worldle Answer Today for ${formattedTodayDate}: ${todayAnswer.country.name}`,
    description: pageDescription,
    datePublished: `${todayDate}T00:00:00Z`,
    dateModified: `${todayDate}T00:00:00Z`,
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
        url: 'https://wordsolverx.com/images/worldle-answer-today.webp',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };

  const schemas = JSON.stringify([
    articleSchema,
    generateFAQSchema(faqEntries),
    generateHowToSchema('How to use the Worldle answer today page', [
      {
        name: 'Check today',
        text: 'Read the top answer card to see the current Worldle country and quick facts.',
      },
      {
        name: 'Open the archive',
        text: 'Use the archive link on the page whenever you need to verify an older Worldle answer.',
      },
      {
        name: 'Solve if needed',
        text: 'Open the Worldle solver if you want help before revealing the answer.',
      },
    ]),
    generateSoftwareApplicationSchema('Worldle Answer Today', 'UtilitiesApplication'),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Today', url: 'https://wordsolverx.com/today' },
      { name: 'Worldle Answer Today', url: pageUrl },
    ]),
    generateWebPageSchema('Worldle Answer Today', pageDescription, pageUrl),
  ]);

  return {
    todayDate,
    todayAnswer,
    formattedTodayDate,
    faqEntries,
    schemas,
    meta: {
      title: pageTitle,
      description: pageDescription,
      keywords: pageKeywords,
      canonical: pageUrl,
    },
  };
};
;null as any as PageServerLoad;