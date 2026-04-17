<script setup lang="ts">
import { toast } from 'vue-sonner'

const searchQuery = ref('')

const { extensions, remoteExtensions } = useExtensionsState()
const { onDeleteRemoteExtensions } = useExtensionsStore()

const filter = (item: TExtension) => {
  return (
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
}

const filteredLocalExtensions = computed(() => {
  return extensions.value.filter(filter)
})

const groupedLocalExtensions = computed(() => {
  return groupBy(
    filteredLocalExtensions.value.map((e) => {
      return {
        ...e,
        colors: remoteExtensions.value
          .filter((x) => x.extensions.some((v) => v.id === e.id))
          .map((v) => v.color),
      }
    }),
    (e) => (e.enabled ? 'Enabled' : 'Disabled'),
  )
})

const filteredRemoteExtensions = computed(() => {
  return remoteExtensions.value.map((e) => {
    return {
      ...e,
      extensions: e.extensions
        .filter((e) => !extensions.value.some((v) => v.id === e.id))
        .filter(filter),
    }
  })
})

const onToggleEnabled = async (extension: TExtension) => {
  chrome.management.get(extension.id, (extension) => {
    if (chrome.runtime.lastError) {
      toast.error('Failed to get extension info')
      return
    }
    const newEnabledState = !extension.enabled
    chrome.management.setEnabled(extension.id, newEnabledState, () => {
      if (chrome.runtime.lastError) {
        toast.error('Failed to toggle extension')
        return
      }
      extensions.value = extensions.value.map((e) =>
        e.id === extension.id ? { ...e, enabled: newEnabledState } : e,
      )
    })
  })
}

const onUninstallExtension = async (extension: TExtension) => {
  chrome.management.uninstall(extension.id, {}, () => {
    if (chrome.runtime.lastError) {
      toast.error('Failed to remove extension')
      return
    }
  })
}

const onInstallExtension = async (extension: TExtension) => {
  chrome.tabs.create({
    url: extension.homepageUrl || `https://chromewebstore.google.com/detail/${extension.id}`,
  })
}
</script>

<template>
  <div>
    <!-- Search -->
    <div class="flex-none px-4 mt-4">
      <Input v-model="searchQuery" placeholder="Search extensions..." />
    </div>

    <div class="flex flex-col flex-1 gap-4 px-4 pb-8 mt-4 overflow-y-auto">
      <!-- Enabled Extensions -->
      <div v-if="groupedLocalExtensions['Enabled']?.length">
        <div class="text-sm font-semibold">Enabled</div>
        <div class="flex flex-wrap gap-2 mt-2">
          <ExtensionCard
            v-for="extension in groupedLocalExtensions['Enabled']"
            :key="extension.id"
            :is-local="true"
            :extension="extension"
            @toggle="onToggleEnabled"
            @install="onInstallExtension"
            @uninstall="onUninstallExtension"
          />
        </div>
      </div>

      <!-- Disabled Extensions -->
      <div v-if="groupedLocalExtensions['Disabled']?.length">
        <div class="text-sm font-semibold">Disabled</div>
        <div class="flex flex-wrap gap-2 mt-2">
          <ExtensionCard
            v-for="extension in groupedLocalExtensions['Disabled']"
            :key="extension.id"
            :is-local="true"
            :extension="extension"
            @toggle="onToggleEnabled"
            @install="onInstallExtension"
            @uninstall="onUninstallExtension"
          />
        </div>
      </div>

      <div v-for="(item, index) in filteredRemoteExtensions" :key="index">
        <div class="flex justify-between gap-2">
          <div
            class="self-center flex-none w-2 h-2 rounded-full"
            :style="{ backgroundColor: item.color }"
          />
          <div class="flex flex-col flex-1 overflow-hidden">
            <div class="text-sm font-semibold truncate">
              {{ item.file.name }}
            </div>
            <div class="text-xs text-muted-foreground">
              {{ $d(item.importedAt).fromNow() }}, {{ item.size }} extensions
            </div>
          </div>
          <div class="flex-none">
            <IconButton tooltip="Delete" @click="onDeleteRemoteExtensions(item)">
              <IconLucideTrash2 class="w-4 h-4" />
            </IconButton>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <ExtensionCard
            v-for="extension in item.extensions"
            :key="extension.id"
            :extension="extension"
            @toggle="onToggleEnabled"
            @install="onInstallExtension"
            @uninstall="onUninstallExtension"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!filteredLocalExtensions.length && !filteredRemoteExtensions.length"
        class="py-8 text-center"
      >
        <div class="mb-2 text-sm font-medium">No extensions found</div>
        <p class="text-xs text-muted-foreground">
          {{
            searchQuery
              ? 'No extensions found matching your search'
              : 'Install extensions to get started'
          }}
        </p>
      </div>
    </div>
  </div>
</template>
