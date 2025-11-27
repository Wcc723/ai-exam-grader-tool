<script setup>
import { ref, watch } from 'vue';
import { Edit3, Check, RotateCcw } from 'lucide-vue-next';

const props = defineProps({
  initialAnswerText: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['answer-confirmed', 'cancel']);

const answerText = ref(props.initialAnswerText);

// Reset text if prop changes
watch(() => props.initialAnswerText, (newVal) => {
  answerText.value = newVal;
});

const confirmAnswer = () => {
  if (answerText.value.trim()) {
    emit('answer-confirmed', answerText.value);
  } else {
    alert('解答內容不能為空');
  }
};

const cancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6 animate-fade-in">
    <div class="flex items-center gap-2 mb-4">
      <Edit3 class="w-5 h-5 text-indigo-600" />
      <h2 class="text-lg font-semibold text-gray-800">編輯正確解答</h2>
    </div>

    <div class="mb-4">
      <p class="text-sm text-gray-600 mb-2">
        AI 已從 PDF 中提取解答。請檢查並修正任何錯誤，以確保批改準確。
      </p>
      <textarea 
        v-model="answerText"
        rows="10"
        class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
        placeholder="在此編輯解答..."
      ></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <button 
        @click="cancel"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <RotateCcw class="w-4 h-4" />
        重新上傳
      </button>
      <button 
        @click="confirmAnswer"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <Check class="w-4 h-4" />
        確認解答
      </button>
    </div>
  </div>
</template>
