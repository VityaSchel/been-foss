<script lang="ts">
	import Map from '$lib/Map.svelte'
	import { onMount } from 'svelte'
	import type { GeoGeometryObjects } from 'd3-geo'
	import type { Country } from '$lib/countries'
	import Sidebar from '$lib/Sidebar.svelte'

	let countries: Country[] = $state([])
	let visited: Country['id'][] = $state([])

	onMount(() => {
		fetchData()

		const saved = localStorage.getItem('visitedCountries')
		if (saved) {
			visited = JSON.parse(saved) || []
		}
	})

	const fetchData = async () => {
		const data = await fetch('/countries.geojson').then((res) => res.json())
		const features = data.features as { id: string; n: string; g: GeoGeometryObjects }[]
		countries = features
			.map((c) => ({
				id: c.id,
				name: c.n,
				geometry: c.g
			}))
			.filter((c) => c.id !== '-99')
	}
</script>

<svelte:head>
	<title>been-foss</title>
	<meta
		name="description"
		content="A free and open-source alternative to ad and trackers cluttered been, a website for tracking countries you have visited."
	/>
</svelte:head>
<Sidebar {countries} bind:visited />
<main>
	<Map {countries} bind:visited />
</main>
