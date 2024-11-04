<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'

// State
const currentPage = ref(1)

// Data fetching
const { data: sessionData, refresh } = await useFetch('/api/sessions', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 10
  }))
})

// Computed properties
const sessions = computed(() => sessionData.value?.sessions || [])
const pagination = computed(() => sessionData.value?.pagination || { pageCount: 1 })

// Methods
const navigateToSession = (sessionId: string) => {
  // We'll implement the session replay view later
  console.log('Navigate to session: ', sessionId)
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
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Session ID
                  </th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Website ID
                  </th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Started
                  </th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Events
                  </th>
                  <th class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
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
                    <button
                      @click="navigateToSession(session.id)"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      View<span class="sr-only">, {{  session.id }}</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>