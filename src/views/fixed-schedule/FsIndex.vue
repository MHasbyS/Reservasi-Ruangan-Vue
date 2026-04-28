<script setup>
import Footer from '@/components/Footer.vue';
import { ref, onMounted } from 'vue';
import fixedSchedulesService from '@/services/fixedSchedulesService';
import { CalendarPlus } from 'lucide-vue-next';

const schedules = ref([]);
const selectedId = ref(null);
const popupMode = ref("confirm");
const showPopup = ref(false);
const message = ref("");
const loading = ref(true);
const error = ref(null);

// 🔹 Ambil semua jadwal tetap
const fetchSchedules = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await fixedSchedulesService.getFixedSchedules();
    schedules.value = res.data.data ?? res.data;
  } catch (err) {
    console.error("❌ Gagal mengambil data jadwal:", err);
    error.value = err.response?.data?.message || err.message;
  } finally {
    loading.value = false;
  }
};

// 🔹 Tampilkan popup konfirmasi hapus
const handleDelete = (schedule) => {
  selectedId.value = schedule.id;
  popupMode.value = "confirm";
  message.value = "Apakah Anda yakin ingin menghapus jadwal ini?";
  showPopup.value = true;
};

// 🔹 Proses hapus jadwal tetap
const confirmDelete = async () => {
  try {
    loading.value = true;
    await fixedSchedulesService.destroyFixedSchedule(selectedId.value);
    await fetchSchedules();

    popupMode.value = "success";
    message.value = "Jadwal tetap tersebut telah berhasil dihapus"
    showPopup.value = true;
  } catch (err) {
    console.error("❌ Gagal menghapus jadwal:", err);
  } finally {
    loading.value = false;
  }
};

const closePopup = () => {
  showPopup.value = false;
}

onMounted(() => {
  fetchSchedules();
});
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">
      Daftar Jadwal Tetap
    </h1>

    <!-- 🔹 Tombol Tambah -->
    <RouterLink :to="{ name: 'FsCreate' }"
      class="flex items-center w-fit p-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded">
      <CalendarPlus class="mr-2" />
      Tambah
    </RouterLink>

    <!-- 🔹 Loading -->
    <div v-if="loading" class="text-gray-600 mt-4 text-center">
      Memuat data jadwal...
    </div>

    <!-- 🔹 Error -->
    <div v-if="error" class="text-red-600 mt-4 text-center">
      {{ error }}
    </div>

    <!-- 🔹 Grid Card -->
    <div v-if="!loading && schedules.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
      <div v-for="schedule in schedules" :key="schedule.id"
        class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition">
        <h2 class="text-lg font-semibold mb-2 text-gray-800">
          {{ schedule.room?.name || 'Tidak diketahui' }}
        </h2>
        <p class="text-sm text-gray-700">
          <span class="font-medium">Hari:</span> {{ schedule.day_of_week || '-' }}
        </p>
        <p class="text-sm text-gray-700">
          <span class="font-medium">Waktu:</span>
          {{ schedule.start_time?.slice(0, 5) }} - {{ schedule.end_time?.slice(0, 5) }}
        </p>
        <p class="text-sm text-gray-700 mb-4">
          <span class="font-medium">Keterangan:</span>
          {{ schedule.description || '-' }}
        </p>

        <!-- 🔹 Tombol aksi -->
        <div class="flex gap-3">
          <RouterLink :to="`/admin/fixed-schedules/${schedule.id}/edit`"
            class="bg-green-500 hover:bg-green-600 text-white px-10 py-1 rounded-full text-sm">
            Edit
          </RouterLink>
          <button @click="handleDelete(schedule)"
            class="bg-red-500 hover:bg-red-600 text-white px-10 py-1 rounded-full text-sm">
            Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- 🔹 Jika kosong -->
    <div v-else-if="!loading && !schedules.length" class="text-gray-600 text-center mt-10">
      Tidak ada jadwal tetap yang tersedia.
    </div>

    <!-- 🔹 Popup Konfirmasi -->
    <div v-if="showPopup" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 shadow-md w-[350px]">
        <h2 v-if="showPopup === 'confirm'" class="text-lg font-semibold text-gray-800 mb-3">
          Konfirmasi Hapus
        </h2>
        <p class="text-gray-700 mb-5">
          {{ message }}
        </p>
        <!-- konfirmasi -->
        <div v-if="popupMode === 'confirm'" class="flex justify-end gap-3">
          <button @click="confirmDelete" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
            Hapus
          </button>
          <button @click="closePopup" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">
            Batal
          </button>
        </div>
        <!-- success -->
         <div v-else-if="popupMode === 'success'" class="flex justify-end">
          <button @click="closePopup" class="bg-cyan-700 text-gray-800 px-4 py-2 rounded hover:bg-cyan-800 transition cursor-pointer">oke</button>
         </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="-mx-8">
    <Footer />
  </div>
</template>
