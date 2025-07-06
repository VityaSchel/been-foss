<script lang="ts">
	import '../app.css'
	import 'tippy.js/dist/tippy.css'
	import { Toaster } from 'svelte-sonner'

	let { children } = $props()
</script>

<Toaster richColors />
{@render children()}
