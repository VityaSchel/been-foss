<script lang="ts">
	import { onMount } from 'svelte'
	import tippy, { type Instance } from 'tippy.js'

	let {
		name,
		path,
		visited = $bindable(),
		tooltip = $bindable()
	}: {
		name: string
		path: string | null
		visited: boolean
		tooltip: Instance
	} = $props()

	let element: SVGPathElement
	onMount(() => {
		const instance = tippy(element, {
			content: name,
			duration: 0,
			interactive: false,
			trigger: 'mouseenter focus',
			hideOnClick: false
		})
		tooltip = instance
		return () => {
			instance.destroy()
		}
	})
</script>

<path
	bind:this={element}
	tabindex="0"
	d={path}
	onclick={() => (visited = !visited)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			visited = !visited
		}
	}}
	role="button"
	aria-label={name}
	stroke="#333"
	stroke-width="0.5"
	class={[
		'cursor-pointer transition-all duration-200',
		{
			'fill-[#f0f0f0] hover:fill-amber-200': !visited,
			'fill-[#ffb800] hover:fill-amber-500': visited
		}
	]}
/>
