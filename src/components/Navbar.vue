<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { onMounted, ref } from "vue";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Avatar from "./ui/avatar/Avatar.vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import userService from "@/services/UserService";

const userName = ref("");

const fetchUser = async () => {
  try {
    const res = await userService.getProfile();
    userName.value = res.data.data.name;   // sesuaikan struktur API
  } catch (err) {
    console.error("Gagal mengambil profil user:", err);
  }
};

defineProps({
  isOpen: Boolean
});

const router = useRouter();
const authStore = useAuthStore();
function handleLogout(){
  authStore.logout();
  router.push({name:"Login"})
}
onMounted (()=>{
  fetchUser();
})
</script>
<template>
  <header
    class="fixed top-0 left-0 w-full bg-white shadow-sm border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">

    <div class="flex items-center space-x-3">
      <!-- <button class="p-2 rounded-md" @click="$emit('toggle-sidebar')">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button> -->

      <!-- Logo + Judul -->
      <div class="flex items-center space-x-2">
        <div class="w-10 h-10 sm:w-12 sm:h-12 flex items-center">
          <img src="@/assets/images/Logo.png" alt="Logo" class="w-full h-auto object-contain" />
        </div>
        <div class="hidden sm:block">
          <h1 class="text-base sm:text-xl font-bold text-gray-800 leading-tight">
            Reservasi Ruangan
          </h1>
          <p class="text-gray-500 text-xs sm:text-sm">Booking Fleksibel & Mudah</p>
        </div>
      </div>
    </div>

    <!-- Kanan: Dropdown User -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <div
          class="flex items-center bg-gray-200 rounded-md px-2 sm:px-3 py-2 cursor-pointer hover:bg-gray-300 transition">
          <Avatar class="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full overflow-hidden">
            <img src="@/assets/hoshino.jpg" alt="User Avatar" />
          </Avatar>
          <span class="ml-2 sm:ml-3 text-gray-800 font-medium text-sm sm:text-base xs:block">
            Hi, {{ userName || 'user' }}
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <RouterLink to="/profile">Profile</RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem @click="handleLogout">Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>
