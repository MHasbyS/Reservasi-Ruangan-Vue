<script setup>
import { ref, onMounted } from 'vue'
import reservationService from '@/services/reservationService'
import roomService from '@/services/RoomService'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

const events = ref([])
const rooms = ref([])
const selectedDate = ref(null)
const selectedEvents = ref([])
const showModal = ref(false)
const showDropdown = ref(false)
const showCreateModal = ref(false)
const dropdownPosition = ref({ top: 0, left: 0 })
const loading = ref(false)
const loadingRooms = ref(false)

// Form data
const formData = ref({
  room_id: '',
  date: '',
  start_time: '',
  end_time: ''
})

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek,dayGridDay'
  },
  events: events.value,

  dateClick(info) {
    const date = info.dateStr
    selectedDate.value = date
    const calendarEvents = info.view.calendar.getEvents()

    selectedEvents.value = calendarEvents.filter(ev => ev.startStr === date)

    const rect = info.dayEl.getBoundingClientRect()
    dropdownPosition.value = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    }

    showDropdown.value = true
  },

  eventColor: '#1976d2',
  dayMaxEvents: true,
})

const fetchReservations = async () => {
  try {
    const res = await reservationService.getReservations()
    const list = res.data.data || []

    events.value = list.map(item => ({
      title: `${item.user?.name} - ${item.room?.name}`,
      start: item.date,
      allDay: true,
      id: item.id,
      extendedProps: {
        startTime: item.start_time,
        endTime: item.end_time,
        user: item.user,
        room: item.room,
      }
    }))

    // update calendar
    calendarOptions.value.events = events.value
  } catch (error) {
    console.error('Error fetching reservations:', error)
  }
}

const fetchRooms = async () => {
  try {
    loadingRooms.value = true
    const res = await roomService.getRooms()

    // Handle berbagai struktur response
    const list = res.data.data?.data || res.data.data || res.data || []

    // Filter hanya ruangan yang aktif
    rooms.value = list.filter(room => room.status === 'inactive' || room.status === 'non-aktif')

    console.log('Rooms loaded:', rooms.value)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    alert('Gagal memuat data ruangan')
  } finally {
    loadingRooms.value = false
  }
}

const closeDropdown = () => {
  showDropdown.value = false
}

