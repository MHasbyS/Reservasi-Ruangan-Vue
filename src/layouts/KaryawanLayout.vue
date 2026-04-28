<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navbar -->
    <Navbar />

    <div class="flex flex-1 pt-[64px] relative">
      <!-- Sidebar -->
      <!-- <Sidebar class="z-30" /> -->

      <!-- Konten utama -->
      <main class="flex-1 p-8 mb-20 transition-all duration-300">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
// import Sidebar from "@/components/Sidebar.vue";
</script>
