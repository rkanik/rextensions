<script setup lang="ts">
import { Toaster } from './components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <TooltipProvider>
    <Toaster />
    <div class="w-[400px] h-[500px] flex flex-col overflow-hidden flex-1">
      <RouterView />
    </div>
  </TooltipProvider>
</template>
