<script setup>
import { ref } from 'vue';
import { Camera, Image as ImageIcon, X, Plus } from 'lucide-vue-next';

const emit = defineEmits(['images-updated']);
const images = ref([]);

const handleImageChange = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    // Filter for images
    const newImages = files.filter(file => file.type.startsWith('image/'));
    images.value = [...images.value, ...newImages];
    emit('images-updated', images.value);
  }
};

const removeImage = (index) => {
  images.value.splice(index, 1);
  emit('images-updated', images.value);
};

const getImageUrl = (file) => {
  return URL.createObjectURL(file);
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <div class="flex items-center gap-2 mb-4">
      <Camera class="w-5 h-5 text-indigo-600" />
      <h2 class="text-lg font-semibold text-gray-800">拍攝/上傳考卷</h2>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
      <div v-for="(img, index) in images" :key="index" class="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 group">
        <img :src="getImageUrl(img)" class="w-full h-full object-cover" />
        <button 
          @click="removeImage(index)"
          class="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-red-500 hover:text-white transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
        <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center truncate">
          第 {{ index + 1 }} 頁
        </div>
      </div>

      <!-- Add Button -->
      <div class="relative aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-indigo-50">
        <input 
          type="file" 
          accept="image/*" 
          multiple
          capture="environment"
          @change="handleImageChange"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Plus class="w-8 h-8 text-gray-400 mb-2" />
        <span class="text-sm text-gray-500 font-medium">新增頁面</span>
      </div>
    </div>
    
    <p class="text-xs text-gray-500">
      支援多頁拍攝。請確保光線充足，字跡清晰。
    </p>
  </div>
</template>
