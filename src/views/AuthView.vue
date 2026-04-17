<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useAuthState } from '@/stores/useAuthStore'
import { auth } from '@/utils/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { toast } from 'vue-sonner'

const router = useRouter()

const mode = ref<'signin' | 'signup'>('signin')
const loading = ref(false)

const name = ref('')
const email = ref('')
const password = ref('')

const isSignUp = computed(() => mode.value === 'signup')

const { user } = useAuthState()

const toggleMode = () => {
  mode.value = isSignUp.value ? 'signin' : 'signup'
  password.value = ''
}

const onSubmit = async () => {
  if (!email.value.trim() || !password.value.trim()) {
    toast.error('Email and password are required')
    return
  }

  if (isSignUp.value && !name.value.trim()) {
    toast.error('Name is required for sign up')
    return
  }

  if (password.value.length < 6) {
    toast.error('Password must be at least 6 characters')
    return
  }

  loading.value = true
  try {
    if (isSignUp.value) {
      const response = await createUserWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value,
      )
      await updateProfile(response.user, { displayName: name.value.trim() })
      user.value = response.user
      toast.success('Account created successfully')
    } else {
      const response = await signInWithEmailAndPassword(auth, email.value.trim(), password.value)
      user.value = response.user
      toast.success('Signed in successfully')
    }

    await router.push('/')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Authentication failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 p-4 bg-gray-50 dark:bg-neutral-900">
    <div class="flex items-center justify-between">
      <h1 class="text-base font-semibold">
        {{ isSignUp ? 'Create account' : 'Sign in' }}
      </h1>
      <button
        class="text-xs text-blue-600 hover:underline disabled:opacity-50"
        :disabled="loading"
        @click="toggleMode"
      >
        {{ isSignUp ? 'Have an account? Sign in' : 'New here? Sign up' }}
      </button>
    </div>

    <div class="p-4 mt-4 border border-gray-300 rounded-lg dark:border-neutral-800">
      <p class="text-xs text-muted-foreground">
        Sign in to sync extension data across your browsers and profiles.
      </p>

      <form class="flex flex-col gap-3 mt-4" @submit.prevent="onSubmit">
        <input
          v-if="isSignUp"
          v-model="name"
          type="text"
          placeholder="Full name"
          autocomplete="name"
          class="w-full p-3 border border-gray-300 rounded-lg dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="loading"
        />
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          autocomplete="email"
          class="w-full p-3 border border-gray-300 rounded-lg dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="loading"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          autocomplete="current-password"
          class="w-full p-3 border border-gray-300 rounded-lg dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="loading"
        />
        <Button type="submit" :disabled="loading">
          {{ loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in' }}
        </Button>
      </form>
    </div>
  </div>
</template>
