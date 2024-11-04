<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'

const router = useRouter()
const currentPage = ref(1)

const { data: sessionData, refresh } = await useFetch('/api/sessions', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 10
  }))
})

const sessions = computed(() => sessionData.value?.sessions || [])
const pagination = computed(() => sessionData.value?.pagination || { pageCount: 1 })

const navigateToSession = (sessionId: string) => {
  router.push(`/sessions/${sessionId}`)
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < pagination.value.pageCount) {
    currentPage.value++
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h2 class="text-xl font-semibold text-gray-900">Recorded Sessions</h2>
        <p class="mt-2 text-sm text-gray-700">
          A list of all recorded sessions across your websites.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16">
        <button
          @click="refresh"
          class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <!-- Table header remains the same -->
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="session in sessions" :key="session.id">
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {{ session.id }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ session.websiteId }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ formatDistanceToNow(new Date(session.startedAt), { addSuffix: true }) }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ session.eventCount }}
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <!-- Changed to NuxtLink -->
                    <NuxtLink
                      :to="`/sessions/${session.id}`"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      View<span class="sr-only">, {{ session.id }}</span>
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <!-- Mobile pagination -->
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
        >
          Previous
        </button>
        <button
          @click="nextPage"
          :disabled="currentPage === pagination.pageCount"
          class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === pagination.pageCount }"
        >
          Next
        </button>
      </div>

      <!-- Desktop pagination -->
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing page <span class="font-medium">{{ currentPage }}</span> of
            <span class="font-medium">{{ pagination.pageCount }}</span>
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === pagination.pageCount"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === pagination.pageCount }"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>