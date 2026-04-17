<script setup lang="ts">
import type { TExtension } from '@/types'
import { toast } from 'vue-sonner'

const { user } = useAuthState()
const { onSignOut } = useAuthStore()

const { isDark } = useThemeState()
const { toggleTheme } = useThemeStore()

const searchQuery = ref('')

const localExtensions = ref<TExtension[]>([])
const { remoteExtensions, importRemoteExtensions, deleteRemoteExtensions } = useRemoteExtensions()

const { onBackup, onRestore } = useExtensionsStore()

const filter = (item: TExtension) => {
  return (
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
}

const filteredLocalExtensions = computed(() => {
  return localExtensions.value.filter(filter)
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
        .filter((e) => !localExtensions.value.some((v) => v.id === e.id))
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
      localExtensions.value = localExtensions.value.map((e) =>
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

const onOpenExtensions = () => {
  chrome.tabs.create({
    url: 'chrome://extensions/',
  })
}

const exportExtensions = async () => {
  try {
    const data = {
      exportedAt: Date.now(),
      extensions: await Promise.all(
        localExtensions.value.map(async (v) => {
          return {
            ...v,
            icon: v.icons?.length ? await urlToBase64(v.icons[v.icons.length - 1].url) : undefined,
          }
        }),
      ),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = window.prompt('Enter a name for the export') || `Extensions-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Extensions exported successfully!')
  } catch (error) {
    toast.error(
      `${error instanceof Error ? `Error: ${error.message}` : 'Failed to export extensions!'}`,
    )
  }
}

const router = useRouter()

const onImportExtensions = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target) return
  importRemoteExtensions(target.files?.[0])
  target.value = ''
}

const onOpenInNewTab = () => {
  chrome.tabs.create({
    url: 'popup.html',
  })
}

onMounted(() => {
  chrome.management.getAll((extensions) => {
    localExtensions.value = extensions as TExtension[]
  })
})
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-neutral-900">
    <!-- Header -->
    <div class="flex items-center justify-between flex-none px-4 pt-4 dark:bg-neutral-900">
      <div class="flex items-center gap-2">
        <img src="/logo.png" alt="Rextensions" class="w-6 h-6" />
        <h1 class="text-base font-semibold">Rextensions</h1>
      </div>

      <!-- Action Buttons -->
      <div class="flex">
        <IconButton tooltip="Toggle Theme" @click="toggleTheme">
          <IconLucideSun class="w-[18px] h-[18px]" v-if="isDark" />
          <IconLucideMoonStar class="w-4 h-4" v-else />
        </IconButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <IconButton tooltip="Menu">
              <Avatar v-if="user" class="size-9">
                <AvatarFallback>{{ initial(user.displayName) }}</AvatarFallback>
              </Avatar>
              <IconLucideMenu v-else class="w-4 h-4" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="start">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem v-if="user">
              <Avatar>
                <AvatarFallback>{{ initial(user.displayName) }}</AvatarFallback>
              </Avatar>
              <div>
                <div>{{ user.displayName }}</div>
                <div class="text-xs text-muted-foreground">{{ user.email }}</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem v-else @click="router.push('/auth')">Sign In</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem @click="onBackup">
                <IconLucideCloudUpload />
                <span>Backup</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="onRestore">
                <IconLucideCloudDownload />
                <span>Restore</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem @click="exportExtensions">
                <IconLucideShare2 />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconLucidePackagePlus />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  @change="onImportExtensions"
                  class="absolute inset-0 opacity-0"
                />
              </DropdownMenuItem>
              <DropdownMenuItem @click="onOpenExtensions">
                <IconLucideBlocks />
                Manage Extensions
              </DropdownMenuItem>
              <DropdownMenuItem @click="onOpenInNewTab">
                <IconLucideExternalLink />
                <span>Open in new tab</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator v-if="user" />
            <DropdownMenuItem v-if="user" @click="onSignOut">
              <IconLucideLogOut />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Search -->
    <div class="flex-none px-4 mt-2">
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
            <IconButton tooltip="Delete" @click="deleteRemoteExtensions(item)">
              <LucideTrash2 class="w-4 h-4" />
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
