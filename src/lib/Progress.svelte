<script lang="ts">
	import { onMount } from 'svelte'
	import tippy from 'tippy.js'

	let {
		countries,
		visited
	}: {
		countries: number
		visited: number
	} = $props()

	let progress = $derived(visited / countries)

	let element: HTMLDivElement
	onMount(() => {
		const instance = tippy(element, {
			content: `${visited} of ${countries} countries visited (${(progress * 100).toFixed(2)}%)`,
			trigger: 'mouseenter focus',
			duration: 100
		})
		return () => {
			instance.destroy()
		}
	})
</script>

<div
	class="fixed top-2 right-2 z-[1] rounded-full bg-neutral-800/20 p-5 text-white backdrop-blur-2xl"
	bind:this={element}
>
	<div
		role="progressbar"
		aria-valuenow={visited}
		aria-valuemin="0"
		aria-valuemax={countries}
		aria-label="Progress"
		class="h-1 w-20 overflow-clip rounded-full bg-neutral-500"
	>
		<div class="h-full bg-lime-500" style="width: {progress * 100}%"></div>
	</div>
</div>
