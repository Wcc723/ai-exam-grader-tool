<script setup>
import { ref, onMounted } from 'vue';
import { Key } from 'lucide-vue-next';

const apiKey = ref('');
const isSaved = ref(false);

onMounted(() => {
  const savedKey = localStorage.getItem('gemini_api_key');
  if (savedKey) {
    apiKey.value = savedKey;
    isSaved.value = true;
  }
});

const saveKey = () => {
  if (apiKey.value.trim()) {
    localStorage.setItem('gemini_api_key', apiKey.value.trim());
    isSaved.value = true;
  }
};

const clearKey = () => {
  localStorage.removeItem('gemini_api_key');
  apiKey.value = '';
  isSaved.value = false;
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <div class="flex items-center gap-2 mb-4">
      <Key class="w-5 h-5 text-indigo-600" />
      <h2 class="text-lg font-semibold text-gray-800">Gemini API Key</h2>
    </div>
    
    <div v-if="!isSaved" class="flex gap-2">
      <input 
        v-model="apiKey"
        type="password" 
        placeholder="輸入您的 Gemini API Key"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      />
      <button 
        @click="saveKey"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        儲存
      </button>
    </div>

    <div v-else class="flex items-center justify-between bg-green-50 px-4 py-2 rounded-md border border-green-200">
      <span class="text-green-700 flex items-center gap-2">
        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
        API Key 已儲存
      </span>
      <button 
        @click="clearKey"
        class="text-sm text-gray-500 hover:text-red-600 underline"
      >
        移除
      </button>
    </div>
    <p class="mt-2 text-xs text-gray-500">
      您的 API Key 僅會儲存在瀏覽器中，不會傳送至任何伺服器。
    </p>
  </div>
</template>
