<script setup>
import { ref } from 'vue';
import { FileUp, FileText, X } from 'lucide-vue-next';

const emit = defineEmits(['file-selected', 'extract-text']);
const selectedFile = ref(null);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file;
    emit('file-selected', file);
  } else {
    alert('請上傳 PDF 格式的檔案');
  }
};

const removeFile = () => {
  selectedFile.value = null;
  emit('file-selected', null);
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <div class="flex items-center gap-2 mb-4">
      <FileText class="w-5 h-5 text-indigo-600" />
      <h2 class="text-lg font-semibold text-gray-800">上傳正確解答 (PDF)</h2>
    </div>

    <div v-if="!selectedFile" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
      <input 
        type="file" 
        accept="application/pdf"
        @change="handleFileChange"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <FileUp class="w-10 h-10 text-gray-400 mx-auto mb-2" />
      <p class="text-gray-600">點擊或拖曳檔案至此</p>
      <p class="text-xs text-gray-400 mt-1">支援 PDF 格式</p>
    </div>

    <div v-else class="flex items-center justify-between bg-indigo-50 px-4 py-3 rounded-md border border-indigo-200">
      <div class="flex items-center gap-3">
        <FileText class="w-5 h-5 text-indigo-600" />
        <span class="text-indigo-900 font-medium truncate max-w-[200px]">{{ selectedFile.name }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="$emit('extract-text')"
          class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
        >
          解析解答
        </button>
        <button 
          @click="removeFile"
          class="p-1 hover:bg-indigo-100 rounded-full text-gray-500 hover:text-red-500 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
