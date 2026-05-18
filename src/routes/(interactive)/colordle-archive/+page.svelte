<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { parseArchiveDateKey } from '$lib/archive-page';
  import {
    getColordleAvailableDateKeys,
    getColordleDataForDate,
    type ColordleDayData
  } from '$lib/colordle-date';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import ColorClues from '$lib/components/ColorClues.svelte';

  const fallbackStartDate = new Date(2023, 7, 7);

  // Load all available date keys synchronously from the imported JSON data
  let availableDateStrings = $state<string[]>(getColordleAvailableDateKeys());
  let selectedDateKey = $state<string | null>(null);
  let selectedColordle = $state<ColordleDayData | null>(null);

  let availableDates = $derived(
    (availableDateStrings ?? []).map((dateString) => parseArchiveDateKey(dateString)).filter((date): date is Date => date !== null)
  );
  let startDate = $derived(availableDates[0] ?? fallbackStartDate);

  onMount(() => {
    // Check for date query param on initial load
    const dateParam = new URL(window.location.href).searchParams.get('date');
    if (dateParam) {
      selectDate(dateParam);
      // Clean URL
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }
  });

  function selectDate(dateKey: string): void {
    const date = parseArchiveDateKey(dateKey);
    if (!date) return;

    const data = getColordleDataForDate(date);
    if (data) {
      selectedDateKey = dateKey;
      selectedColordle = data;
    }
  }

  function handleDateSelect(dateKey: string): void {
    selectDate(dateKey);
    // Scroll to answer section
    requestAnimationFrame(() => {
      document.getElementById('archive-answer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
</script>

<svelte:head>
  <title>Colordle Archive - Complete Color Answer History | WordSolverX</title>
  <meta name="description" content="Browse the complete archive of all Colordle color answers. Calendar view with search and direct links to every past color puzzle solution." />
  <link rel="canonical" href="https://wordsolverx.com/colordle-archive" />
  <meta property="og:title" content="Colordle Archive - All Past Color Answers" />
  <meta property="og:description" content="Complete history of every Colordle color answer. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/colordle-archive" />
  <meta property="og:type" content="website" />
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Colordle Archive",
    "description": "Complete archive of all Colordle daily color answers.",
    "url": "https://wordsolverx.com/colordle-archive",
    "isPartOf": { "@type": "WebSite", "name": "WordSolverX", "url": "https://wordsolverx.com" }
  })}</script>`}
</svelte:head>

<ArchiveCalendar
  gameName="Colordle"
  gameColor="teal"
  gameIcon="Cd"
  {startDate}
  {availableDates}
  basePath="/colordle-archive"
  selectedDate={selectedDateKey}
  description="Every Colordle color answer. Find any past hex code solution instantly."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if selectedColordle}
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
          Colordle answer for {selectedColordle.formattedDate}
        </h2>
      </div>
      <ColorClues colorName={selectedColordle.color.name} colorHex={selectedColordle.color.hex} />
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Choose a color date from the archive</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pick any archived Colordle date above to reveal the exact color name and hex code on this page.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Colordle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>
        The Colordle archive offers a complete record of every daily color-guessing puzzle since the game launched in August 2023. Unlike traditional word games, Colordle challenges players to identify specific colors by name and hex code, testing knowledge of color theory, naming conventions, and visual perception. The archive preserves every puzzle, making it an invaluable tool for players who want to study color patterns and improve their guessing accuracy over time.
      </p>
      <p>
        Color naming is a surprisingly complex domain. The human eye can distinguish millions of distinct colors, but our vocabulary for describing them is far more limited. Colordle draws from a curated list of named colors that span the full spectrum, from common terms like red, blue, and green to more specific names like cerise, chartreuse, and periwinkle. The archive reveals which color names appear most frequently, how the difficulty of daily puzzles varies based on the specificity of the color name, and which regions of the color wheel tend to produce the most challenging puzzles.
      </p>
      <p>
        For designers, web developers, and anyone working in visual media, the Colordle archive doubles as an educational resource. Each entry pairs a color name with its corresponding hex code, building practical knowledge of the color naming systems used in CSS, graphic design, and digital art. Regular archive browsing reinforces the connection between visual perception and technical color specification.
      </p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Colordle Answers Work</h3>
      <p>
        Each Colordle puzzle presents players with a target color and challenges them to guess its name through a series of clues. The game provides feedback on each guess, indicating how close the guessed color is to the target in terms of hue, saturation, and brightness. Players typically have a limited number of guesses to identify the correct color name from the game's curated answer list.
      </p>
      <p>
        The answer list in Colordle consists of named colors with corresponding hex codes. Each daily puzzle selects one color from this pool, and the archive records both the name and the hex code for every past solution. Because each date always has the same answer means that each date maps to exactly one answer, making the archive a reliable and complete reference that players can trust.
      </p>
      <p>
        Colordle draws from standardized color naming conventions, including CSS named colors, X11 color names, and extended color vocabularies used in design tools. Some answers correspond to well-known colors that most people would recognize immediately, while others test deeper knowledge of niche color terminology. The archive shows the full range of this spectrum, from the obvious to the obscure.
      </p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Notable Past Colordle Answers</h3>
      <p>
        The Colordle archive contains many puzzles that stumped even experienced players. Colors with ambiguous names that could describe several similar hues, very dark or very light colors where hue differences are hard to perceive, and colors that exist at the boundary between two named regions of the spectrum have all proven particularly challenging. These difficult entries often generate lively discussion in the Colordle community and provide excellent learning opportunities.
      </p>
      <p>
        Patterns in the archive show that certain color families appear more frequently than others. Warm colors like reds, oranges, and yellows tend to be well-represented, as do the various shades of blue and green. Less common entries in the purple, pink, and brown ranges sometimes catch players off guard, especially when the specific shade is quite different from what the color name might suggest to a casual thinker.
      </p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How to Use the Colordle Archive</h3>
      <p>
        Use the calendar interface above to navigate to any date and view the Colordle answer for that day. Each archive entry displays the color name and hex code, along with visual color clues that show the exact shade. You can browse by month, jump to specific dates, or simply explore past puzzles to build your color knowledge systematically.
      </p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">What is the difference between Colordle and Colorfle?</h4>
      <p>
        While both games involve colors, they work differently. Colordle asks players to guess a specific color name based on clues and hex code information, while Colorfle presents color-blending challenges where players work with source colors and target hex values. The Colordle archive focuses on named color answers.
      </p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Does the Colordle archive include the hex code for every answer?</h4>
      <p>
        Yes. Every entry in the Colordle archive includes both the color name and the precise hex code, allowing you to see exactly what shade each puzzle solution represents.
      </p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How can I improve at guessing Colordle colors?</h4>
      <p>
        Studying the archive regularly helps you build familiarity with named colors and their hex values. Pay attention to colors you missed and learn the hex codes for colors that fall at the boundaries between common names. Over time, your ability to associate visual colors with their technical names will improve significantly.
      </p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Are Colordle answers sourced from standard color naming systems?</h4>
      <p>
        Yes. Colordle draws from standardized color naming conventions used in web development and design, including CSS named colors and extended color vocabularies. The archive reflects this standardized approach to color naming.
      </p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Is the Colordle archive updated daily?</h4>
      <p>
        The archive is updated daily as new Colordle puzzles are released. New entries appear automatically, ensuring complete coverage from the game's launch date to the present day.
      </p>
    </div>
  </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </article>
