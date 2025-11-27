<script setup>
import { ref } from 'vue';
import ApiKeyInput from '../components/ApiKeyInput.vue';
import AnswerUploader from '../components/AnswerUploader.vue';
import AnswerEditor from '../components/AnswerEditor.vue';
import ExamCamera from '../components/ExamCamera.vue';
import GradingResult from '../components/GradingResult.vue';
import { gradeExam, extractAnswerFromPdf } from '../utils/gemini';
import { Loader2 } from 'lucide-vue-next';

const answerFile = ref(null);
const extractedAnswerText = ref('');
const isEditingAnswer = ref(false);
const isAnswerConfirmed = ref(false);

const examImages = ref([]);
const gradingResult = ref(null);
const isLoading = ref(false);
const loadingMessage = ref('');
const error = ref(null);

const handleFileSelected = (file) => {
  answerFile.value = file;
  extractedAnswerText.value = '';
  isEditingAnswer.value = false;
  isAnswerConfirmed.value = false;
};

const handleExtractText = async () => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    alert('請先輸入並儲存 API Key');
    return;
  }
  if (!answerFile.value) return;

  isLoading.value = true;
  loadingMessage.value = '正在解析解答 PDF...';
  error.value = null;

  try {
    const text = await extractAnswerFromPdf(apiKey, answerFile.value);
    extractedAnswerText.value = text;
    isEditingAnswer.value = true;
  } catch (err) {
    error.value = '解析 PDF 失敗，請稍後再試。';
    console.error(err);
  } finally {
    isLoading.value = false;
    loadingMessage.value = '';
  }
};

const handleAnswerConfirmed = (text) => {
  extractedAnswerText.value = text;
  isEditingAnswer.value = false;
  isAnswerConfirmed.value = true;
};

const handleCancelEdit = () => {
  isEditingAnswer.value = false;
  extractedAnswerText.value = '';
  answerFile.value = null; // Reset file selection to allow re-upload
};

const handleImagesUpdated = (images) => {
  examImages.value = images;
};

const startGrading = async () => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    alert('請先輸入並儲存 API Key');
    return;
  }
  if (!isAnswerConfirmed) {
    alert('請先解析並確認解答');
    return;
  }
  if (examImages.value.length === 0) {
    alert('請拍攝或上傳考卷圖片');
    return;
  }

  isLoading.value = true;
  loadingMessage.value = '正在批改考卷...';
  error.value = null;
  gradingResult.value = null;

  try {
    const result = await gradeExam(apiKey, extractedAnswerText.value, examImages.value);
    gradingResult.value = result;
  } catch (err) {
    error.value = '批改過程中發生錯誤，請檢查 API Key 是否正確，或稍後再試。';
    console.error(err);
  } finally {
    isLoading.value = false;
    loadingMessage.value = '';
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">AI 智慧閱卷助手</h2>
      <p class="text-gray-600">上傳解答與考卷，讓 AI 為您自動批改與評分</p>
    </div>

    <ApiKeyInput />
    
    <div v-if="!isAnswerConfirmed && !isEditingAnswer">
      <AnswerUploader 
        @file-selected="handleFileSelected" 
        @extract-text="handleExtractText"
      />
    </div>

    <AnswerEditor 
      v-if="isEditingAnswer"
      :initial-answer-text="extractedAnswerText"
      @answer-confirmed="handleAnswerConfirmed"
      @cancel="handleCancelEdit"
    />
    
    <div v-if="isAnswerConfirmed">
      <div class="bg-green-50 px-4 py-3 rounded-md border border-green-200 mb-6 flex items-center justify-between">
        <span class="text-green-700 font-medium">解答已確認</span>
        <button @click="isEditingAnswer = true; isAnswerConfirmed = false" class="text-sm text-green-700 underline hover:text-green-800">
          修改解答
        </button>
      </div>

      <ExamCamera @images-updated="handleImagesUpdated" />

      <div class="flex justify-center my-8">
        <button 
          @click="startGrading"
          :disabled="isLoading || examImages.length === 0"
          class="px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          {{ isLoading ? loadingMessage : '開始批改考卷' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading && !isEditingAnswer && !gradingResult" class="text-center py-8">
       <p class="text-gray-500">{{ loadingMessage }}</p>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
      {{ error }}
    </div>

    <GradingResult v-if="gradingResult" :result="gradingResult" />
  </div>
</template>
