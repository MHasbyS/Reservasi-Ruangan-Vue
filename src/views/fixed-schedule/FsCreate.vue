<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Clock, Building2 } from 'lucide-vue-next';
import { useFixedScheduleStore } from '@/stores/fixedSchedule';
import { useRoomStore } from '@/stores/room';

const router = useRouter();
const scheduleStore = useFixedScheduleStore();
const roomStore = useRoomStore();

const day_of_week = ref('');
const start_time = ref('');
const end_time = ref('');
const rooms = ref([]);
const selectedRoom = ref('');
const description = ref('');
const loading = ref(false);
const message = ref('');
const error = ref(null);
const days = ref([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

const showMessage = (msg) => {
  message.value = msg;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const fetchRooms = async () => {
  loading.value = true;
  error.value = null;

  try {
    const result = await roomStore.fetchRooms({ limit: 100 });
    rooms.value = result.rooms;
  } catch (err) {
    console.error("Gagal mengambil data ruangan:", err);
    error.value = err.response?.data?.message || err.message;
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    const scheduleData = {
      day_of_week: day_of_week.value,
      start_time: start_time.value,
      end_time: end_time.value,
      room_id: selectedRoom.value || null,
      description: description.value
    };

    const response = await scheduleStore.createFixedSchedule(scheduleData);

    if (response) {
      showMessage('Jadwal tetap berhasil ditambahkan');
      router.push({ name: 'FsIndex' });
    }
  } catch (err) {
    console.error("Error occurred:", err);
    error.value = err.response?.data?.message || "Terjadi kesalahan.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRooms();
});
</script>

<template>
  <div class="p-8 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">Tambah Jadwal tetap</h1>
    <Card>
      <CardContent>
        <form action="" @submit.prevent="handleSubmit">
          <h1 class="font-bold text-2xl">Keterangan</h1>
          <hr class="w-full h-1 mx-auto my-4 bg-gray-200 border-0 rounded-sm md:my-5 dark:bg-gray-700">
          <div class="flex items-center ">
            <Clock class="mr-2" />
            <select v-model="day_of_week" class="border-2 border-gray-200 p-2 rounded w-fit">
              <option value="" disabled>Pilih Hari</option>
              <option v-for="day in days" :key="day" :value="day">
                {{ day }}
              </option>
            </select>
            <input type="time" v-model="start_time"
              class="border-2 border-gray-200 p-2 rounded mx-2 w-fit no-time-icon " />
            <span class="flex items-center">-</span>
            <input type="time" v-model="end_time"
              class="border-2 border-gray-200 p-2 rounded mx-2 w-fit no-time-icon" />
          </div>

          <div class="mt-4 flex items-center">
            <Building2 class="mr-2" />
            <select v-model="selectedRoom" class="border p-2 rounded w-full">
              <option value="" disabled selected>Pilih Ruangan</option>
              <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.name }}</option>
            </select>
          </div>
          <div class="mt-4">
            <textarea v-model="description" placeholder="Masukan Keterangan " class="border p-2 rounded w-full">

            </textarea>
          </div>
          <CardFooter class="flex justify-end space-x-2">
            <button type="submit"
              class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 cursor-pointer transition"
              :disabled="loading">
              {{ loading ? 'Menyimpan' : 'simpan' }}
            </button>
            <router-link :to="{ name: 'FsIndex' }">
              <button type="button"
                class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer transition">
                batal
              </button>
            </router-link>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.no-time-icon::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
</style>
