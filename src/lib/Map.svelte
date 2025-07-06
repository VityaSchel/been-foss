<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { geoMercator, geoPath } from 'd3-geo'
	import CountryPath from '$lib/CountryPath.svelte'
	import {
		createSingleton,
		followCursor,
		type CreateSingletonInstance,
		type Instance
	} from 'tippy.js'
	import { select } from 'd3-selection'
	import { zoom } from 'd3-zoom'
	import type { Country } from '$lib/countries'
	import Progress from '$lib/Progress.svelte'
	import Spinner from '$lib/SpinnerIcon.svelte'
	import { browser } from '$app/environment'

	let {
		countries,
		visited = $bindable()
	}: {
		countries: Country[]
		visited: Country['id'][]
	} = $props()

	let tippyInstances: Record<string, Instance> = $state({})

	let resizeTimer: Timer | null = $state(null)

	let width = $state(1)
	let height = $state(1)

	let svgEl: SVGSVGElement
	let gEl: SVGGElement

	const projection = $derived(
		geoMercator()
			.scale(width / 6.5)
			.translate([width / 2, height / 1.5])
	)

	const pathGen = $derived(geoPath(projection))

	let singleton: CreateSingletonInstance | null = $state(null)
	const makeSingleton = () => {
		if (singleton) {
			singleton.destroy()
		}
		singleton = createSingleton(Object.values(tippyInstances), {
			followCursor: true,
			plugins: [followCursor],
			duration: 0,
			inertia: true,
			interactive: false,
			trigger: 'mouseenter focus',
			hideOnClick: false
		})
	}

	onMount(() => {
		width = window.innerWidth
		height = window.innerHeight

		const svg = select<SVGSVGElement, unknown>(svgEl)
		const g = select<SVGGElement, unknown>(gEl)
		svg.call(
			zoom<SVGSVGElement, unknown>()
				.scaleExtent([0.5, 10])
				.on('zoom', (event) => {
					g.attr('transform', event.transform)
				})
		)
	})

	onDestroy(() => {
		if (singleton) {
			singleton.destroy()
		}
	})
</script>

<svelte:window
	onresize={() => {
		if (resizeTimer) {
			clearTimeout(resizeTimer)
		}
		resizeTimer = setTimeout(() => {
			width = window.innerWidth
			height = window.innerHeight
		}, 100)
	}}
/>
<div
	class="fixed top-0 right-0 bottom-0 left-5 md:left-85 flex items-center justify-center pr-5 text-center font-sans text-lg tracking-wide"
>
	<div class="w-100 max-w-full">
		<noscript>
			This app requires JavaScript to be enabled, otherwise how would we store your data
			client-side? 😘
		</noscript>
	</div>
</div>
<div class="relative h-svh w-screen">
	{#if countries.length}
		<Progress countries={countries.length} visited={visited.length} />
	{:else if browser}
		<div class="absolute top-0 right-0 bottom-0 left-5 md:left-80">
			<div class="absolute top-1/2 left-1/2">
				<Spinner />
			</div>
		</div>
	{/if}
	<svg {width} {height} class="h-full w-full" bind:this={svgEl}>
		<g bind:this={gEl}>
			{#each countries as country (country.id)}
				{@const id = country.id}
				<CountryPath
					path={pathGen(country.geometry)}
					name={country.name}
					bind:visited={
						() => visited.includes(id),
						(add) => {
							if (add) {
								visited = visited.concat(id)
							} else {
								visited = visited.filter((c) => c !== id)
							}
							localStorage.setItem('visitedCountries', JSON.stringify(Array.from(visited)))
						}
					}
					bind:tooltip={
						() => tippyInstances[id],
						(i) => {
							tippyInstances[id] = i
							makeSingleton()
						}
					}
				/>
			{/each}
		</g>
	</svg>
</div>
