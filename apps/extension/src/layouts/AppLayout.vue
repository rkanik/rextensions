<script setup lang="ts">
const router = useRouter()

const { user, isSignedIn } = useAuthState()
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

const requireAuthOrRun = (action: () => void | Promise<void>) => {
  if (!isSignedIn.value) {
    router.push('/auth')
    return
  }
  void action()
}

const appName =
  import.meta.env.MODE === 'development' ? 'Rextensions (Dev)' : 'Rextensions'
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-neutral-900">
    <header
      class="flex items-center justify-between flex-none h-12 px-4 border-b dark:bg-neutral-900"
    >
      <RouterLink to="/" class="flex items-center flex-none gap-2">
        <img src="/logo.png" :alt="appName" class="w-6 h-6" />
        <h1 class="text-base font-semibold">{{ appName }}</h1>
      </RouterLink>

      <div class="flex flex-none">
        <IconButton tooltip="Toggle Theme" @click="toggleTheme">
          <IconLucideSun class="w-[18px] h-[18px]" v-if="isDark" />
          <IconLucideMoonStar class="w-4 h-4" v-else />
        </IconButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <IconButton tooltip="Menu">
              <Avatar v-if="isSignedIn && user" class="size-9">
                <AvatarFallback>{{ initial(user.displayName || user.email) }}</AvatarFallback>
              </Avatar>
              <IconLucideMenu v-else class="w-4 h-4" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="start">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem v-if="isSignedIn && user">
              <Avatar>
                <AvatarFallback>{{ initial(user.displayName || user.email) }}</AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <div class="truncate">{{ user.displayName || 'Signed in' }}</div>
                <div class="text-xs truncate text-muted-foreground">{{ user.email }}</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem v-else @click="router.push('/auth')">
              Sign in with Google
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem @click="requireAuthOrRun(onBackup)">
                <IconLucideCloudUpload />
                <div class="flex flex-col">
                  <span>Backup</span>
                  <span class="text-[10px] text-muted-foreground">Save list to cloud</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem @click="requireAuthOrRun(onRestore)">
                <IconLucideCloudDownload />
                <div class="flex flex-col">
                  <span>Restore</span>
                  <span class="text-[10px] text-muted-foreground">Sync list (not auto-install)</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem @click="onExport">
                <IconLucideShare2 />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem class="relative">
                <IconLucidePackagePlus />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  @change="onChangeImport"
                  class="absolute inset-0 opacity-0 cursor-pointer"
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
            <DropdownMenuSeparator v-if="isSignedIn" />
            <DropdownMenuItem v-if="isSignedIn" @click="onSignOut">
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