const showDetailModal = () => {
  showDropdown.value = false
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const closeCreateModal = () => {
  showCreateModal.value = false
  formData.value = {
    room_id: '',
    date: '',
    start_time: '',
    end_time: ''
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true

    // Validasi sederhana
    if (!formData.value.room_id || !formData.value.date || !formData.value.start_time || !formData.value.end_time) {
      alert('Semua field harus diisi!')
      return
    }

    await reservationService.createReservation(formData.value)

    alert('Reservasi berhasil dibuat!')
    closeCreateModal()

    // Refresh data kalender
    await fetchReservations()
  } catch (error) {
    console.error('Error creating reservation:', error)
    alert(error.response?.data?.message || 'Gagal membuat reservasi')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReservations()
  fetchRooms() // Fetch rooms saat component mounted
})
</script>

<template>
  <div class="p-4">

    <!-- Kalender -->
    <FullCalendar :options="calendarOptions" />

    <!-- Dropdown Menu -->
    <Transition name="fade">
      <div
        v-if="showDropdown"
        class="fixed inset-0 z-40"
        @click="closeDropdown"
      >
        <div
          class="absolute bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]"
          :style="{ top: dropdownPosition.top + 'px', left: dropdownPosition.left + 'px' }"
          @click.stop
        >
          <!-- Opsi jika ada reservasi -->
          <template v-if="selectedEvents.length > 0">
            <button
              @click="showDetailModal"
              class="w-full px-4 py-2 text-left hover:bg-gray-100 transition flex items-center gap-3"
            >
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-gray-700">Info Detail Reservasi</span>
            </button>
            <div class="border-t border-gray-200 my-1"></div>
          </template>

          <!-- Opsi Tambah Reservasi (selalu muncul) -->
          <RouterLink
          :to="{ name: 'createReservations', query: { date: selectedDate } }"
            class="w-full px-4 py-2 text-left hover:bg-gray-100 transition flex items-center gap-3"
          >
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-gray-700">Tambah Reservasi</span>
          </RouterLink>

          <div class="border-t border-gray-200 my-1"></div>

          <!-- Opsi Batal (selalu muncul) -->
          <button
            @click="closeDropdown"
            class="w-full px-4 py-2 text-left hover:bg-gray-100 transition flex items-center gap-3"
          >
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="text-gray-700">Batal</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modal Detail -->
    <div v-if="showModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">

        <!-- Header -->
        <div class="px-5 py-3 border-b flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-lg">Detail Reservasi</h3>
          <button @click="closeModal" class="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <!-- Konten -->
        <div class="p-5">
          <p class="text-gray-700 font-medium mb-4">
            Tanggal: {{ selectedDate }}
          </p>

          <!-- Jika ada reservasi -->
          <table v-if="selectedEvents.length" class="w-full text-left border">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2 border">Nama</th>
                <th class="p-2 border">Jam</th>
                <th class="p-2 border">Ruangan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in selectedEvents" :key="event.id" class="border">
                <td class="p-2 border">{{ event.extendedProps.user?.name }}</td>
                <td class="p-2 border">
                  {{ event.extendedProps.startTime }} - {{ event.extendedProps.endTime }}
                </td>
                <td class="p-2 border">{{ event.extendedProps.room?.name }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Jika tidak ada reservasi -->
          <p v-else class="text-gray-500">Tidak ada reservasi pada tanggal ini.</p>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t flex justify-end bg-gray-50">
          <button class="px-4 py-2 rounded bg-teal-700 text-white hover:bg-teal-800" @click="closeModal">
            Tutup
          </button>
        </div>

      </div>
    </div>

    <!-- Modal Create Reservasi -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">

        <!-- Header -->
        <div class="px-5 py-3 border-b flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-lg">Tambah Reservasi</h3>
          <button @click="closeCreateModal" class="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <!-- Content -->
        <div class="p-5">
          <Card class="w-full">
            <CardContent class="pt-6">
              <form class="space-y-4" @submit.prevent="handleSubmit">

                <div>
                  <label class="block text-lg font-sans mb-1">Ruangan</label>
                  <select
                    v-model="formData.room_id"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700"
                    required
                    :disabled="loadingRooms"
                  >
                    <option value="" disabled>
                      {{ loadingRooms ? 'Memuat ruangan...' : 'Pilih Ruangan' }}
                    </option>
                    <option v-for="room in rooms" :key="room.id" :value="room.id">
                      {{ room.name }} (Kapasitas: {{ room.capacity }})
                    </option>
                  </select>
                  <p v-if="rooms.length === 0 && !loadingRooms" class="text-sm text-red-500 mt-1">
                    Tidak ada ruangan tersedia
                  </p>
                </div>

                <div>
                  <label class="block text-lg font-sans mb-1">Tanggal</label>
                  <input
                    type="date"
                    v-model="formData.date"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700"
                    required
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-lg font-sans mb-1">Jam Mulai</label>
                    <input
                      type="time"
                      v-model="formData.start_time"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-lg font-sans mb-1">Jam Selesai</label>
                    <input
                      type="time"
                      v-model="formData.end_time"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-700"
                      required
                    />
                  </div>
                </div>

                <CardFooter class="flex justify-end space-x-2 px-0">
                  <button
                    type="submit"
                    class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 cursor-pointer transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    :disabled="loading || loadingRooms || rooms.length === 0"
                  >
                    {{ loading ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                  <button
                    type="button"
                    @click="closeCreateModal"
                    class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer transition"
                  >
                    Batal
                  </button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
