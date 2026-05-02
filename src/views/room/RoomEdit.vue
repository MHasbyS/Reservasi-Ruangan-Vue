<script setup>
import { useRoomStore } from '@/stores/room';
import { onMounted, ref } from 'vue';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const roomStore = useRoomStore();

const name = ref('');
const capacity = ref('');
const description = ref('');
const status = ref('inactive');
const loading = ref(false);
const message = ref('');
const error = ref(null);

const showMessage = (msg) => {
  message.value = msg;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const fetchRoom = async () => {
  loading.value = true;
  message.value = '';
  error.value = null;

  try {
    const room = await roomStore.fetchRoomById(route.params.id);

    name.value = room.name;
    capacity.value = room.capacity;
    description.value = room.description;
    status.value = room.status;
  } catch (err) {
    console.error('gagal mengambil data', err);
  } finally {
    loading.value = false;
  }
}

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    const roomData = {
      name: name.value,
      capacity: capacity.value,
      description: description.value,
      status: status.value
    };
    
    const response = await roomStore.updateRoom(route.params.id, roomData);

    if (response) {
      showMessage('Ruangan berhasil diperbaharui');
      router.push({ name: 'RoomIndex' });
    }
  } catch (err) {
    console.error("❌ Error occurred:", err);
    error.value = err.response?.data?.message || "Terjadi kesalahan.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchRoom();
})
</script>

<template>
  <div class="p-8 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">edit Ruangan</h1>
    <Card class="w-full">
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-lg font-sans mb-1">Nama Ruangan</label>
            <input type="text" v-model="name" placeholder="Contoh: Ruang Rapat 1"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700" />
          </div>

          <div>
            <label class="block text-lg font-sans  mb-1">Kapasitas</label>
            <input type="number" v-model="capacity" placeholder="Contoh: 20"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700" />
          </div>
          <div>
            <label class="block text-lg font-sans mb-1" for="">Keterangan</label>
            <input type="text" v-model="description" placeholder="Keterangan"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700 ">
          </div>

          <div>
            <label class="block text-lg font-sans mb-2">Status</label>
            <div class="flex items-center space-x-6">
              <!-- Aktif -->
              <label for="active" class="flex items-center cursor-pointer space-x-2">
                <input type="radio" name="status" id="active" value="active" v-model="status" class="hidden peer" />
                <span
                  class="w-4 h-4 inline-block border border-gray-400 rounded peer-checked:bg-green-500 transition"></span>
                <span class="text-gray-700">Aktif</span>
              </label>

              <!-- Tidak Aktif -->
              <label for="inactive" class="flex items-center cursor-pointer space-x-2">
                <input type="radio" name="status" id="inactive" value="inactive" v-model="status" class="hidden peer" />
                <span
                  class="w-4 h-4 inline-block border border-gray-400 rounded peer-checked:bg-red-500 transition"></span>
                <span class="text-gray-700">Tidak Aktif</span>
              </label>
            </div>
          </div>
          <CardFooter class="flex justify-end space-x-2">
            <button type="submit"
              class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 cursor-pointer transition"
              :disabled="loading">
              {{ loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
            <RouterLink :to="{ name: 'RoomIndex' }"
              class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition inline-block text-center">
              Batal
            </RouterLink>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
