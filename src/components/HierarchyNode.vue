<script setup>
import { computed, onBeforeMount, ref, toRefs, unref } from 'vue'
import {
  memoizedCalc,
  memoizedICCost,
  memoizedManagementCost,
  memoizedTotalCost
} from '@/helpers/memoize.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  person: {
    type: Object,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  node: {
    type: Object,
    required: true
  }})

const propsAsRefs = unref(props);

let uniqueDepartments = [...new Set(props.data.map(p => p['Department']))]

const colorArray = [
  'gray',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'zinc'
]
let formatter = Intl.NumberFormat('en', { notation: 'compact' })
const initials = computed(() => {
  return props.person.data['Name'].split(' ').map((val) => val[0]).join('')
})
const backgroundCard = computed(() => {
  return `bg-${departmentColor}-50 group-hover:bg-${departmentColor}-100`
})
const backgroundPills = computed(() => {
  return `bg-${departmentColor}-200`
})
const descendantsCount = computed(() => memoizedCalc(props.node))
const nodeICCost = computed(() => memoizedICCost(props.node))
const nodeICCostFormatted = computed(() => formatter.format(nodeICCost.value))
const managementCost = computed(() => memoizedManagementCost(props.node))
const managementCostFormatted = computed(() => formatter.format(managementCost.value))
const totalCost = computed(() => formatter.format(memoizedTotalCost(props.node)))
const managementCostRatio = computed(() => formatter.format(nodeICCost.value / managementCost.value))

const getDepartmentColor = (nodeDepartment) => {
  const deptIdx = uniqueDepartments.indexOf(nodeDepartment)
  return deptIdx ? colorArray[deptIdx] : 'red'
}

const departmentColor = getDepartmentColor(props.person.data['Department'])

</script>

<template>

  <div :class="`relative m-auto flex flex-col p-4 gap-y-2 rounded-lg shadow-md group-hover:cursor-pointer ${backgroundCard}`">
    <div class="flex bg-blue-400 rounded-full text-white p-3 self-start -mt-8">{{ initials }}</div>
    <div class="flex flex-col gap-y-1 mt-0">
      <span class="font-medium mx-auto text-lg">{{ propsAsRefs.person.data["Name"] }}</span>
      <span class="mx-auto text-gray-600 text-sm">{{ propsAsRefs.person.data["Job Title"] }}</span>
    </div>

    <div class="flex flex-col gap-1 mb-0 text-sm">
      <!-- Department-->
      <span :class="`px-2 py-0.5 rounded-2xl m-auto border-2 border-gray-800 border-opacity-60 ${backgroundPills}`">
        {{ propsAsRefs.person.data["Department"] }}
      </span>
      <!-- Location -->
      <span :class="`flex flex-row px-2 py-0.5 gap-x-1 rounded-2xl m-auto ${backgroundPills}`">
        <font-awesome-icon :icon="faLocationDot" />
        <span class="flex text-center">{{props.person.data["Location"]}}</span>
      </span>
      <!-- Level -->
      <span :class="`px-2 py-0.5 rounded-2xl m-auto ${backgroundPills}`">
        Level {{ props.person.data["level"] }}
      </span>

      <!-- Management Cost -->
      <span v-if="props.person._children?.length > 0" :class="`flex text-center px-2 py-0.5 rounded-2xl m-auto ${backgroundPills}`">
        Management cost: ${{ managementCostFormatted }}
      </span>
      <!-- IC Cost -->
      <span :class="`text-center px-2 py-0.5 rounded-2xl m-auto ${backgroundPills}`">
        IC cost: ${{ nodeICCostFormatted }}
      </span>
      <!-- Total Cost -->
      <span v-if="props.person._children?.length > 0" :class="`flex text-center px-2 py-0.5 rounded-2xl m-auto ${backgroundPills}`">
        Total cost: ${{ totalCost }}
      </span>
      <!-- Management cost ratio -->
      <span v-if="props.person._children?.length > 0" :class="`flex text-center px-2 py-0.5 rounded-2xl m-auto ${backgroundPills}`">
        Management cost ratio: {{ managementCostRatio }}
      </span>
    </div>
    <div v-if="props.person._children?.length > 0" class="bg-slate-700 rounded-3xl text-white w-fit px-2 py-0.5 m-auto">
      <span class="text-center">{{props.person._children.length}} / {{ descendantsCount }}</span>
    </div>
  </div>


</template>
