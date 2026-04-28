<script setup>
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRoute, useRouter } from 'vue-router';
import roomService from '@/services/RoomService';
import reservationService from '@/services/reservationService';

const router = useRouter();
const route = useRoute();

// STATE
const loading = ref(false);
const loadingRooms = ref(false);

const rooms = ref([]);
const room_id = ref('');
const date = ref('');
const start_time = ref('');
const end_time = ref('');
const error = ref(null);

// Fetch Rooms
const fetchRooms = async () => {
  loadingRooms.value = true;
  try {
    const res = await roomService.getRooms();
    rooms.value = res.data.data?.data ?? res.data.data ?? res.data;
  } catch (err) {
    console.error("Gagal mengambil data ruangan:", err);
    error.value = err.response?.data?.message || err.message;
  } finally {
    loadingRooms.value = false;
  }
};

// Submit form
const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  try {
    const payload = {
      room_id: room_id.value,
      date: date.value,
      start_time: start_time.value,
      end_time: end_time.value,
    };

    const res = await reservationService.createReservation(payload);

    if (res.status === 200 || res.status === 201) {
      router.push({ name: 'home' });
    }
  } catch (err) {
    console.error("Error occurred:", err);
    error.value = err.response?.data?.message || "Terjadi kesalahan."
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRooms();
  if (route.query.date) {
  date.value = route.query.date
}
});
</script>

<template>
  <div class="p-8 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">Reservasi</h1>

    <Card>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleSubmit">

          <!-- Ruangan -->
          <div>
            <label class="block text-lg mb-1">Ruangan</label>

            <select
              v-model="room_id"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-700"
              required
            >
              <option disabled value="">
                {{ loadingRooms ? "Memuat ruangan..." : "Pilih ruangan" }}
              </option>

              <option
                v-for="room in rooms"
                :key="room.id"
                :value="room.id"
              >
                {{ room.name }} (kapasitas {{ room.capacity }})
              </option>
            </select>

            <p v-if="rooms.length === 0 && !loadingRooms" class="text-sm text-red-500 mt-1">
              Tidak ada ruangan tersedia.
            </p>
          </div>

          <!-- Tanggal -->
          <div>
            <label class="block text-lg mb-1">Tanggal</label>
            <input
              type="date"
              v-model="date"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-700"
              required
            />
          </div>

          <!-- Jam Mulai & Selesai -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-lg mb-1">Jam Mulai</label>
              <input
                type="time"
                v-model="start_time"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-700"
                required
              />
            </div>

            <div>
              <label class="block text-lg mb-1">Jam Selesai</label>
              <input
                type="time"
                v-model="end_time"
                :min="start_time"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-700"
                required
              />
            </div>
          </div>

          <!-- Error -->
          <p v-if="error" class="text-sm text-red-600">
            {{ error }}
          </p>

          <!-- Actions -->
          <CardFooter class="flex justify-end space-x-2">
            <button
              type="submit"
              class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition disabled:opacity-50"
              :disabled="loading"
            >
              {{ loading ? 'Menyimpan...' : 'Simpan' }}
            </button>

            <router-link :to="{ name: 'home' }">
              <button
                type="button"
                class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Batal
              </button>
            </router-link>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
