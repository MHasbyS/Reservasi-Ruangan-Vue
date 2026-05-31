<script setup>
import Footer from '@/components/Footer.vue';
import { ref, onMounted, watch, computed } from 'vue';
import { useFixedScheduleStore } from '@/stores/fixedSchedule';
import { CalendarPlus, Search } from 'lucide-vue-next';

const scheduleStore = useFixedScheduleStore()

// ========== STATE ==========
const schedules = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const pagination = ref({
  currentPage: 1,
  perPage: 10,
  lastPage: 1,
  total: 0
});

// Popup state
const showPopup = ref(false);
const popupMode = ref("confirm");
const selectedId = ref(null);
const message = ref("");

// Debounce timeout
let searchTimeout = null;

// ========== COMPUTED ==========
const totalPages = computed(() => pagination.value.lastPage);
const startIndex = computed(() => {
  return (pagination.value.currentPage - 1) * pagination.value.perPage + 1;
});
const endIndex = computed(() => {
  const end = pagination.value.currentPage * pagination.value.perPage;
  return Math.min(end, pagination.value.total);
});

// ========== METHODS ==========
const fetchSchedules = async () => {
  try {
    loading.value = true;
    const result = await scheduleStore.fetchFixedSchedules({
      search: searchKeyword.value,
      page: pagination.value.currentPage,
      limit: pagination.value.perPage
    });

    schedules.value = result.schedules;
    pagination.value = result.pagination;
  } catch (err) {
    console.error("Gagal memuat data:", err);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1;
    fetchSchedules();
  }, 500);
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.lastPage) return;
  pagination.value.currentPage = page;
  fetchSchedules();
};

const changeLimit = (event) => {
  const newLimit = parseInt(event.target.value);
  pagination.value.perPage = newLimit;
  pagination.value.currentPage = 1;
  fetchSchedules();
};

const handleDelete = (schedule) => {
  selectedId.value = schedule.id;
  popupMode.value = "confirm";
  message.value = "Apakah Anda yakin ingin menghapus jadwal ini?";
  showPopup.value = true;
};

const confirmDelete = async () => {
  try {
    loading.value = true;
    await scheduleStore.deleteFixedSchedule(selectedId.value);
    await fetchSchedules();

    popupMode.value = "success";
    message.value = "Jadwal tetap tersebut telah berhasil dihapus.";
    showPopup.value = true;
  } catch (err) {
    console.error("Gagal menghapus jadwal:", err);
    popupMode.value = "error";
    message.value = err.response?.data?.message || "Gagal menghapus jadwal.";
    showPopup.value = true;
  } finally {
    loading.value = false;
  }
};

const closePopup = () => {
  showPopup.value = false;
  popupMode.value = "confirm";
  message.value = "";
  selectedId.value = null;
};

// Watch search keyword
watch(searchKeyword, () => {
  handleSearch();
});

// Lifecycle
onMounted(() => {
  fetchSchedules();
});
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">
      Daftar Jadwal Tetap
    </h1>

    <div class="flex justify-between items-center gap-4 flex-wrap"></div>
    <RouterLink :to="{ name: 'FsCreate' }"
      class="flex items-center w-fit p-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded">
      <CalendarPlus class="mr-2" />
      Tambah
    </RouterLink>

    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <input type="text" v-model="searchKeyword" placeholder="Cari jadwal..."
        class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 w-80" />
    </div>
  </div>

  <div class="flex justify-end items-center gap-2">
    <label class="text-sm text-gray-600">Tampilkan:</label>
    <select :value="pagination.perPage" @change="changeLimit"
      class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
      <option value="10">10</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
  </div>

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

  <!-- pagination  -->
  <div v-if="totalPages > 1" class="flex justify-between items-center mt-4 flex-wrap gap-4">
    <div class="text-sm text-gray-600">
      Menampilkan {{ startIndex }} - {{ endIndex }} dari {{ pagination.total }} data
    </div>

    <div class="flex gap-2 items-center">
      <button @click="changePage(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1"
        class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
        &laquo; Sebelumnya
      </button>

      <div class="flex gap-1">
        <button v-for="page in totalPages" :key="page" @click="changePage(page)" :class="[
          'px-3 py-1 rounded-md transition',
          page === pagination.currentPage
            ? 'bg-cyan-700 text-white'
            : 'border border-gray-300 hover:bg-gray-100'
        ]">
          {{ page }}
        </button>
      </div>

      <button @click="changePage(pagination.currentPage + 1)" :disabled="pagination.currentPage === totalPages"
        class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
        Selanjutnya &raquo;
      </button>
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
        <button @click="closePopup"
          class="bg-cyan-700 text-gray-800 px-4 py-2 rounded hover:bg-cyan-800 transition cursor-pointer">oke</button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="-mx-8">
    <Footer />
  </div>
</template>
