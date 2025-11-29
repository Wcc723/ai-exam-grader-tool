<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AnswerUploader from '../components/AnswerUploader.vue';
import AnswerEditor from '../components/AnswerEditor.vue';
import ExamCamera from '../components/ExamCamera.vue';
import GradingResult from '../components/GradingResult.vue';
import { gradeExam, extractAnswerFromPdf } from '../utils/gemini';
import { storage } from '../utils/storage';
import { googleSheets } from '../utils/googleSheets';
import { Loader2 } from 'lucide-vue-next';

const router = useRouter();

// State
const answerFile = ref(null);
const extractedAnswerText = ref('');
const isEditingAnswer = ref(false);
const isAnswerConfirmed = ref(false);

const examImages = ref([]);
const gradingResult = ref(null);
const isLoading = ref(false);
const loadingMessage = ref('');
const error = ref(null);

// New State for V2
const worksheets = ref([]);
const selectedSheetId = ref('');
const seatNumber = ref('');
const isSheetsLoading = ref(false);

// Computed
const canStartGrading = computed(() => {
  return isAnswerConfirmed.value && 
         examImages.value.length > 0 && 
         seatNumber.value;
});

// Lifecycle
onMounted(async () => {
  // Check API Key
  const apiKey = storage.getGeminiApiKey();
  if (!apiKey) {
    router.push('/setup');
    return;
  }

  // Load Answer Key from Storage
  const savedAnswer = storage.getAnswerKey();
  if (savedAnswer) {
    extractedAnswerText.value = savedAnswer;
    isAnswerConfirmed.value = true;
  }

  // Fetch Worksheets
  await loadWorksheets();
});

const loadWorksheets = async () => {
  const sheetLink = storage.getGoogleSheetLink();
  if (!sheetLink) return;

  const spreadsheetId = googleSheets.extractSpreadsheetId(sheetLink);
  if (!spreadsheetId) {
    error.value = '無效的 Google 試算表連結';
    return;
  }

  isSheetsLoading.value = true;
  try {
    // Ensure auth
    if (!googleSheets.isInitialized) {
       const clientId = storage.getGoogleClientId();
       if (clientId) {
         await googleSheets.init(clientId);
       } else {
         error.value = '請先至設定頁面輸入 Google Client ID';
         return;
       }
    }
    
    // Check login
    if (!storage.getGoogleToken()) {
      // Try to login silently or prompt? 
      // For now, if not logged in, we might show a button or just fail.
      // But SetupView should have handled login.
      // If token expired, we might need to re-login.
    }

    worksheets.value = await googleSheets.fetchWorksheets(spreadsheetId);
    if (worksheets.value.length > 0) {
      selectedSheetId.value = worksheets.value[0].id;
    }
  } catch (err) {
    console.error('Failed to load worksheets:', err);
    error.value = '無法讀取試算表，請確認您已登入 Google 且連結正確。';
  } finally {
    isSheetsLoading.value = false;
  }
};

// Handlers
const handleFileSelected = (file) => {
  answerFile.value = file;
  extractedAnswerText.value = '';
  isEditingAnswer.value = false;
  isAnswerConfirmed.value = false;
};

const handleExtractText = async () => {
  const apiKey = storage.getGeminiApiKey();
  if (!apiKey) return;
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
  // Save to storage
  storage.setAnswerKey(text);
};

const handleCancelEdit = () => {
  isEditingAnswer.value = false;
  // If we had a saved answer, revert to it? Or clear?
  // For now, let's just keep what we have or clear if it was a new upload.
  if (!isAnswerConfirmed.value) {
    extractedAnswerText.value = '';
    answerFile.value = null;
  }
};

const handleImagesUpdated = (images) => {
  examImages.value = images;
};

const startGrading = async () => {
  const apiKey = storage.getGeminiApiKey();
  if (!apiKey) return;

  isLoading.value = true;
  loadingMessage.value = '正在批改考卷...';
  error.value = null;
  gradingResult.value = null;

  try {
    const result = await gradeExam(apiKey, extractedAnswerText.value, examImages.value);
    
    // Merge user input seat number into result for consistency
    result.seatNumber = seatNumber.value;
    
    gradingResult.value = result;
  } catch (err) {
    error.value = '批改過程中發生錯誤，請檢查 API Key 是否正確，或稍後再試。';
    console.error(err);
  } finally {
    isLoading.value = false;
    loadingMessage.value = '';
  }
};

