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
	import type { CountriesMap, Country } from '$lib/countries'
	import Progress from '$lib/Progress.svelte'
	import Spinner from '$lib/SpinnerIcon.svelte'
	import { browser } from '$app/environment'

	let {
		countries,
		visited = $bindable()
	}: {
		countries: CountriesMap | null
		visited: Country['id'][]
	} = $props()

	let tippyInstances1x: Record<string, Instance> = $state({})
	let tippyInstances2x: Record<string, Instance> = $state({})

	let resizeTimer: Timer | null = $state(null)

	let width = $state(1)
	let height = $state(1)

	let svgEl: SVGSVGElement
	let zoom1xEl: SVGGElement
	let zoom2xEl: SVGGElement

	const projection = $derived(
		geoMercator()
			.scale(width / 6.5)
			.translate([width / 2, height / 1.5])
	)

	const pathGen = $derived(geoPath(projection))

	let singletons: {
		zoom1x: CreateSingletonInstance | null
		zoom2x: CreateSingletonInstance | null
	} = $state({ zoom1x: null, zoom2x: null })
	const makeSingleton = (zoom: '1x' | '2x') => {
		const existingSingleton = zoom === '1x' ? singletons.zoom1x : singletons.zoom2x
		if (existingSingleton !== null) {
			existingSingleton.destroy()
		}
		singletons[zoom === '1x' ? 'zoom1x' : 'zoom2x'] = createSingleton(
			Object.values(zoom === '1x' ? tippyInstances1x : tippyInstances2x),
			{
				followCursor: true,
				plugins: [followCursor],
				duration: 0,
				inertia: true,
				interactive: false,
				trigger: 'mouseenter focus',
				hideOnClick: false
			}
		)
	}

	onMount(() => {
		width = window.innerWidth
		height = window.innerHeight

		const svg = select<SVGSVGElement, unknown>(svgEl)
		const zoom1xGroup = select<SVGGElement, unknown>(zoom1xEl)
		const zoom2xGroup = select<SVGGElement, unknown>(zoom2xEl)
		svg.call(
			zoom<SVGSVGElement, unknown>()
				.scaleExtent([0.5, 10])
				.on('zoom', (event) => {
					if (event.transform.k < 3) {
						zoom1xGroup.style('display', 'block')
						zoom2xGroup.style('display', 'none')
					} else {
						zoom1xGroup.style('display', 'none')
						zoom2xGroup.style('display', 'block')
					}
					zoom1xGroup.attr('transform', event.transform)
					zoom2xGroup.attr('transform', event.transform)
				})
		)
	})

	onDestroy(() => {
		if (singletons.zoom1x !== null) {
			singletons.zoom1x.destroy()
		}
		if (singletons.zoom2x !== null) {
			singletons.zoom2x.destroy()
		}
	})

	const saveVisitedCountries = () => {
		localStorage.setItem('visitedCountries', JSON.stringify(Array.from(visited)))
	}
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
	class="fixed top-0 right-0 bottom-0 left-5 flex items-center justify-center pr-5 text-center font-sans text-lg tracking-wide md:left-85"
>
	<div class="w-100 max-w-full">
		<noscript>
			This app requires JavaScript to be enabled, otherwise how would we store your data
			client-side? 😘
		</noscript>
	</div>
</div>
<div class="relative h-svh w-screen">
	{#if countries !== null}
		<Progress countries={countries.zoom2x.length} visited={visited.length} />
	{:else if browser}
		<div class="absolute top-0 right-0 bottom-0 left-5 md:left-80">
			<div class="absolute top-1/2 left-1/2">
				<Spinner />
			</div>
		</div>
	{/if}
	<svg {width} {height} class="h-full w-full" bind:this={svgEl}>
		<g bind:this={zoom1xEl}>
			{#if countries !== null}
				{#each countries.zoom1x as country (country.id)}
					{@const id = country.id}
					<CountryPath
						path={pathGen(country.geometry)}
						name={country.name}
						bind:visited={
							() => visited.includes(id),
							(add) => {
								visited = add ? visited.concat(id) : visited.filter((c) => c !== id)
								saveVisitedCountries()
							}
						}
						bind:tooltip={
							() => tippyInstances1x[id],
							(i) => {
								tippyInstances1x[id] = i
								makeSingleton('1x')
							}
						}
					/>
				{/each}
			{/if}
		</g>
		<g bind:this={zoom2xEl} style="display: none">
			{#if countries !== null}
				{#each countries.zoom2x as country (country.id)}
					{@const id = country.id}
					<CountryPath
						path={pathGen(country.geometry)}
						name={country.name}
						bind:visited={
							() => visited.includes(id),
							(add) => {
								visited = add ? visited.concat(id) : visited.filter((c) => c !== id)
								saveVisitedCountries()
							}
						}
						bind:tooltip={
							() => tippyInstances2x[id],
							(i) => {
								tippyInstances2x[id] = i
								makeSingleton('2x')
							}
						}
					/>
				{/each}
			{/if}
		</g>
	</svg>
</div>
