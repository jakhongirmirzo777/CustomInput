<template>
  <div class="app__wrapper">
    <CustomInput v-model="inputValue"/>
    <p>Data binding format (YYYY-MM-DD):</p>
    <p>{{inputValue}}</p>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import CustomInput from "@/components/CustomInput/CustomInput.vue";

const inputValue = ref('')
</script>

<style>
.app__wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>