const handleSaveToSheets = async (resultData) => {
  const sheetLink = storage.getGoogleSheetLink();
  const spreadsheetId = googleSheets.extractSpreadsheetId(sheetLink);
  const sheet = worksheets.value.find(s => s.id === selectedSheetId.value);
  
  if (!spreadsheetId || !sheet) {
    alert('無法儲存：找不到試算表資訊');
    return;
  }

  isLoading.value = true;
  loadingMessage.value = '正在儲存至 Google 試算表...';
  
  try {
    // Format: Seat No, Timestamp, Name, Score, Feedback, Detailed Result
    const timestamp = new Date().toLocaleString();
    const values = [
      seatNumber.value,
      timestamp,
      resultData.studentName || '',
      resultData.score,
      resultData.feedback,
      resultData.detailedResult || ''
    ];
    
    await googleSheets.appendRow(spreadsheetId, sheet.title, values);
    alert('儲存成功！');
    
    // Optional: Clear for next student?
    // seatNumber.value = '';
    // examImages.value = [];
    // gradingResult.value = null;
  } catch (err) {
    console.error(err);
    alert('儲存失敗，請檢查 Console。');
  } finally {
    isLoading.value = false;
    loadingMessage.value = '';
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">AI 智慧閱卷助手</h2>
      <p class="text-gray-600">選擇班級、輸入座號，開始批改</p>
    </div>

    <!-- Step 1: Answer Key -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <span class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2">Step 1</span>
        確認解答
      </h3>
      
      <div v-if="!isAnswerConfirmed && !isEditingAnswer">
        <AnswerUploader 
          @file-selected="handleFileSelected" 
          @extract-text="handleExtractText"
          :is-extracting="isLoading"
        />
      </div>

      <AnswerEditor 
        v-if="isEditingAnswer"
        :initial-answer-text="extractedAnswerText"
        @answer-confirmed="handleAnswerConfirmed"
        @cancel="handleCancelEdit"
      />
      
      <div v-if="isAnswerConfirmed">
        <div class="bg-green-50 px-4 py-3 rounded-md border border-green-200 flex items-center justify-between">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-green-700 font-medium">解答已就緒</span>
          </div>
          <button @click="isEditingAnswer = true; isAnswerConfirmed = false" class="text-sm text-green-700 underline hover:text-green-800">
            檢視或修改
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Grading Info -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <span class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2">Step 2</span>
        學生資訊與作業
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Worksheet Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">選擇班級 (工作表)</label>
          <select 
            v-model="selectedSheetId"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            :disabled="isSheetsLoading || worksheets.length === 0"
          >
            <option value="" disabled>請選擇工作表</option>
            <option v-for="sheet in worksheets" :key="sheet.id" :value="sheet.id">
              {{ sheet.title }}
            </option>
          </select>
          <p v-if="isSheetsLoading" class="text-xs text-gray-500 mt-1">正在載入工作表...</p>
        </div>

        <!-- Seat Number Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">學生座號 <span class="text-red-500">*</span></label>
          <input 
            v-model="seatNumber"
            type="text" 
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="例如：10"
          />
        </div>
      </div>

      <!-- Camera/Upload -->
      <ExamCamera @images-updated="handleImagesUpdated" />

      <!-- Start Grading Button -->
      <div class="flex justify-center mt-8">
        <button 
          @click="startGrading"
          :disabled="isLoading || !canStartGrading"
          class="px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          {{ isLoading ? loadingMessage : '開始批改考卷' }}
        </button>
      </div>
      
      <div v-if="!canStartGrading && !isLoading" class="text-center mt-2 text-sm text-red-500">
        請完成所有步驟：確認解答、選擇班級、輸入座號、上傳作業
      </div>
    </div>

    <!-- Loading & Error -->
    <div v-if="isLoading && !isEditingAnswer && !gradingResult" class="text-center py-8">
       <p class="text-gray-500">{{ loadingMessage }}</p>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
      {{ error }}
    </div>

    <!-- Result -->
    <GradingResult 
      v-if="gradingResult" 
      :result="gradingResult" 
      @save-to-sheets="handleSaveToSheets"
    />
  </div>
</template>
