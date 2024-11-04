<script setup lang="ts">
const activeSection = ref('about')
const showModal = ref(false)

const scrollToSection = (section: string) => {
  activeSection.value = section
  const element = document.getElementById(section)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const toggleModal = () => {
  showModal.value = !showModal.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm sticky top-0">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex">
            <div class="flex flex-shrink-0 items-center">
              <h1 class="text-xl font-bold text-indigo-600">Demo Site</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                v-for="section in ['about', 'features', 'contact']"
                :key="section"
                @click="scrollToSection(section)"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="{
                  'border-b-2 border-indigo-500 text-gray-900': activeSection === section,
                  'text-gray-500 hover:text-gray-700': activeSection !== section
                }"
              >
                {{ section.charAt(0).toUpperCase() + section.slice(1) }}
              </button>
            </div>
          </div>
          <div class="flex items-center">
            <button
              @click="toggleModal"
              class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Open Modal
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <!-- About Section -->
      <section id="about" class="mb-20">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 mb-6">About</h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="bg-white shadow-sm rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Welcome to our Demo</h3>
            <p class="text-gray-600">
              This is a demo site to showcase session replay functionality. Move your mouse around,
              click different elements, and scroll the page to see how user interactions are recorded.
            </p>
          </div>
          <div class="bg-white shadow-sm rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Interactive Elements</h3>
            <div class="space-y-4">
              <button
                class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md w-full text-left"
              >
                Clickable Button 1
              </button>
              <button
                class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md w-full text-left"
              >
                Clickable Button 2
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="mb-20">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 mb-6">Features</h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div class="h-12 w-12 rounded-lg bg-indigo-100 mb-4"></div>
            <h3 class="text-lg font-semibold mb-2">Feature {{ i }}</h3>
            <p class="text-gray-600">
              This is a sample feature description. Hover and click these cards to generate events.
            </p>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="mb-20">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 mb-6">Contact</h2>
        <div class="bg-white shadow-sm rounded-lg p-6">
          <form class="space-y-6" @submit.prevent>
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                rows="4"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <button
              type="submit"
              class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
    >
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                @click="toggleModal"
                class="rounded-md bg-white text-gray-400 hover:text-gray-500"
              >
                <span class="sr-only">Close</span>
                <span class="h-6 w-6">×</span>
              </button>
            </div>
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-base font-semibold leading-6 text-gray-900">
                  Modal Title
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    This is a sample modal to demonstrate capturing interactions with
                    modals and overlays in the session replay.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                @click="toggleModal"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>