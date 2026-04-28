<script setup>
import Footer from '@/components/Footer.vue';
import { onMounted, ref } from 'vue';
import reservationService from '@/services/reservationService';
import roomService from '@/services/RoomService';
import { CalendarPlus } from 'lucide-vue-next';

const reservations = ref([]);
const rooms = ref([]);
const status = ref(['approved', 'pending', 'rejected', 'canceled']);
const loading = ref(false);
const error = ref(null);
const showPopup = ref(false);
const selectedId = ref(null);
const reason = ref('');
const popupMode = ref(''); // ✅ perbaikan → tambahkan state untuk mode (approve/reject)

// ✅ Perbaikan: Ambil data reservasi
const fetchReservation = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await reservationService.getReservations();
    reservations.value = res.data.data ?? res.data;
  } catch (err) {
    console.error("❌ Error fetching reservations:", err);
    error.value = err.response?.data?.message || "Terjadi kesalahan saat mengambil data reservasi.";
  } finally {
    loading.value = false;
  }
};

// ✅ Perbaikan: Ambil data ruangan
const fetchRooms = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await roomService.getRooms();
    rooms.value = res.data.data ?? res.data;
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    error.value = err.response?.data?.message || "Terjadi kesalahan saat mengambil data ruangan.";
  } finally {
    loading.value = false;
  }
};

// ✅ Perbaikan: Bedakan popup antara "Setujui" dan "Tolak"
const openPopup = (id, mode) => {
  selectedId.value = id;
  popupMode.value = mode; // simpan mode (approve / reject)
  reason.value = '';
  showPopup.value = true;
};

const closePopup = () => {
  showPopup.value = false;
  selectedId.value = null;
  reason.value = '';
};

// ✅ Perbaikan: Fungsi terpisah untuk approve dan reject
const handleSubmit = async () => {
  try {
    if (popupMode.value === 'reject') {
      if (!reason.value.trim()) {
        alert('Alasan penolakan harus diisi.');
        return;
      }
      await reservationService.rejectReservation(selectedId.value, { reason: reason.value });
      showSuccesCard('Reservasi berhasil ditolak.');
    } else if (popupMode.value === 'approve') {
      await reservationService.approveReservation(selectedId.value);
      showSuccesCard('Reservasi berhasil disetujui.');
    }

    showPopup.value = false;
    await fetchReservation(); // ✅ refresh data setelah aksi

  } catch (err) {
    console.error("❌ Error updating reservation:", err);
  }
};

// ✅ perbaikan: popup sukses
const showSuccesCard = (msg) => {
  alert(msg);
};

const laporanReservations = async () => {
  try {
    const res = await reservationService.laporanReservasi()

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = "reservations.xlsx" // nama file yang diunduh
    document.body.appendChild(a)
    a.click()

    // bersihkan object URL
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error("Gagal mengunduh laporan:", err);
  }
}

onMounted(() => {
  fetchReservation();
  fetchRooms();
});
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">Daftar Reservasi</h1>

    <!-- Filter -->
    <div class="flex items-center mt-10">
      <select class="bg-cyan-700 text-white p-2 rounded mr-2 w-fit">
        <option value="" disabled selected>Ruangan</option>
        <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.name }}</option>
      </select>
      <select class="bg-cyan-700 p-2 mr-2 rounded text-white">
        <option value="" disabled selected>Status</option>
        <option v-for="s in status" :key="s" :value="s">{{ s }}</option>
      </select>
      <button class="bg-cyan-700 p-2 flex items-center rounded text-white mr-2">
        <CalendarPlus class="mr-1" /> Pilih Tanggal
      </button>
      <button @click="laporanReservations" class="bg-cyan-700 p-2 rounded text-white cursor-pointer">
        Export Laporan
        (CSV/Excel)</button>
    </div>

    <!-- ✅ tabel -->
    <div class="overflow-x-auto bg-white shadow-sm border border-gray-200 mt-4">
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-cyan-700 text-white">
          <tr>
            <th class="px-5 py-3 text-center">Tanggal</th>
            <th class="px-5 py-3 text-center">Ruangan</th>
            <th class="px-5 py-3 text-center">Jam</th>
            <th class="px-5 py-3 text-center">Status</th>
            <th class="px-5 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reservations" :key="r.id">
            <td class="text-center py-3">{{ new Date(r.date).toISOString().slice(0, 10) }}</td>
            <td class="text-center py-3">{{ r.room?.name }}</td>
            <td class="text-center py-3">{{ r.start_time?.slice(0, 5) }} - {{ r.end_time?.slice(0, 5) }}</td>
            <td class="text-center py-3">{{ r.status }}</td>
            <td class="text-center py-3">
              <div class="flex justify-center gap-2">
                <!-- ✅ tombol Setujui -->
                <button @click="openPopup(r.id, 'approve')"
                  class="bg-green-500 rounded-full text-white px-5 py-1 hover:bg-green-600">
                  Setujui
                </button>
                <!-- ✅ tombol Tolak -->
                <button @click="openPopup(r.id, 'reject')" class="bg-red-500 rounded-full px-5 py-1 text-white p-2 hover:bg-red-600">
                  Tolak
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ✅ Popup dinamis -->
    <div v-if="showPopup" class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div class="bg-gray-100 rounded-lg shadow-lg p-6 w-[380px]">
        <h2 class="text-lg font-bold mb-3 text-gray-800">
          {{ popupMode === 'reject' ?
          'Apakah Anda yakin ingin menolak reservasi ini?' : 'Apakah Anda yakin inginmenyetujui reservasi ini?' }}
        </h2>

        <!-- ✅ tampilkan alasan hanya jika mode tolak -->
        <div v-if="popupMode === 'reject'">
          <label class="block text-sm text-gray-700 mb-1">Alasan penolakan?</label>
          <textarea v-model="reason" rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-cyan-700"
            placeholder="Tulis alasan..."></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <button @click="handleSubmit" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition">
            {{ popupMode === 'reject' ? 'Kirim' : 'Setujui' }}
          </button>
          <button @click="closePopup" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition">
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="-mx-8">
    <Footer />
  </div>
</template>
