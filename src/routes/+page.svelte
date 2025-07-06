<script lang="ts">
	import Map from '$lib/Map.svelte'
	import Button from '$lib/Button.svelte'
	import { onMount } from 'svelte'
	import type { ExtendedFeature } from 'd3-geo'
	import type { Country } from '$lib/countries'
	import { fade } from 'svelte/transition'

	let countries: Country[] = $state([])
	let visited: Country['id'][] = $state([])
	let filter: string = $state('')

	onMount(() => {
		fetchData()

		const saved = localStorage.getItem('visitedCountries')
		if (saved) {
			visited = JSON.parse(saved) || []
		}
	})

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
</script>

<svelte:head>
	<title>been-foss</title>
</svelte:head>
<aside
	class="absolute top-2 bottom-2 left-2 flex w-80 flex-col gap-4 rounded-2xl bg-neutral-800/40 px-6 py-5 text-white backdrop-blur-2xl"
>
	<header class="flex shrink-0 items-end gap-2 text-sm">
		<h1 class="text-4xl font-bold">been-foss</h1>
		<p class="mb-0.5">
			by <a href="https://hloth.dev" target="_blank" rel="noreferrer noopener">hloth.dev</a>
		</p>
	</header>
	<input
		type="search"
		placeholder="Search countries..."
		class="rounded-full border border-neutral-600/40 bg-neutral-700/20 px-4 py-2 text-sm -outline-offset-[1px] outline-transparent transition-colors duration-200 focus:outline-[1px] focus:outline-[#ffb800]"
		bind:value={filter}
	/>
	<nav class="flex flex-1 flex-col overflow-y-auto">
		{#each countries
			.toSorted((a, b) => a.name.localeCompare(b.name))
			.filter((c) => c.name
					.toLowerCase()
					.includes(filter.toLowerCase())) as country, i (country.id)}
			{@const id = country.id}
			<div class="flex items-center gap-2" in:fade={{ delay: i * 1, duration: 100 }}>
				<input
					type="checkbox"
					id="country-{id}"
					bind:checked={
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
				/>
				<label
					for="country-{id}"
					class="flex-1 py-[1px] text-lg font-medium tracking-wide select-none"
					>{country.name}</label
				>
			</div>
		{/each}
	</nav>
	<footer class="flex shrink-0 items-center gap-2">
		<Button>Import</Button>
		<Button>Export</Button>
		<Button destructive>Reset</Button>
	</footer>
</aside>
<main>
	<Map {countries} bind:visited />
</main>
