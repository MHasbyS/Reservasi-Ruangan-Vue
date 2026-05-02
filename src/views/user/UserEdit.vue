<script setup>
import { useUserStore } from '@/stores/user';
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const name = ref('');
const email = ref('');
const role = ref('');
const roles = ref(['admin', 'karyawan']);
const password = ref('');
const loading = ref(false);
const message = ref('');
const error = ref(null);

const showMessage = (msg) => {
  message.value = msg;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const fetchUsers = async () => {
  loading.value = true;
  message.value = '';
  error.value = null;

  try {
    const user = await userStore.fetchUserById(route.params.id);

    name.value = user.name;
    email.value = user.email;
    // password.value = user.password;
    role.value = user.role;
  } catch (err) {
    console.error('gagal mengambil data', err);
  } finally {
    loading.value = false;
  }
}


const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  // console.log('submit', user.value);

  try {
    const user = {
      name: name.value,
      email: email.value,
      role: role.value,
      ...(password.value ? { password: password.value } : {}),
    };

    const response = await userStore.updateUser(route.params.id, user);

    if (response) {
      showMessage('User berhasil diperbaharui');
      router.push({ name: 'UserIndex' });
    }
  } catch (err) {
    console.error("❌ Error occurred:", err);
    error.value = err.response?.data?.message || "Terjadi kesalahan.";
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  fetchUsers();
})
</script>

<template>
  <div class="p-8 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">Edit User</h1>
    <Card class="w-full">
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-lg font-sans mb-1">Nama</label>
            <input type="text" v-model="name" placeholder="user"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700" />
          </div>

          <div>
            <label class="block text-lg font-sans  mb-1">Email</label>
            <input type="email" v-model="email" placeholder="email"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700" />
          </div>
          <div>
            <label class="block text-lg font-sans mb-1" for="">Password</label>
            <input type="password" v-model="password" placeholder="password"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700 ">
          </div>
          <div>
            <label class="block text-lg font-sans mb-1" for="">Role</label>
            <select v-model="role"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700 ">
              <option value="" disabled>Pilih Role</option>
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <CardFooter class="flex justify-end space-x-2">
            <button type="submit"
              class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 cursor-pointer transition"
              :disabled="loading">
              {{ loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
            <RouterLink :to="{ name: 'UserIndex' }"
              class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition inline-block text-center">
              Batal
            </RouterLink>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
