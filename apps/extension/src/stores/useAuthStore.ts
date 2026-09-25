import { onAuthStateChanged, type User } from 'firebase/auth'
import { toast } from 'vue-sonner'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const authReady = ref(false)
  const unsubscribe = ref<() => void | undefined>()

  const isSignedIn = computed(() => !!user.value?.uid)

  const onSignOut = async () => {
    try {
      await signOutGoogleExtensionSession(auth)
      user.value = null
      chrome.storage.local.remove('user')
      toast.success('Signed out')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign out failed')
    }
  }

  onMounted(() => {
    unsubscribe.value = onAuthStateChanged(auth, (u) => {
      user.value = u
      authReady.value = true
      if (u) {
        chrome.storage.local.set({ user: u.toJSON() })
      } else {
        chrome.storage.local.remove('user')
      }
    })
  })

  onUnmounted(() => {
    unsubscribe.value?.()
  })

  return {
    user,
    authReady,
    isSignedIn,
    onSignOut,
  }
})

export const useAuthState = () => {
  return storeToRefs(useAuthStore())
}
