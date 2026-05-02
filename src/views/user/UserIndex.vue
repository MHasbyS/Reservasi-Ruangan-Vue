<script setup>
import Footer from "@/components/Footer.vue";
import { ref, onMounted, watch, computed } from "vue";
import { UserPlus, Search } from 'lucide-vue-next';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore()

// ========== STATE ==========
const users = ref([]);
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
const fetchUsers = async () => {
  try {
    loading.value = true;
    const result = await userStore.fetchUsers({
      search: searchKeyword.value,
      page: pagination.value.currentPage,
      limit: pagination.value.perPage
    });

    users.value = result.users;
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
    pagination.value.currentPage = 1; // Reset ke halaman pertama saat search
    fetchUsers();
  }, 500);
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.lastPage) return;
  pagination.value.currentPage = page;
  fetchUsers();
};

const changeLimit = (event) => {
  const newLimit = parseInt(event.target.value);
  pagination.value.perPage = newLimit;
  pagination.value.currentPage = 1; // Reset ke halaman pertama
  fetchUsers();
};

const handleDelete = (user) => {
  selectedId.value = user.id;
  popupMode.value = "confirm";
  message.value = "Apakah Anda yakin ingin menghapus user ini?";
  showPopup.value = true;
};

const confirmDelete = async () => {
  try {
    loading.value = true;
    await userStore.deleteUser(selectedId.value);
    await fetchUsers();

    popupMode.value = "success";
    message.value = "Data user tersebut telah berhasil dihapus.";
    showPopup.value = true;
  } catch (err) {
    console.error("Gagal menghapus user:", err);
    popupMode.value = "error";
    message.value = err.response?.data?.message || "Gagal menghapus user.";
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
  fetchUsers();
});
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">Daftar User</h1>

    <!-- Action Bar -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <RouterLink to="/admin/user/create" class="p-2 flex items-center gap-1 w-fit bg-cyan-700 text-white rounded hover:bg-cyan-800 transition">
        <UserPlus class="mr-1" size=18 />
        Tambah User
      </RouterLink>

      <!-- Search Box -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="Cari user..."
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

    <!-- Table -->
    <div class="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-md">
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-cyan-700 text-white">
          <tr>
            <th class="px-5 py-3 font-medium text-sm text-center">No</th>
            <th class="px-5 py-3 font-medium text-sm text-left">Nama</th>
            <th class="px-5 py-3 font-medium text-sm text-left">Email</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Role</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Aksi</th>
          </tr>
        </thead>

        <tbody v-if="!loading && users.length > 0">
          <tr v-for="(item, i) in users" :key="item.id" class="border-b hover:bg-gray-50">
            <td class="text-center py-3">{{ startIndex + i }}</td>
            <td class="py-3">{{ item.name }}</td>
            <td class="py-3">{{ item.email }}</td>
            <td class="text-center py-3">
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                item.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              ]">
                {{ item.role }}
              </span>
            </td>
            <td class="text-center py-3">
              <div class="flex justify-center gap-2">
                <RouterLink :to="`/admin/user/${item.id}/edit`"
                  class="bg-green-500 px-4 py-1 rounded-full text-white hover:bg-green-600 transition text-sm">
                  Edit
                </RouterLink>
                <button @click="handleDelete(item)"
                  class="bg-red-500 rounded-full px-4 py-1 text-white hover:bg-red-600 transition cursor-pointer text-sm">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="!loading && users.length === 0">
          <tr>
            <td colspan="5" class="text-center py-10 text-gray-500">
              Tidak ada data user
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="5" class="text-center py-10">
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
  </div>

  <!-- POPUP CARD -->
  <div v-if="showPopup" class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-[380px]">
      <h2 v-if="popupMode === 'confirm'" class="text-lg font-bold mb-2 text-gray-800">Konfirmasi Hapus</h2>
      <h2 v-else-if="popupMode === 'success'" class="text-lg font-bold mb-2 text-green-600">Berhasil!</h2>
      <h2 v-else-if="popupMode === 'error'" class="text-lg font-bold mb-2 text-red-600">Gagal!</h2>

      <p class="text-gray-700 mb-5">{{ message }}</p>

      <!-- konfirmasi -->
      <div v-if="popupMode === 'confirm'" class="flex justify-end gap-3">
        <button @click="confirmDelete"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          :disabled="loading">
          {{ loading ? "Menghapus..." : "Hapus" }}
        </button>
        <button @click="closePopup"
          class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition cursor-pointer">
          Batal
        </button>
      </div>

      <!-- success / error -->
      <div v-else class="flex justify-end">
        <button @click="closePopup"
          class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition cursor-pointer">
          Oke
        </button>
      </div>
    </div>
  </div>

  <div class="-mx-8 mt-8">
    <Footer />
  </div>
</template>
