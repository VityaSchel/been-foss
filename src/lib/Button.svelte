<script lang="ts">
	let {
		children,
		destructive
	}: {
		children: import('svelte').Snippet
		destructive?: boolean
	} = $props()
</script>

<button
	class={[
		'flex-1 cursor-pointer rounded-full border-[0.5px]  px-2 py-1 text-xs font-medium backdrop-blur-3xl transition-[scale] active:scale-95',
		{
			'border-neutral-800/40 bg-neutral-800/30': !destructive,
			'border-[#5e3333]/30 bg-[#4c1010]/40': destructive
		}
	]}
>
	{@render children()}
</button>
