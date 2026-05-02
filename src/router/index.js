import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import KaryawanLayout from '@/layouts/KaryawanLayout.vue'

import Login from '@/views/Login.vue'
import HomeView from '@/views/HomeView.vue'
import Dashboard from '@/views/Dashboard.vue'

import RoomIndex from '@/views/room/RoomIndex.vue'
import RoomCreate from '@/views/room/RoomCreate.vue'
import RoomEdit from '@/views/room/RoomEdit.vue'

import UserIndex from '@/views/user/UserIndex.vue'
import CreateUser from '@/views/user/UserCreate.vue'
import EditUser from '@/views/user/UserEdit.vue'

import FsIndex from '@/views/fixed-schedule/FsIndex.vue'
import FixedScheduleCreate from '@/views/fixed-schedule/FsCreate.vue'
import FixedScheduleEdit from '@/views/fixed-schedule/FsEdit.vue'

import AdminReservation from '@/views/reservation/ReservationIndex.vue'
import AddReservations from '@/views/reservation/ReservationsCreate.vue';
import Profile from '@/views/Profile.vue'

import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },

  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
      },
      {
        path: 'room',
        name: 'RoomIndex',
        component: RoomIndex,
      },
      {
        path: 'room/create',
        name: 'RoomCreate',
        component: RoomCreate,
      },
      {
        path: 'room/:id/edit',
        name: 'RoomEdit',
        component: RoomEdit,
      },
      {
        path: 'user',
        name: 'UserIndex',
        component: UserIndex,
      },
      {
        path: 'user/create',
        name: 'CreateUser',
        component: CreateUser,
      },
      {
        path: 'user/:id/edit',
        name: 'EditUser',
        component: EditUser,
      },
      {
        path: 'fixed-schedules',
        name: 'FsIndex',
        component: FsIndex,
      },
      {
        path: 'fixed-schedules/create',
        name: 'FsCreate',
        component: FixedScheduleCreate,
      },
      {
        path: 'fixed-schedules/:id/edit',
        name: 'FsEdit',
        component: FixedScheduleEdit,
      },
      {
        path: 'reservations',
        name: 'AdminReservation',
        component: AdminReservation,
      },
    ],
  },
  {
    path: '/karyawan',
    component: KaryawanLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: HomeView,
      },
      {
        path: 'reservations/create',
        name: 'createReservations',
        component: AddReservations,
      },
      {
        path:'profile',
        name:'Profile',
        component: Profile
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'bg-neutral-400 font-semibold text-white',
  linkExactActiveClass: 'bg-neutral-400 font-semibold text-white',
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Cek apakah route membutuhkan autentikasi
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      // Belum login, redirect ke halaman login
      return next({ name: 'Login' })
    }

    // Cek apakah route membutuhkan role admin
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (!authStore.isAdmin) {
        // Bukan admin, redirect ke home
        return next({ name: 'home' })
      }
    }
  }

  // Jika sudah login dan mencoba akses halaman login
  if (to.matched.some(record => record.meta.guest)) {
    if (authStore.isAuthenticated) {
      // Sudah login, redirect berdasarkan role
      if (authStore.isAdmin) {
        return next({ name: 'Dashboard' })
      } else {
        return next({ name: 'home' })
      }
    }
  }

  next()
})

export default router

