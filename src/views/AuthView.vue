<script setup lang="ts">
import { toast } from 'vue-sonner'

const router = useRouter()
const loading = ref(false)

const authErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Sign in failed'
  if (message.includes('OAuth2') || message.includes('bad client')) {
    return 'OAuth client misconfigured. Set VITE_CHROME_OAUTH_CLIENT_ID and rebuild.'
  }
  if (message.includes('The user did not approve') || message.includes('canceled')) {
    return 'Sign in canceled'
  }
  return message
}

const onGoogleSignIn = async () => {
  loading.value = true
  try {
    await signInWithGoogleUsingChromeIdentity(auth)
    toast.success('Signed in with Google')
    await router.push('/')
  } catch (error) {
    toast.error(authErrorMessage(error))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 p-4 bg-gray-50 dark:bg-neutral-900">
    <div class="flex items-center justify-between">
      <h1 class="text-base font-semibold">Sign in</h1>
      <button
        type="button"
        class="text-xs text-muted-foreground hover:underline disabled:opacity-50"
        :disabled="loading"
        @click="router.push('/')"
      >
        Back
      </button>
    </div>

    <div
      class="flex flex-col flex-1 gap-4 p-4 mt-4 border border-gray-300 rounded-lg dark:border-neutral-800"
    >
      <p class="text-xs text-muted-foreground">
        Sign in with Google to backup and restore your extension list across browsers. Local
        manage, export, and import work without an account.
      </p>

      <div class="flex flex-col justify-center flex-1 gap-3">
        <Button type="button" class="w-full" :disabled="loading" @click="onGoogleSignIn">
          <IconLucideLogIn class="w-4 h-4" />
          {{ loading ? 'Signing in...' : 'Continue with Google' }}
        </Button>
        <p class="text-[11px] text-center text-muted-foreground">
          Account recovery is handled by your Google Account.
        </p>
      </div>
    </div>
  </div>
</template>
