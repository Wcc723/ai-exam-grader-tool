<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storage } from '../utils/storage';
import { googleSheets } from '../utils/googleSheets';

const router = useRouter();

const geminiApiKey = ref('');
const googleSheetLink = ref('');
const googleClientId = ref('');
const isGoogleAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref('');

// Load existing values
onMounted(() => {
  geminiApiKey.value = storage.getGeminiApiKey() || '';
  googleSheetLink.value = storage.getGoogleSheetLink() || '';
  googleClientId.value = storage.getGoogleClientId() || '';
  
  // Check if we have a valid token (simple check)
  if (storage.getGoogleToken()) {
    isGoogleAuthenticated.value = true;
  }
});

const handleGoogleLogin = async () => {
  if (!googleClientId.value) {
    error.value = '請先輸入 Google Client ID';
    return;
  }

  isLoading.value = true;
  error.value = '';
  try {
    // Initialize with the provided Client ID
    await googleSheets.init(googleClientId.value);
    
    await googleSheets.login();
    isGoogleAuthenticated.value = true;
    
    // Auto save Client ID on successful login attempt (or just before)
    storage.setGoogleClientId(googleClientId.value);
  } catch (err) {
    console.error(err);
    error.value = 'Google 登入失敗，請檢查 Client ID 是否正確，以及 Console 錯誤訊息。';
  } finally {
    isLoading.value = false;
  }
};

const saveSettings = () => {
  if (!geminiApiKey.value) {
    error.value = '請輸入 Gemini API Key';
    return;
  }
  if (!googleSheetLink.value) {
    error.value = '請輸入 Google 試算表連結';
    return;
  }
  if (!googleClientId.value) {
    error.value = '請輸入 Google Client ID';
    return;
  }
  
  storage.setGeminiApiKey(geminiApiKey.value);
  storage.setGoogleSheetLink(googleSheetLink.value);
  storage.setGoogleClientId(googleClientId.value);
  
  router.push('/grading');
};
</script>

<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6 text-gray-900">環境設定</h1>
    
    <div class="bg-white shadow rounded-lg p-6 space-y-6">
      <!-- Gemini API Key -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
        <input 
          v-model="geminiApiKey"
          type="password" 
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="輸入您的 Gemini API Key"
        />
        <p class="mt-1 text-sm text-gray-500">
          還沒有 Key？<a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-indigo-600 hover:text-indigo-500">點此取得</a>
        </p>
      </div>

      <!-- Google Client ID -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Google Client ID</label>
        <input 
          v-model="googleClientId"
          type="text" 
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="輸入您的 Google OAuth Client ID"
        />
        <p class="mt-1 text-sm text-gray-500">
          需至 Google Cloud Console 建立 OAuth Client ID (Web Application)
        </p>
      </div>

      <!-- Google Sheet Link -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Google 試算表連結</label>
        <input 
          v-model="googleSheetLink"
          type="text" 
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="https://docs.google.com/spreadsheets/d/..."
        />
      </div>

      <!-- Google Auth -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Google 帳號授權</h3>
        <div class="flex items-center justify-between bg-gray-50 p-4 rounded-md">
          <div>
            <p class="text-sm text-gray-700 font-medium">
              狀態：
              <span :class="isGoogleAuthenticated ? 'text-green-600' : 'text-gray-500'">
                {{ isGoogleAuthenticated ? '已授權' : '未授權' }}
              </span>
            </p>
            <p class="text-xs text-gray-500 mt-1">
              需要授權以存取您的 Google 試算表
            </p>
          </div>
          <button 
            @click="handleGoogleLogin"
            :disabled="isGoogleAuthenticated || isLoading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ isGoogleAuthenticated ? '已登入' : '登入 Google' }}
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded">
        {{ error }}
      </div>

      <!-- Save Button -->
      <div class="flex justify-end pt-4">
        <button 
          @click="saveSettings"
          class="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          儲存並開始
        </button>
      </div>
    </div>
  </div>
</template>
