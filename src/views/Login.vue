<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/counter.js';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);

const router = useRouter();

const userStore = useUserStore();

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  try {
    const role = await userStore.login(email.value, password.value);
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/home');
    }
  } catch (err) {
    error.value = err.message || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
}

const imageUrl = ref('https://lirp.cdn-website.com/5b0a5aef/dms3rep/multi/opt/modern-interior-meeting-room-marketing-office-with-evening-sunset-empty-large-loft-style-conference-space-with-chairs-tables-furniture-clean-glass-windows-1920w.jpg');
function handleError() {
  imageUrl.value = new URL('@/assets/images/image1.jpg', import.meta.url).href
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <!-- Frame utama -->
    <div
      class="flex justify-between w-[1200px] h-[650px] m-5 bg-white border-2 border-gray-200 rounded-[50px] overflow-hidden shadow-sm">

      <!-- Kolom kiri -->
      <div class="flex flex-col justify-center w-[600px] ml-10 px-16 flex-shrink-0">
        <h1 class="text-3xl text-center font-semibold text-gray-800 mb-2">Login</h1>
        <p class="text-center text-gray-500 mb-10">
          Masuk untuk memesan ruang pertemuan
        </p>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input v-model="email" type="text" placeholder="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700" />
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="text-sm font-semibold text-gray-700">
                Password
              </label>
              <a href="#" class="text-sm text-cyan-700 hover:underline">
                Forgot your password?
              </a>
            </div>
            <input v-model="password" type="password" placeholder="password"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700" />
          </div>

          <button type="submit"
            class="w-full py-3 bg-cyan-700 text-white rounded-md font-medium hover:bg-cyan-800 transition cursor-pointer">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <div class="flex items-center justify-center space-x-4 mt-6">
            <button type="button"
              class="flex items-center justify-center w-full border border-gray-300 rounded-md py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <img src="@/assets/icons/google-icon.png" alt="Google" class="w-5 h-5 mr-2" />
              Login with Google
            </button>
            <button type="button"
              class="flex items-center justify-center w-full border border-gray-300 rounded-md py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <img src="@/assets/icons/apple-icon.png" alt="Apple" class="w-5 h-5 mr-2" />
              Login with Apple
            </button>
          </div>
        </form>
      </div>

      <!-- Kolom kanan -->
      <div
        class="flex items-center justify-center w-[450px] h-[600px] bg-gray-200 rounded-[50px] overflow-hidden mr-5 mt-5 flex-shrink-0">
        <img :src="imageUrl" @error="handleError" alt="meeting room"
          class="w-full h-full object-cover object-[-240px]" />
      </div>
    </div>
  </div>
</template>

<style></style>
