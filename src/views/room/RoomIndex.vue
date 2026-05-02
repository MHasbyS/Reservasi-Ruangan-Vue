<script setup>
import Footer from '@/components/Footer.vue'
import { HousePlus, Search } from 'lucide-vue-next';
import { ref, onMounted, computed, watch } from "vue";
import { useRoomStore } from "@/stores/room";

const roomStore = useRoomStore();

const rooms = ref([]);
const loading = ref(true);
const searchKeyword = ref('');
const pagination = ref({
  currentPage: 1,
  perPage: 10,
  lastPage: 1,
  total: 0
});

const showPopup = ref(false);
const popupMode = ref('');
const selectedId = ref(null);
const message = ref("");

let searchTimeout = null;

const totalPages = computed(() => pagination.value.lastPage);
const startIndex = computed(() => {
  return (pagination.value.currentPage - 1) * pagination.value.perPage + 1;
});
const endIndex = computed(() => {
  const end = pagination.value.currentPage * pagination.value.perPage;
  return Math.min(end, pagination.value.total);
});

const fetchRooms = async () => {
  try {
    loading.value = true;
    const result = await roomStore.fetchRooms({
      search: searchKeyword.value,
      page: pagination.value.currentPage,
      limit: pagination.value.perPage
    });
    rooms.value = result.rooms;
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
    fetchRooms();
  }, 500);
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.lastPage) return;
  pagination.value.currentPage = page;
  fetchRooms();
};

const changeLimit = (event) => {
  const newLimit = parseInt(event.target.value);
  pagination.value.perPage = newLimit;
  pagination.value.currentPage = 1;
  fetchRooms();
};

const handleDelete = (room) => {
  selectedId.value = room.id;

  if (room.status === 'active') {
    popupMode.value = 'error';
    message.value = "Ruangan ini sedang aktif atau sudah dibooking, sehingga tidak dapat dihapus.";
    showPopup.value = true;
  } else {
    popupMode.value = 'confirm';
    message.value = "Apakah Anda yakin ingin menghapus ruangan ini?";
    showPopup.value = true;
  }
};

const confirmDelete = async () => {
  try {
    await roomStore.deleteRoom(selectedId.value);
    await fetchRooms();

    popupMode.value = 'success';
    message.value = "Data ruangan tersebut telah berhasil dihapus"
    showPopup.value = true;
  } catch (err) {
    console.error("Gagal menghapus:", err);
    popupMode.value = 'error';
    message.value =
      err.response?.data?.message ||
      "Ruangan ini sedang aktif atau sudah dibooking, sehingga tidak dapat dihapus.";
    showPopup.value = true;
  }
};

const closePopup = () => {
  showPopup.value = false;
};

watch(searchKeyword, () => {
  handleSearch();
});

onMounted(() => {
  fetchRooms();
});
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">Daftar Ruangan</h1>
    <!-- Action Bar -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <RouterLink :to="{ name: 'RoomCreate' }"
        class="flex items-center bg-cyan-700 text-slate-50 p-2 w-fit rounded hover:bg-cyan-800 transition">
        <HousePlus class="mr-1" />
        Tambah
      </RouterLink>

      <!-- Search Box -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="Cari ruangan..."
          class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 w-80"
        />
      </div>
    </div>

    <!-- Limit Selector -->
    <div class="flex justify-end items-center gap-2">
      <label class="text-sm text-gray-600">Tampilkan:</label>
      <select
        :value="pagination.perPage"
        @change="changeLimit"
        class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>

    <div class="overflow-x-auto bg-white shadow-sm border border-gray-200 mt-4 rounded-md">
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-cyan-700 text-white">
          <tr>
            <th class="px-5 py-3 font-medium text-sm text-center">No</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Name</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Capacity</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Description</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Status</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Action</th>
          </tr>
        </thead>
        <tbody v-if="!loading && rooms.length > 0">
          <tr v-for="(room, i) in rooms" :key="room.id" class="border-b hover:bg-gray-50">
            <td class="text-center py-3">{{ startIndex + i }}</td>
            <td class="text-center py-3">{{ room.name }}</td>
            <td class="text-center py-3">{{ room.capacity }}</td>
            <td class="text-center py-3">{{ room.description || '-' }}</td>
            <td class="text-center py-3">
              <span :class="room.status === 'active' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'"
                class="px-3 py-1 rounded-full text-sm font-medium">
                {{ room.status_label || room.status }}
              </span>
            </td>
            <td class="text-center py-3">
              <div class="flex justify-center gap-2">
                <RouterLink :to="`/admin/room/${room.id}/edit`" class="bg-green-500 px-4 py-1 rounded-full text-white hover:bg-green-600 transition text-sm">
                  Edit
                </RouterLink>
                <button @click="handleDelete(room)"
                  class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full transition cursor-pointer text-sm">
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="!loading && rooms.length === 0">
          <tr>
            <td colspan="6" class="text-center py-10 text-gray-500">
              Tidak ada data ruangan
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="6" class="text-center py-10">
              <div class="flex justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-700"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-between items-center mt-4 flex-wrap gap-4">
      <div class="text-sm text-gray-600">
        Menampilkan {{ startIndex }} - {{ endIndex }} dari {{ pagination.total }} data
      </div>

      <div class="flex gap-2 items-center">
        <button
          @click="changePage(pagination.currentPage - 1)"
          :disabled="pagination.currentPage === 1"
          class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          &laquo; Sebelumnya
        </button>

        <div class="flex gap-1">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-1 rounded-md transition',
              page === pagination.currentPage
                ? 'bg-cyan-700 text-white'
                : 'border border-gray-300 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="changePage(pagination.currentPage + 1)"
          :disabled="pagination.currentPage === totalPages"
          class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Selanjutnya &raquo;
        </button>
      </div>
    </div>

    <!-- POPUP CARD -->
    <div v-if="showPopup" class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div class="bg-gray-100 rounded-lg shadow-lg p-6 w-[380px]">

        <!-- Judul (tampil hanya di confirm & error) -->
        <h2 v-if="popupMode === 'confirm'" class="text-lg font-bold mb-2 text-gray-800">
          Konfirmasi Hapus
        </h2>
        <h2 v-else-if="popupMode === 'error'" class="text-lg font-bold mb-2 text-red-700">
          Tidak dapat dihapus!
        </h2>

        <!-- Pesan -->
        <p class="text-gray-700 mb-5">{{ message }}</p>

        <!-- Tombol: mode konfirmasi -->
        <div v-if="popupMode === 'confirm'" class="flex justify-end gap-3">
          <button @click="confirmDelete" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer"
            :disabled="loading">
            {{ loading ? "Menghapus..." : "Hapus" }}
          </button>
          <button @click="closePopup" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition cursor-pointer">
            Batal
          </button>
        </div>

        <!-- Tombol: mode sukses -->
        <div v-else-if="popupMode === 'success'" class="flex justify-end">
          <button @click="closePopup" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition cursor-pointer">
            Oke
          </button>
        </div>

        <!-- Tombol: mode error -->
        <div v-else-if="popupMode === 'error'" class="flex justify-end">
          <button @click="closePopup" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition cursor-pointer">
            Oke
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer keluar dari padding utama -->
  <div class="-mx-8">
    <Footer />
  </div>
</template>
