<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import HierarchyTree from '@/components/HierarchyTree.vue'

const loading = ref(true);
const dataError = ref(false);
const people = ref(null);

onBeforeMount(async () => {
  const response = await fetch("http://localhost:3001/people");

  if (response.status !== 200){
    dataError.value = true;
  }

  const jsonResponse = await response.json();
  people.value = jsonResponse.data;

  // Convert all peoples Salary to number for easier processing
  people.value.forEach((person) => person["Salary"] = Number(person["Salary"].replace(/[^0-9.-]+/g,"")))
  loading.value = false;
});

</script>

<template>
  <main>
    <div class="flex w-screen h-screen items-center justify-center bg-accent-500" v-if="!dataError && loading">
      <button
        type="button"
        class="pointer-events-none inline-block rounded bg-blue-800 px-6 pb-2 pt-2.5 text-lg font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 disabled:opacity-70 dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
        disabled>
        <div
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status">
        </div>
        <span class="ml-2">Loading...</span>
      </button>
    </div>

    <div class="flex w-screen h-screen" v-else-if="dataError">
      <span class="flex gap-y-4 flex-col w-fit h-fit m-auto text-center p-4 bg-rose-500 text-slate-100 rounded-xl">
        <span class="text-4xl">Failed to load CSV file</span>
        <span class="text-2xl">Go to http://localhost:3000/people to see if there is a response.</span>
      </span>
    </div>

    <div class="flex min-h-screen w-full h-full" v-else>
      <HierarchyTree :peopleData="people" treeId="tree_graph"/>
    </div>

  </main>
</template>

<style scoped>

</style>
