<script setup>
import { useReservationStore } from '@/stores/reservation';
import { useRoomStore } from '@/stores/room';
import Footer from '@/components/Footer.vue';
import { onMounted, ref, computed } from 'vue';
import { CalendarPlus, Download, Loader2 } from 'lucide-vue-next';

// ========== STORES ==========
const reservationStore = useReservationStore();
const roomStore = useRoomStore();

// ========== STATE ==========
const reservations = ref([]);
const rooms = ref([]);
const loading = ref(false);
const actionLoading = ref(false); // ✅ Loading untuk approve/reject
const error = ref(null);
const successMessage = ref('');

// Filter state
const selectedRoomId = ref('');
const selectedStatus = ref('');
const selectedDate = ref('');

// Popup state
const showPopup = ref(false);
const selectedId = ref(null);
const reason = ref('');
const popupMode = ref(''); // 'approve' atau 'reject'

// ✅ Text default untuk penolakan
const defaultRejectReasons = [
  'Ruangan sedang dalam perbaikan',
  'Bentrok jadwal dengan acara lain',
  'Kapasitas ruangan tidak mencukupi',
  'Fasilitas ruangan tidak tersedia',
  'Waktu pengajuan terlalu mepet',
  'Data pemesan tidak lengkap',
];


// Status options
const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'completed', label: 'Selesai' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'canceled', label: 'Dibatalkan' },
];

// ========== COMPUTED ==========
const hasFilters = computed(() => {
  return selectedRoomId.value || selectedStatus.value || selectedDate.value;
});

const filteredReservations = computed(() => {
  let data = reservations.value;

  if (selectedRoomId.value) {
    data = data.filter(r => r.room_id === selectedRoomId.value);
  }

  if (selectedStatus.value) {
    data = data.filter(r => r.status === selectedStatus.value);
  }

  if (selectedDate.value) {
    data = data.filter(r => {
      const resDate = new Date(r.date).toISOString().slice(0, 10);
      return resDate === selectedDate.value;
    });
  }

  return data;
});

const isActionLoading = computed(() => reservationStore.actionLoading || actionLoading.value);

// ========== METHODS ==========

