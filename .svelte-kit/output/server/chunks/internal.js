import{r}from"./root.js";import"./environment.js";let o={};function f(t){}function p(t){o=t}let s=null;function g(t){s=t}function m(t){}const h={app_template_contains_nonce:!1,async:!1,csp:{mode:"auto",directives:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1},reportOnly:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1}},csrf_check_origin:!0,csrf_trusted_origins:[],embedded:!1,env_public_prefix:"PUBLIC_",env_private_prefix:"",hash_routing:!1,hooks:null,preload_strategy:"modulepreload",root:r,service_worker:!1,service_worker_options:void 0,server_error_boundaries:!1,templates:{app:({head:t,body:n,assets:e,nonce:a,env:i})=>`<!doctype html>
<html lang="en">

<head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
        <noscript><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" /></noscript>
        <style>
                html {
                        background: #ffffff;
                }

                body {
                        margin: 0;
                        min-height: 100vh;
                        background: #ffffff;
                        color: #0f172a;
                        font-family:
                                'Plus Jakarta Sans',
                                'Segoe UI',
                                system-ui,
                                -apple-system,
                                BlinkMacSystemFont,
                                'Helvetica Neue',
                                sans-serif;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                }

                a {
                        color: inherit;
                        text-decoration: none;
                }

                img {
                        display: block;
                        max-width: 100%;
                        height: auto;
                }

                .site-shell {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        background: #ffffff;
                }

                .site-main {
                        flex: 1 1 auto;
                }

                body[data-theme='dark'],
                [data-theme='dark'] .site-shell {
                        background: #0f172a;
                        color: #f8fafc;
                }
        </style>
        <script>
                (function () {
                        var GA_ID = 'G-8QRMXK049Z';
                        window.dataLayer = window.dataLayer || [];
                        window.__wordsolverxQueuedGtagCalls = window.__wordsolverxQueuedGtagCalls || [];

                        function queueGtagCall() {
                                var args = Array.prototype.slice.call(arguments);
                                window.__wordsolverxQueuedGtagCalls.push(args);
                        }

                        window.gtag = window.gtag || queueGtagCall;

                        function sendPageView() {
                                if (!window.gtag) return;
                                window.gtag('event', 'page_view', {
                                        page_path: window.location.pathname + window.location.search,
                                        page_location: window.location.href,
                                        page_title: document.title
                                });
                        }

                        function flushQueuedCalls() {
                                var queue = window.__wordsolverxQueuedGtagCalls || [];
                                var hadQueuedPageView = false;

                                window.__wordsolverxQueuedGtagCalls = [];
                                for (var i = 0; i < queue.length; i += 1) {
                                        var args = queue[i];
                                        if (args[0] === 'event' && args[1] === 'page_view') {
                                                hadQueuedPageView = true;
                                        }
                                        window.gtag.apply(window, args);
                                }

                                if (!hadQueuedPageView) {
                                        sendPageView();
                                }
                        }

                        function loadAnalytics() {
                                if (window.__wordsolverxAnalyticsLoaded) return;
                                window.__wordsolverxAnalyticsLoaded = true;

                                var script = document.createElement('script');
                                script.async = true;
                                script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
                                script.onload = function () {
                                        window.gtag = function () {
                                                window.dataLayer.push(arguments);
                                        };
                                        window.gtag('js', new Date());
                                        window.gtag('config', GA_ID, { send_page_view: false });
                                        flushQueuedCalls();
                                };
                                document.head.appendChild(script);
                        }

                        window.__wordsolverxLoadAnalytics = loadAnalytics;

                        function scheduleAnalytics() {
                                var interactionEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
                                var cleanup = function () {
                                        for (var i = 0; i < interactionEvents.length; i += 1) {
                                                window.removeEventListener(interactionEvents[i], loadAfterInteraction);
                                        }
                                };
                                var loadAfterInteraction = function () {
                                        cleanup();
                                        loadAnalytics();
                                };

                                for (var i = 0; i < interactionEvents.length; i += 1) {
                                        window.addEventListener(interactionEvents[i], loadAfterInteraction, {
                                                once: true,
                                                passive: true
                                        });
                                }

                                window.addEventListener(
                                        'load',
                                        function () {
                                                window.setTimeout(function () {
                                                        cleanup();
                                                        loadAnalytics();
                                                }, 15000);
                                        },
                                        { once: true }
                                );
                        }

                        scheduleAnalytics();

                        function updateCardFilter(input) {
                                var group = input.getAttribute('data-card-filter-input');
                                if (!group) return;

                                var query = input.value.trim().toLowerCase();
                                var items = document.querySelectorAll('[data-card-filter-item="' + group + '"]');
                                var visibleBySection = {};

                                items.forEach(function (item) {
                                        var haystack = (item.getAttribute('data-search-text') || '').toLowerCase();
                                        var section = item.getAttribute('data-filter-section') || '';
                                        var isVisible = !query || haystack.indexOf(query) !== -1;
                                        item.hidden = !isVisible;
                                        if (isVisible) {
                                                visibleBySection[section] = true;
                                        }
                                });

                                document
                                        .querySelectorAll('[data-card-filter-empty="' + group + '"]')
                                        .forEach(function (emptyState) {
                                                var section = emptyState.getAttribute('data-empty-scope') || '';
                                                emptyState.hidden = !query || Boolean(visibleBySection[section]);
                                        });
                        }

                        function refreshAllCardFilters() {
                                document.querySelectorAll('[data-card-filter-input]').forEach(function (input) {
                                        updateCardFilter(input);
                                });
                        }

                        document.addEventListener('input', function (event) {
                                var target = event.target;
                                if (target && target.matches && target.matches('[data-card-filter-input]')) {
                                        updateCardFilter(target);
                                }
                        });

                        document.addEventListener('submit', function (event) {
                                var target = event.target;
                                if (target && target.matches && target.matches('[data-card-filter-form]')) {
                                        event.preventDefault();
                                }
                        });

                        document.addEventListener('click', function (event) {
                                var target = event.target;
                                if (!target || !target.closest) return;

                                var copyButton = target.closest('[data-copy-value]');
                                if (copyButton) {
                                        var textToCopy = copyButton.getAttribute('data-copy-value') || '';
                                        if (!textToCopy || !navigator.clipboard || !navigator.clipboard.writeText) return;

                                        var defaultLabel = copyButton.getAttribute('data-copy-default') || 'Copy';
                                        var successLabel = copyButton.getAttribute('data-copy-success') || 'Copied';

                                        navigator.clipboard.writeText(textToCopy).then(function () {
                                                copyButton.textContent = successLabel;
                                                window.setTimeout(function () {
                                                        copyButton.textContent = defaultLabel;
                                                }, 2000);
                                        });
                                        return;
                                }

                                var reloadButton = target.closest('[data-reload-page]');
                                if (reloadButton) {
                                        window.location.reload();
                                }
                        });

                        if (document.readyState === 'loading') {
                                document.addEventListener('DOMContentLoaded', refreshAllCardFilters, { once: true });
                        } else {
                                refreshAllCardFilters();
                        }

                        window.addEventListener('pageshow', refreshAllCardFilters);
                })();
        <\/script>

        `+t+`
</head>

<body data-sveltekit-preload-data="hover">
        <div style="display: contents">`+n+`</div>
</body>

</html>
`,error:({status:t,message:n})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>`+n+`</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">`+t+`</span>
			<div class="message">
				<h1>`+n+`</h1>
			</div>
		</div>
	</body>
</html>
`},version_hash:"1790waj"};async function v(){let t,n,e,a,i;return{handle:t,handleFetch:n,handleError:e,handleValidationError:a,init:i}=await import("../entries/hooks.server.js"),{handle:t,handleFetch:n,handleError:e,handleValidationError:a,init:i,reroute:void 0,transport:void 0}}export{p as a,g as b,m as c,v as g,h as o,o as p,s as r,f as s};
