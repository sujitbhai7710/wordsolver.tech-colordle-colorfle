<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { getColorfleArchiveEntries, buildColorfleAnswerPayload, type ColorfleAnswerPayload } from '$lib/colorfle';

  // Initialize with empty data to avoid hydration mismatch
  let allEntries = $state<ColorfleAnswerPayload[]>([]);
  let isHydrated = $state(false);
  let days = $state(30);
  let selectedDate = $state('');

  const visibleEntries = $derived(allEntries.slice(0, days));
  const selectedEntry = $derived(
    allEntries.find((entry) => entry.date === selectedDate) ?? visibleEntries[0] ?? null
  );

  // Load data only on client side to avoid hydration mismatch
  onMount(() => {
    allEntries = getColorfleArchiveEntries(365);
    selectedDate = allEntries[0]?.date ?? '';
    isHydrated = true;
  });

  function handleDateSelect(date: string): void {
    selectedDate = date;
    // Scroll to detail section
    requestAnimationFrame(() => {
      document.getElementById('archive-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
</script>

<svelte:head>
  <title>Colorfle Archive - Daily Color Answers History | WordSolverX</title>
  <meta name="description" content="Browse the Colorfle archive with recent puzzle dates, source colors, and final target hex results for past Colorfle games." />
  <link rel="canonical" href="https://wordsolverx.com/colorfle-archive" />
  <meta property="og:title" content="Colorfle Archive - Daily Color Answers History" />
  <meta property="og:description" content="Check past Colorfle answer colors and target hex codes with a static date archive." />
  <meta property="og:url" content="https://wordsolverx.com/colorfle-archive" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Colorfle Archive" />
  <meta name="twitter:description" content="Past Colorfle puzzle answers with source colors and final target hex values." />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Colorfle Archive',
    description: 'Archive of previous Colorfle daily color answers.',
    url: 'https://wordsolverx.com/colorfle-archive'
  })}</script>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <Breadcrumbs />

    <!-- Hero Header -->
    <section class="rounded-[2rem] border border-pink-100 bg-white p-8 shadow-[0_20px_60px_rgba(236,72,153,0.08)] sm:p-10">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-pink-500">Colorfle Archive</p>
          <h1 class="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Past Colorfle Answers</h1>
          <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Browse {allEntries.length} archived Colorfle puzzles. Pick a date to inspect the exact source colors and final target hex.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          {#each [30, 90, 365] as option}
            <button
              type="button"
              class={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${days === option ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'border border-slate-200 text-slate-600 hover:border-pink-300 hover:bg-pink-50'}`}
              onclick={() => (days = option)}
            >
              Last {option} days
            </button>
          {/each}
        </div>
      </div>
    </section>

    {#if isHydrated}
      <section class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <!-- Date List -->
        <article class="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <label for="colorfle-archive-date" class="block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Select date</label>
          <input
            id="colorfle-archive-date"
            class="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
            type="date"
            value={selectedDate}
            min={allEntries[allEntries.length - 1]?.date}
            max={allEntries[0]?.date}
            onchange={(event) => (selectedDate = (event.currentTarget as HTMLInputElement).value)}
          />

          <div class="mt-6 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            {#each visibleEntries as entry}
              <button
                type="button"
                class={`w-full rounded-2xl border p-4 text-left transition-all ${selectedEntry?.date === entry.date ? 'border-pink-400 bg-pink-50 shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:border-pink-200 hover:bg-white hover:shadow-sm'}`}
                onclick={() => handleDateSelect(entry.date)}
              >
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="font-bold text-slate-900">#{entry.puzzleNumber}</p>
                    <p class="text-sm text-slate-500">{entry.date}</p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    {#each entry.colors as color}
                      <span class="h-8 w-8 rounded-lg shadow-sm ring-2 ring-white" style={`background:${color.hex}`}></span>
                    {/each}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        </article>

        <!-- Selected Puzzle Detail -->
        <article id="archive-detail" class="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] scroll-mt-28">
          {#if selectedEntry}
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-pink-500">Selected puzzle</p>
            <h2 class="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Colorfle #{selectedEntry.puzzleNumber}</h2>
            <p class="mt-1 text-sm text-slate-500">{selectedEntry.date}</p>

            <!-- Color Mixing Visualization -->
            <div class="mt-6 flex items-center justify-center gap-3">
              {#each selectedEntry.colors as color, i}
                <div class="flex flex-col items-center gap-2">
                  <div class="h-20 w-20 rounded-2xl shadow-lg ring-[3px] ring-white" style={`background:${color.hex}`}></div>
                  <p class="text-xs font-bold text-slate-700">{color.name}</p>
                  <p class="font-mono text-[10px] text-slate-400">{color.hex}</p>
                  {#if color.weight != null}
                    <span class="rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] font-bold text-pink-600">
                      {Math.round(color.weight * 100)}%
                    </span>
                  {/if}
                </div>
                {#if i < selectedEntry.colors.length - 1}
                  <span class="text-2xl font-black text-slate-300">+</span>
                {/if}
              {/each}
              <span class="text-2xl font-black text-slate-300">=</span>
              <div class="flex flex-col items-center gap-2">
                <div class="h-20 w-20 rounded-full shadow-lg ring-[3px] ring-white" style={`background:${selectedEntry.targetColor.hex}`}></div>
                <p class="text-xs font-bold text-slate-700">Target</p>
                <p class="font-mono text-[10px] text-slate-400">{selectedEntry.targetColor.hex}</p>
              </div>
            </div>

            <!-- Target Color Large Preview -->
            <div class="mt-8 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div class="h-40" style={`background:${selectedEntry.targetColor.hex}`}></div>
              <div class="p-5 bg-white">
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Target Color</p>
                <p class="mt-2 text-3xl font-black text-slate-900">{selectedEntry.targetColor.hex}</p>
                <p class="mt-1 font-mono text-sm text-slate-400">
                  RGB({selectedEntry.targetColor.rgb.r}, {selectedEntry.targetColor.rgb.g}, {selectedEntry.targetColor.rgb.b})
                </p>
              </div>
            </div>
          {/if}
        </article>
      </section>
    {:else}
      <!-- Loading skeleton while hydrating -->
      <section class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article class="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-slate-200 rounded w-24"></div>
            <div class="h-10 bg-slate-200 rounded"></div>
            <div class="space-y-3 mt-6">
              {#each Array(5) as _}
                <div class="h-16 bg-slate-200 rounded-2xl"></div>
              {/each}
            </div>
          </div>
        </article>
        <article class="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-slate-200 rounded w-32"></div>
            <div class="h-8 bg-slate-200 rounded w-48"></div>
            <div class="h-6 bg-slate-200 rounded w-24"></div>
            <div class="flex gap-4 justify-center mt-6">
              {#each Array(4) as _}
                <div class="h-20 w-20 bg-slate-200 rounded-2xl"></div>
              {/each}
            </div>
            <div class="h-40 bg-slate-200 rounded-2xl mt-8"></div>
          </div>
        </article>
      </section>
    {/if}

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </div>
</div>
