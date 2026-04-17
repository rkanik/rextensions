<script setup lang="ts">
const router = useRouter()

const { user } = useAuthState()
const { isDark } = useThemeState()

const { onSignOut } = useAuthStore()
const { toggleTheme } = useThemeStore()
const { onBackup, onRestore, onExport, onImport } = useExtensionsStore()

const onChromeTabCreate = (url: string) => {
  chrome.tabs.create({ url })
}

const onOpenNewTab = () => {
  onChromeTabCreate('popup.html')
}

const onOpenExtensions = () => {
  onChromeTabCreate('chrome://extensions/')
}

const onChangeImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target) return
  onImport(target.files?.[0])
  target.value = ''
}
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-neutral-900">
    <header
      class="flex items-center justify-between flex-none h-12 px-4 border-b dark:bg-neutral-900"
    >
      <RouterLink to="/" class="flex items-center flex-none gap-2">
        <img src="/logo.png" alt="Rextensions" class="w-6 h-6" />
        <h1 class="text-base font-semibold">Rextensions</h1>
      </RouterLink>

      <!-- Action Buttons -->
      <div class="flex flex-none">
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
              <DropdownMenuItem @click="onExport">
                <IconLucideShare2 />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconLucidePackagePlus />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  @change="onChangeImport"
                  class="absolute inset-0 opacity-0"
                />
              </DropdownMenuItem>
              <DropdownMenuItem @click="onOpenExtensions">
                <IconLucideBlocks />
                Manage Extensions
              </DropdownMenuItem>
              <DropdownMenuItem @click="onOpenNewTab">
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
    </header>
    <RouterView />
  </div>
</template>
