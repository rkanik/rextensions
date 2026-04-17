import { auth } from '@/utils/firebase'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { toast } from 'vue-sonner'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const unsubscribe = ref<() => void | undefined>()

  const onSignOut = async () => {
    try {
      await signOut(auth)
      toast.success('Signed out')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign out failed')
    }
  }

  onMounted(() => {
    unsubscribe.value = onAuthStateChanged(auth, (u) => {
      user.value = u
      chrome.storage.local.set({
        user: u?.toJSON(),
      })
    })
    chrome.storage.local.get('user', (result) => {
      if (!result.user) return
      user.value = result.user
    })
  })

  onUnmounted(() => {
    unsubscribe.value?.()
  })

  return {
    user,
    onSignOut,
  }
})

export const useAuthState = () => {
  return storeToRefs(useAuthStore())
}
