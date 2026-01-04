<template>
  <div class="relative">
    <select
      :value="selectedChapterId"
      :class="[
        'appearance-none rounded-lg px-4 py-2 pr-10 text-sm font-medium cursor-pointer min-w-[150px] transition-colors',
        dark ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20 focus:ring-2 focus:ring-white/50' : 'bg-white border border-gray-300 text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
      ]"
      @change="handleChange"
    >
      <option
        v-for="chapter in chapters"
        :key="chapter.id"
        :value="chapter.id"
        :class="dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'"
      >
        {{ chapter.chapter_label || `Chapter ${chapter.chapter_index}` }}
      </option>
    </select>
    <div :class="[
      'pointer-events-none absolute inset-y-0 right-0 flex items-center px-2',
      dark ? 'text-white' : 'text-gray-700'
    ]">
      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  chapters: Array<{
    id: number
    chapter_index: number
    chapter_label?: string
    title?: string
  }>
  selectedChapterId?: number | string
  dark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dark: false
})

const emit = defineEmits<{
  change: [chapterId: number]
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const chapterId = parseInt(target.value)
  if (chapterId) {
    emit('change', chapterId)
  }
}
</script>

