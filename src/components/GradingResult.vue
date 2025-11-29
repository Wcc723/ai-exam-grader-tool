<script setup>
import { ref, computed } from 'vue';
import MarkdownIt from 'markdown-it';
import { CheckCircle, Edit2, Save, X } from 'lucide-vue-next';

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save-to-sheets']);

const md = new MarkdownIt();
const isEditing = ref(false);

// Local state for editing
const editScore = ref(0);
const editFeedback = ref('');
const editDetailedResult = ref('');
const editSeatNumber = ref('');
const editStudentName = ref('');

const startEditing = () => {
  editScore.value = props.result.score;
  editFeedback.value = props.result.feedback;
  editDetailedResult.value = props.result.detailedResult;
  editSeatNumber.value = props.result.seatNumber || '';
  editStudentName.value = props.result.studentName || '';
  isEditing.value = true;
};

const saveEdits = () => {
  props.result.score = editScore.value;
  props.result.feedback = editFeedback.value;
  props.result.detailedResult = editDetailedResult.value;
  props.result.seatNumber = editSeatNumber.value;
  props.result.studentName = editStudentName.value;
  isEditing.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const renderedResult = computed(() => md.render(props.result.detailedResult || ''));
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-600 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
      <div class="flex items-center gap-2">
        <CheckCircle class="w-6 h-6 text-green-500" />
        <h2 class="text-xl font-bold text-gray-800">批改結果</h2>
      </div>
      <div class="flex items-center gap-4">
        <div v-if="!isEditing" class="text-2xl font-bold text-indigo-600">
          {{ result.score }} 分
        </div>
        <div v-else class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">分數：</label>
          <input 
            v-model="editScore" 
            type="number" 
            class="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
          />
        </div>
        
        <button 
          v-if="!isEditing"
          @click="startEditing"
          class="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          title="編輯結果"
        >
          <Edit2 class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Student Info Display -->
    <div v-if="!isEditing" class="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md">
      <div>
        <span class="text-sm text-gray-500">座號：</span>
        <span class="font-medium text-gray-900">{{ result.seatNumber || '未辨識' }}</span>
      </div>
      <div>
        <span class="text-sm text-gray-500">姓名：</span>
        <span class="font-medium text-gray-900">{{ result.studentName || '未辨識' }}</span>
      </div>
    </div>

    <!-- Content -->
    <div v-if="!isEditing">
      <!-- Feedback -->
      <div class="mb-6 bg-indigo-50 p-4 rounded-md">
        <h3 class="font-bold text-indigo-900 mb-2">整體評語</h3>
        <p class="text-indigo-800">{{ result.feedback }}</p>
      </div>
      
      <!-- Detailed Result -->
      <div class="prose prose-indigo max-w-none mb-8" v-html="renderedResult"></div>
    </div>

    <div v-else class="space-y-4 mb-8">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">座號</label>
          <input 
            v-model="editSeatNumber" 
            type="text" 
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input 
            v-model="editStudentName" 
            type="text" 
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">整體評語</label>
        <textarea 
          v-model="editFeedback" 
          rows="3"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">詳細批改結果 (Markdown)</label>
        <textarea 
          v-model="editDetailedResult" 
          rows="10"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border font-mono"
        ></textarea>
      </div>
      <div class="flex justify-end gap-2">
        <button 
          @click="cancelEdit"
          class="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <X class="w-4 h-4" /> 取消
        </button>
        <button 
          @click="saveEdits"
          class="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Save class="w-4 h-4" /> 儲存修改
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="!isEditing" class="flex justify-end border-t pt-4">
      <button 
        @click="$emit('save-to-sheets', result)"
        class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        儲存至 Google 試算表
      </button>
    </div>
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
