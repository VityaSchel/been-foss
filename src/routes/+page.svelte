<script lang="ts">
	import Map from '$lib/Map.svelte'
	import { onMount } from 'svelte'
	import type { GeoGeometryObjects } from 'd3-geo'
	import type { Country, CountriesMap } from '$lib/countries'
	import Sidebar from '$lib/Sidebar.svelte'

	let countries: CountriesMap | null = $state(null)
	let visited: Country['id'][] = $state([])

	onMount(() => {
		fetchData()

		const saved = localStorage.getItem('visitedCountries')
		if (saved) {
			visited = JSON.parse(saved) || []
		}
	})

	const fetchData = async () => {
		type Response = {
			type: 'FeatureCollection'
			features: {
				id: string
				n: string
				g: GeoGeometryObjects
			}[]
		}

		const map = (features: Response['features']) => {
			return features.map((f) => ({
				id: f.id,
				name: f.n,
				geometry: f.g
			}))
		}
		
		const [zoom1x, zoom2x] = await Promise.all([
			fetch('/countries/1x.geojson')
				.then((res) => res.json() as Promise<Response>)
				.then((res) => map(res.features)),
			fetch('/countries/2x.geojson')
				.then((res) => res.json() as Promise<Response>)
				.then((res) => map(res.features))
		])
		countries = { zoom1x, zoom2x }
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