// ✅ Tampilkan pesan sukses
const showSuccess = (msg) => {
  successMessage.value = msg;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

// ✅ Tampilkan pesan error
const showError = (msg) => {
  error.value = msg;
  setTimeout(() => {
    error.value = null;
  }, 3000);
};

// ✅ Ambil data reservasi
const fetchReservation = async () => {
  loading.value = true;
  error.value = null;

  try {
    await reservationStore.fetchReservations();
    reservations.value = reservationStore.reservations;
  } catch (err) {
    console.error("❌ Error fetching reservations:", err);
    showError(err.response?.data?.message || "Terjadi kesalahan saat mengambil data reservasi.");
  } finally {
    loading.value = false;
  }
};

// ✅ Ambil data ruangan
const fetchRooms = async () => {
  try {
    await roomStore.fetchRooms();
    rooms.value = roomStore.rooms;
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    showError(err.response?.data?.message || "Terjadi kesalahan saat mengambil data ruangan.");
  }
};

// ✅ Buka popup konfirmasi
const openPopup = (id, mode) => {
  selectedId.value = id;
  popupMode.value = mode;
  reason.value = ''; // Reset reason
  showPopup.value = true;
};

// ✅ Tutup popup
const closePopup = () => {
  showPopup.value = false;
  selectedId.value = null;
  reason.value = '';
  popupMode.value = '';
};

// ✅ Set reason dari default
const setDefaultReason = (defaultText) => {
  reason.value = defaultText;
};

// ✅ Submit approve/reject
const handleSubmit = async () => {
  try {
    if (popupMode.value === 'reject') {
      // ✅ Reason nullable - tidak wajib diisi
      const rejectReason = reason.value.trim() || null;

      await reservationStore.rejectReservation(selectedId.value, rejectReason);
      showSuccess('Reservasi berhasil ditolak.');

    } else if (popupMode.value === 'approve') {
      await reservationStore.approveReservation(selectedId.value);
      showSuccess('Reservasi berhasil disetujui.');
    }

    closePopup();
    await fetchReservation(); // Refresh data

  } catch (err) {
    console.error("❌ Error updating reservation:", err);
    showError(err.response?.data?.message || "Terjadi kesalahan saat memproses reservasi.");
  }
};

// ✅ Export laporan
const exportReservations = async () => {
  actionLoading.value = true;

  try {
    const params = {};
    if (selectedRoomId.value) params.room_id = selectedRoomId.value;
    if (selectedStatus.value) params.status = selectedStatus.value;
    if (selectedDate.value) params.date = selectedDate.value;

    await reservationStore.exportReservations(params);
    showSuccess('Laporan berhasil diexport');
  } catch (err) {
    console.error("❌ Export error:", err);
    showError(err.response?.data?.message || "Gagal mengunduh laporan.");
  } finally {
    actionLoading.value = false;
  }
};

// ✅ Reset filter
const resetFilters = () => {
  selectedRoomId.value = '';
  selectedStatus.value = '';
  selectedDate.value = '';
};

// ✅ Get status badge class
const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'completed': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'canceled': 'bg-gray-100 text-gray-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// ========== LIFECYCLE ==========
onMounted(() => {
  fetchReservation();
  fetchRooms();
});
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold mb-4 text-black border p-5 rounded-md">Daftar Reservasi</h1>

    <!-- Success & Error Messages -->
    <div v-if="successMessage" class="p-3 bg-green-100 text-green-700 rounded-md">
      {{ successMessage }}
    </div>
    <div v-if="error" class="p-3 bg-red-100 text-red-700 rounded-md">
      {{ error }}
    </div>

    <!-- Filter Section -->
    <div class="flex flex-wrap items-center gap-2 mt-4">
      <select v-model="selectedRoomId"
        class="bg-cyan-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
        <option value="">Semua Ruangan</option>
        <option v-for="room in rooms" :key="room.id" :value="room.id">
          {{ room.name }}
        </option>
      </select>

      <select v-model="selectedStatus"
        class="bg-cyan-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <input type="date" v-model="selectedDate"
        class="bg-cyan-700 text-white p-2 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500" />

      <button v-if="hasFilters" @click="resetFilters"
        class="bg-gray-500 p-2 rounded-md text-white hover:bg-gray-600 transition">
        Reset Filter
      </button>

      <button @click="exportReservations" :disabled="isActionLoading"
        class="bg-green-600 p-2 flex items-center rounded-md text-white hover:bg-green-700 transition disabled:opacity-50 ml-auto">
        <Download class="w-4 h-4 mr-1" />
        {{ isActionLoading ? 'Mengexport...' : 'Export Laporan (Excel)' }}
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-md">
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-cyan-700 text-white">
          <tr>
            <th class="px-5 py-3 text-center">Tanggal</th>
            <th class="px-5 py-3 text-center">Ruangan</th>
            <th class="px-5 py-3 text-center">Jam Mulai</th>
            <th class="px-5 py-3 text-center">Jam Selesai</th>
            <th class="px-5 py-3 text-center">Pemesan</th>
            <th class="px-5 py-3 text-center">Status</th>
            <th class="px-5 py-3 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody v-if="!loading && filteredReservations.length > 0">
          <tr v-for="r in filteredReservations" :key="r.id" class="border-b hover:bg-gray-50">
            <td class="text-center py-3">
              {{ new Date(r.date).toLocaleDateString('id-ID') }}
            </td>
            <td class="text-center py-3">{{ r.room?.name || '-' }}</td>
            <td class="text-center py-3">{{ r.start_time?.slice(0, 5) || '-' }}</td>
            <td class="text-center py-3">{{ r.end_time?.slice(0, 5) || '-' }}</td>
            <td class="text-center py-3">{{ r.user?.name || '-' }}</td>
            <td class="text-center py-3">
              <span :class="`${getStatusClass(r.status)} px-2 py-1 rounded-full text-xs`">
                {{ r.status }}
              </span>
            </td>
            <td class="text-center py-3">
              <div class="flex justify-center gap-2">
                <!-- Tombol Setujui (hanya untuk pending) -->
                <button v-if="r.status === 'pending'" @click="openPopup(r.id, 'approve')" :disabled="isActionLoading"
                  class="bg-green-500 rounded-full text-white px-4 py-1 hover:bg-green-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="isActionLoading" class="flex items-center gap-1">
                    <Loader2 class="w-3 h-3 animate-spin" />
                    Memproses...
                  </span>
                  <span v-else>Setujui</span>
                </button>

                <!-- Tombol Tolak (hanya untuk pending) -->
                <button v-if="r.status === 'pending'" @click="openPopup(r.id, 'reject')" :disabled="isActionLoading"
                  class="bg-red-500 rounded-full px-4 py-1 text-white hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="isActionLoading" class="flex items-center gap-1">
                    <Loader2 class="w-3 h-3 animate-spin" />
                    Memproses...
                  </span>
                  <span v-else>Tolak</span>
                </button>

                <!-- Status badge untuk non-pending -->
                <span v-else class="text-gray-400 text-sm">Tidak ada aksi</span>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="!loading && filteredReservations.length === 0">
          <tr>
            <td colspan="7" class="text-center py-10 text-gray-500">
              {{ hasFilters ? 'Tidak ada data sesuai filter' : 'Tidak ada data reservasi' }}
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="7" class="text-center py-10">
              <div class="flex justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-700"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Popup Konfirmasi (Approve) -->
    <div v-if="showPopup && popupMode === 'approve'"
      class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-[400px]">
        <h2 class="text-lg font-bold mb-3 text-gray-800">Setujui Reservasi</h2>

        <p class="text-gray-600 mb-4">
          Apakah Anda yakin ingin menyetujui reservasi ini?
        </p>

        <div class="flex justify-end gap-3">
          <button @click="handleSubmit" :disabled="isActionLoading"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50">
            <span v-if="isActionLoading" class="flex items-center gap-1">
              <Loader2 class="w-4 h-4 animate-spin" />
              Memproses...
            </span>
            <span v-else>Ya, Setujui</span>
          </button>
          <button @click="closePopup" :disabled="isActionLoading"
            class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition">
            Batal
          </button>
        </div>
      </div>
    </div>

    <!-- Popup Konfirmasi (Reject) dengan Reason Opsional -->
    <div v-if="showPopup && popupMode === 'reject'"
      class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-[450px]">
        <h2 class="text-lg font-bold mb-3 text-gray-800">Tolak Reservasi</h2>

        <p class="text-gray-600 mb-4">
          Apakah Anda yakin ingin menolak reservasi ini?
        </p>

        <!-- ✅ Reason dengan default options -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Alasan Penolakan (Opsional)
          </label>

          <!-- Default reason buttons -->
          <div class="flex flex-wrap gap-2 mb-3">
            <button v-for="defaultReason in defaultRejectReasons" :key="defaultReason" type="button"
              @click="setDefaultReason(defaultReason)"
              class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition">
              {{ defaultReason }}
            </button>
          </div>

          <!-- Textarea untuk alasan -->
          <textarea v-model="reason" rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700"
            placeholder="Tulis alasan penolakan (opsional)..."></textarea>
          <p class="text-xs text-gray-400 mt-1">*Kosongkan jika tidak ada alasan khusus</p>
        </div>

        <div class="flex justify-end gap-3">
          <button @click="handleSubmit" :disabled="isActionLoading"
            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50">
            <span v-if="isActionLoading" class="flex items-center gap-1">
              <Loader2 class="w-4 h-4 animate-spin" />
              Memproses...
            </span>
            <span v-else>Ya, Tolak</span>
          </button>
          <button @click="closePopup" :disabled="isActionLoading"
            class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition">
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="-mx-8 mt-8">
    <Footer />
  </div>
</template>
