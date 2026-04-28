<script setup>
import Footer from '@/components/Footer.vue'
import { HousePlus } from 'lucide-vue-next';
import { ref, onMounted } from "vue";
import roomService from "@/services/RoomService";
// import Swal from "sweetalert2";

const rooms = ref([]);
const loading = ref(true);

const showPopup = ref(false);
const popupMode = ref(''); // 'confirm' | 'error'
const selectedId = ref(null);
const message = ref("");


const fetchRooms = async () => {
  try {
    loading.value = true;
    const res = await roomService.getRooms();
    rooms.value = res.data.data ?? res.data;
  } catch (err) {
    console.error("Gagal memuat data:", err);
  } finally {
    loading.value = false;
  }
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
    await roomService.deleteRoom(selectedId.value);
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

// Tutup popup
const closePopup = () => {
  showPopup.value = false;
};

// const handleDelete = async (id) => {
//   const confirm = await Swal.fire({
//     title: "Yakin ingin menghapus?",
//     text: "Data ruangan akan dihapus permanen!",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#0e7490", //
//     cancelButtonColor: "#d33",
//     confirmButtonText: "Ya, hapus!",
//     cancelButtonText: "Batal",
//   });

//   if (!confirm.isConfirmed) return;

//   try {
//     await roomService.deleteRoom(id);
//     Swal.fire({
//       title: "Berhasil!",
//       text: "Ruangan berhasil dihapus.",
//       icon: "success",
//       confirmButtonColor: "#0e7490",
//     });
//     fetchRooms(); // refresh data
//   } catch (err) {
//     console.error("❌ Gagal menghapus:", err);

//     // Jika backend kirim pesan error (misalnya karena ruangan aktif)
//     const msg =
//       err.response?.data?.message ||
//       "Ruangan ini sedang aktif atau sudah dibooking, sehingga tidak dapat dihapus.";

//     Swal.fire({
//       title: "Tidak dapat dihapus!",
//       text: msg,
//       icon: "error",
//       confirmButtonColor: "#0e7490",
//       confirmButtonText: "Oke",
//     });
//   }
// };
onMounted(() => {
  fetchRooms();
});
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">Daftar Ruangan</h1>
    <RouterLink :to="{ name: 'RoomCreate' }"
      class="flex items-center bg-cyan-700 text-slate-50 p-2 w-fit rounded hover:bg-cyan-800 transition">
      <HousePlus class="mr-1" />
      Tambah
    </RouterLink>
    <div class="overflow-x-auto bg-white shadow-sm border border-gray-200 mt-4">
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-cyan-700 text-white">
          <tr>
            <th class="px-5 py-3 font-medium text-sm text-center">No</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Name</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Capacity</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Description</th>
            <th class="px-5 py-3 font-medium text-sm text-center">status</th>
            <th class="px-5 py-3 font-medium text-sm text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(room, i) in rooms" :key="room.id">
            <td class="text-center py-3">{{ i + 1 }}</td>
            <td class="text-center py-3">{{ room.name }}</td>
            <td class="text-center py-3">{{ room.capacity }}</td>
            <td class="text-center py-3">{{ room.description || '-' }}</td>
            <td class="text-center py-3">
              <span :class="room.status === 'active' ? 'bg-green-500' : 'bg-red-500'"
                class="text-white px-3 py-1 rounded-full text-sm">
                {{ room.status_label }}
              </span>
            </td>
            <td class="text-center py-3">
              <div class="flex justify-center gap-2">
                <RouterLink :to="`/admin/room/${room.id}/edit`" class="bg-green-500 px-5 py-1 rounded-full text-white">
                  Edit
                </RouterLink>
                <button @click="handleDelete(room)"
                  class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full transition cursor-pointer">
                  Hapus
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
          <button @click="confirmDelete" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            :disabled="loading">
            {{ loading ? "Menghapus..." : "Hapus" }}
          </button>
          <button @click="closePopup" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition">
            Batal
          </button>
        </div>

        <!-- Tombol: mode sukses -->
        <div v-else-if="popupMode === 'success'" class="flex justify-end">
          <button @click="closePopup" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition">
            Oke
          </button>
        </div>

        <!-- Tombol: mode error -->
        <div v-else-if="popupMode === 'error'" class="flex justify-end">
          <button @click="closePopup" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition">
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
