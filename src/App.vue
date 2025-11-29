<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 class="text-xl font-bold text-indigo-600">拍照改考卷工具</h1>
        <nav class="flex gap-4">
          <RouterLink 
            to="/setup" 
            class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-indigo-600 bg-indigo-50"
          >
            環境設定
          </RouterLink>
          <RouterLink 
            to="/grading" 
            class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-indigo-600 bg-indigo-50"
          >
            作業批改
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <RouterView />
    </main>

    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
        &copy; 2024 Exam Grading Tool
      </div>
    </footer>
  </div>
</template>
