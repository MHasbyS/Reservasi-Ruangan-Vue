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

const routes = [
  {
    path: '/',
    redirect: '/login',
  },

  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/admin',
    component: AdminLayout,
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
    path: '/',
    component: KaryawanLayout,
    children: [
      {
        path: '/home',
        name: 'home',
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
  history: createWebHistory(import.meta.env.baseURL),
  routes,
  linkActiveClass: 'bg-neutral-400 font-semibold text-white',
  linkExactActiveClass: 'bg-neutarl-400 font-semibold text-white',
})

export default router
