<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import userService from "@/services/UserService";

const router = useRouter();
const loading = ref(false);

const name = ref("");
const email = ref("");
const role = ref("");

// Fetch Profil
const fetchProfile = async () => {
  loading.value = true;
  try {
    const res = await userService.getProfile();
    name.value = res.data.data.name;
    email.value = res.data.data.email;
    role.value = res.data.data.role ?? "-";
  } catch (error) {
    console.error("Gagal mengambil profil:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchProfile());

// Arahkan ke halaman Edit Profile
const goToEdit = () => {
  router.push("/profile/edit");
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="max-w-2xl mx-auto mt-10 p-4">
    <Card class="shadow-md border rounded-xl">
      <CardHeader>
        <CardTitle class="text-xl font-bold">Profil Pengguna</CardTitle>
      </CardHeader>

      <CardContent class="space-y-4">

        <div class="flex justify-center">
          <img src="@/assets/hoshino.jpg" class="w-32 h-32 rounded-full object-cover border shadow" />
        </div>

        <!-- Nama -->
        <div class="space-y-1">
          <Label>Nama</Label>
          <Input v-model="name" readonly class="bg-gray-100" />
        </div>

        <!-- Email -->
        <div class="space-y-1">
          <Label>Email</Label>
          <Input v-model="email" readonly type="email" class="bg-gray-100" />
        </div>

        <!-- Role -->
        <div class="space-y-1">
          <Label>Role</Label>
          <Input v-model="role" readonly class="bg-gray-100" />
        </div>

      </CardContent>

      <CardFooter class="flex justify-end">
        <Button @click="goToEdit" class="mr-2">Edit Profil</Button>
        <Button variant="outline" @click="goBack">Kembali</Button>
      </CardFooter>
    </Card>
  </div>
</template>
