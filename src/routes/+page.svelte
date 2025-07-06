<script lang="ts">
	import Map from '$lib/Map.svelte'
	import Button from '$lib/Button.svelte'
	import { onMount } from 'svelte'
	import type { ExtendedFeature } from 'd3-geo'
	import type { Country } from '$lib/countries'
	import { fade } from 'svelte/transition'
	import { toast } from 'svelte-sonner'
	import copy from 'copy-to-clipboard'

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
	<meta
		name="description"
		content="A free and open-source alternative to ad and trackers cluttered been, a website for tracking countries you have visited."
	/>
</svelte:head>
<aside
	class="absolute top-2 bottom-2 left-2 flex w-80 flex-col gap-4 rounded-2xl bg-neutral-800/40 px-6 py-5 text-white backdrop-blur-2xl"
>
	<header class="flex shrink-0 items-end gap-2 text-sm">
		<h1 class="text-4xl font-bold">
			been-<a
				href="https://github.com/VityaSchel/been-foss"
				target="_blank"
				rel="noopener noreferrer"
				class="underline">foss</a
			>
		</h1>
		<p class="mb-0.5">
			by <a href="https://hloth.dev" target="_blank" rel="noreferrer noopener" class="font-medium"
				>hloth.dev</a
			>
		</p>
	</header>
	<input
		type="search"
		placeholder="Search countries..."
		class="rounded-full border border-neutral-600/40 bg-neutral-700/20 px-4 py-2 text-sm -outline-offset-[1px] outline-transparent transition-colors duration-200 focus:outline-[1px] focus:outline-[#ffb800]"
		bind:value={filter}
	/>
	<nav
		class="flex flex-1 flex-col overflow-y-auto mask-y-from-[calc(100%-20px)] mask-y-to-100% py-[10px]"
	>
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
		<Button
			onclick={() => {
				navigator.clipboard
					.readText()
					.then((text) => {
						const importedIds = text.trim().split(/ +/)
						const validIds = importedIds.filter((c) =>
							countries.some((country) => country.id === c)
						)
						if (validIds.length === 0) {
							toast.error('Data invalid', {
								description: 'Please use the “Export” button to copy the data from another browser'
							})
							return
						}
						if (validIds.length !== importedIds.length) {
							toast.error('Data invalid', {
								description:
									'Doesn’t look like these are valid country codes: ' +
									importedIds
										.filter((c) => !validIds.includes(c))
										.slice(0, 3)
										.join(', ')
							})
							return
						}
						visited = Array.from(new Set(importedIds))
						toast.success('Data imported')
					})
					.catch(() => {
						toast.error('Failed to read clipboard data', {
							description: 'Your browser may be out of date or you have restricted clipboard access'
						})
					})
			}}>Import</Button
		>
		<Button
			onclick={() => {
				if (visited.length === 0) {
					toast.warning('Nothing to export', {
						description: 'Visit some countries first ;)'
					})
					return
				}
				copy(visited.join(' '))
				toast.message('Data copied to clipboard', {
					description: 'Use the “Import” button to paste it in another browser'
				})
			}}>Export</Button
		>
		<Button
			destructive
			onclick={() => {
				if (visited.length === 0) {
					toast.warning('Nothing to reset', {
						description: 'Visit some countries first ;)'
					})
					return
				}
				toast.dismiss('reset-confirm')
				toast('Confirm deleting all data', {
					id: 'reset-confirm',
					action: {
						label: 'Confirm',
						onClick: () => {
							visited = []
							localStorage.removeItem('visitedCountries')
							toast.success('Map has been reset')
						}
					}
				})
			}}>Reset</Button
		>
	</footer>
</aside>
<main>
	<Map {countries} bind:visited />
</main>
