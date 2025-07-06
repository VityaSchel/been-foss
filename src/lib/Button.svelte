<script lang="ts">
	let {
		children,
		destructive,
		...props
	}: {
		children: import('svelte').Snippet
		destructive?: boolean
	} & import('svelte/elements').SvelteHTMLElements['button'] = $props()
</script>

<button
	class={[
		'flex-1 rounded-full border-[0.5px] px-2  py-1 text-xs font-medium backdrop-blur-3xl transition-[scale] not-disabled:cursor-pointer not-disabled:active:scale-95',
		{
			'border-neutral-800/40 bg-neutral-800/30': !destructive,
			'border-[#5e3333]/30 bg-[#4c1010]/40': destructive
		}
	]}
	{...props}
>
	{@render children()}
</button>
