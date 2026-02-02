<script lang="ts">
	import { TAALS } from '$lib/data/taals';

	interface Props {
		value: string;
		onchange?: (taal: string) => void;
		showBeats?: boolean;
		class?: string;
	}

	let { value = $bindable(), onchange, showBeats = true, class: className = '' }: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		value = target.value;
		onchange?.(target.value);
	}
</script>

<select
	{value}
	onchange={handleChange}
	class="p-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none bg-white {className}"
>
	{#each Object.entries(TAALS) as [key, taal]}
		<option value={key}>
			{taal.name}{showBeats ? ` (${taal.beats})` : ''}
		</option>
	{/each}
</select>
