<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { geoMercator, geoPath, type ExtendedFeature } from 'd3-geo'
	import CountryPath from '$lib/CountryPath.svelte'
	import {
		createSingleton,
		followCursor,
		type CreateSingletonInstance,
		type Instance
	} from 'tippy.js'

	type Country = { id: string; name: string; feature: ExtendedFeature }

	let countries: Country[] = $state([])
	let visited = $state([])
	let tippyInstances: Record<string, Instance> = $state({})

	let width = $state(1)
	let height = $state(1)

	const fetchData = async () => {
		const data = await fetch('/countries.geojson').then((res) => res.json())
		const features = data.features as ExtendedFeature[]
		countries = features
			.map((feature) => ({
				id: feature.properties?.iso_a3 as string,
				name: feature.properties?.name as string,
				feature
			}))
			.filter((c) => c.id !== '-99')
	}

	onMount(() => {
		fetchData()
	})

	onMount(() => {
		const saved = localStorage.getItem('visitedCountries')
		if (saved) {
			visited = JSON.parse(saved) || []
		}
	})

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

	onDestroy(() => {
		if (singleton) {
			singleton.destroy()
		}
	})

	onMount(() => {
		width = window.innerWidth
		height = window.innerHeight
	})

	let timeout: Timer | null = $state(null)

	let progress = $derived(visited.length / countries.length)
</script>

<svelte:window
	onresize={() => {
		if (timeout) {
			clearTimeout(timeout)
		}
		timeout = setTimeout(() => {
			width = window.innerWidth
			height = window.innerHeight
		}, 100)
	}}
/>
<div class="h-svh w-screen">
	<div
		class="fixed top-2 right-2 z-[1] rounded-full bg-neutral-800/20 p-5 text-white backdrop-blur-2xl"
	>
		<div
			role="progressbar"
			aria-valuenow={Math.floor(progress * 100)}
			aria-valuemin="0"
			aria-valuemax="100"
			aria-label="Progress"
			class="h-1 w-20 overflow-clip rounded-full bg-neutral-500"
		>
			<div class="h-full bg-lime-500" style="width: {progress * 100}%"></div>
		</div>
	</div>
	<svg {width} {height} class="h-full w-full">
		{#each countries as country (country.id)}
			{@const id = country.id}
			<CountryPath
				path={pathGen(country.feature)}
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
	</svg>
</div>
