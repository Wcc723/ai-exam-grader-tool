<script setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import { CheckCircle } from 'lucide-vue-next';

const props = defineProps({
  result: {
    type: String,
    required: true
  }
});

const md = new MarkdownIt();
const renderedResult = computed(() => md.render(props.result));
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-600 animate-fade-in">
    <div class="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
      <CheckCircle class="w-6 h-6 text-green-500" />
      <h2 class="text-xl font-bold text-gray-800">批改結果</h2>
    </div>
    
    <div class="prose prose-indigo max-w-none" v-html="renderedResult"></div>
  </div>
</template>

<style>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
