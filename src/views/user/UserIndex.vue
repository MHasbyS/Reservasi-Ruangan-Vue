<script setup>
import Footer from "@/components/Footer.vue";
import { ref, onMounted } from "vue";
import { UserPlus } from 'lucide-vue-next';
import userService from "@/services/UserService";

const users = ref([]);
const loading = ref(true);

const showPopup = ref(false);
const popupMode = ref("confirm")
const selectedId = ref(null);
const message = ref("");

const fetchUsers = async () => {
  try {
    loading.value = true;
    const res = await userService.getUsers();
    users.value = res.data.data ?? res.data;
  } catch (err) {
    console.error("Gagal memuat data:", err);
  } finally {
    loading.value = false;
  }
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
    await userService.deleteUser(selectedId.value);
    await fetchUsers();

    popupMode.value = "success";
    message.value = "Data user tersebut telah berhasil dihapus.";
    showPopup.value = true;
  } catch (err) {
    console.error("Gagal menghapus user:", err);
  } finally {
    loading.value = false;
    // showPopup.value = false; // Tutup popup apapun hasilnya
  }
};

const closePopup = () => {
  showPopup.value = false;
};
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">Daftar User</h1>

    <RouterLink to="/admin/user/create" class="p-2 flex item-center gap-1 w-fit bg-cyan-700 text-white rounded">
      <UserPlus class="mr-1" />
      Tambah
    </RouterLink>

    <div class="overflow-x-auto bg-white shadow-sm border border-gray-200 mt-4">
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-cyan-700 text-white">
          <tr>
            <th class="px-5 py-3 font-medium text-sm text-center">No</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Nama</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Email</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Role</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, i) in users" :key="item.id">
            <td class="text-center py-3">{{ i + 1 }}</td>
            <td class="text-center py-3">{{ item.name }}</td>
            <td class="text-center py-3">{{ item.email }}</td>
            <td class="text-center py-3">{{ item.role }}</td>
            <td class="text-center py-3">
              <div class="flex justify-center gap-2">
                <RouterLink :to="`/admin/user/${item.id}/edit`"
                  class="bg-green-500 px-5 py-1 rounded-full text-white">Edit
                </RouterLink>
                <button @click="handleDelete(item)" class="bg-red-500 rounded-full px-5 py-1 text-white p-2 cursor-pointer">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- POPUP CARD -->
    <div v-if="showPopup" class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div class="bg-gray-100 rounded-lg shadow-lg p-6 w-[380px]">
        <h2 v-if="popupMode === 'confirm'" class="text-lg font-bold mb-2 text-gray-800">Konfirmasi Hapus</h2>
        <p class="text-gray-700 mb-5">{{ message }}</p>

        <!-- konfirmasi -->
        <div v-if="popupMode === 'confirm'" class="flex justify-end gap-3">
          <button @click="confirmDelete" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            :disabled="loading">{{ loading ? "Menghapus..." : "Hapus" }}</button>
          <button @click="closePopup"
            class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition cursor-pointer">
            Batal
          </button>
        </div>

        <!-- success -->
        <div v-else-if="popupMode === 'success'" class="flex justify-end">
          <button @click="closePopup"
            class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition cursor-pointer">
            Oke
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="-mx-8">
    <Footer />
  </div>
</template>
