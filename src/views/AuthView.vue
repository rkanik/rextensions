<script setup lang="ts">
import { FormField } from '@/components/ui/form'
import { toTypedSchema } from '@vee-validate/zod'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const router = useRouter()

const mode = ref<'signin' | 'signup'>('signin')
const loading = ref(false)

const isSignUp = computed(() => mode.value === 'signup')

const authFormSchema = z
  .object({
    name: z.string(),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(1, 'Password is required').min(6, 'At least 6 characters'),
  })
  .superRefine((data, ctx) => {
    if (mode.value === 'signup' && !data.name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Name is required',
        path: ['name'],
      })
    }
  })

const validationSchema = toTypedSchema(authFormSchema)

const { resetForm, values, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    name: '',
    email: '',
    password: '',
  },
})

const toggleMode = () => {
  mode.value = isSignUp.value ? 'signin' : 'signup'
  resetForm({
    values: {
      name: '',
      email: values.email,
      password: '',
    },
  })
}

type AuthFormValues = z.infer<typeof authFormSchema>

const onAuthSubmit = handleSubmit(async (formValues: AuthFormValues) => {
  loading.value = true
  try {
    if (isSignUp.value) {
      const response = await createUserWithEmailAndPassword(
        auth,
        formValues.email.trim(),
        formValues.password,
      )
      await updateProfile(response.user, { displayName: formValues.name.trim() })
      toast.success('Account created successfully')
    } else {
      await signInWithEmailAndPassword(auth, formValues.email.trim(), formValues.password)
      toast.success('Signed in successfully')
    }

    await router.push('/')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Authentication failed')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col flex-1 p-4 bg-gray-50 dark:bg-neutral-900">
    <div class="flex items-center justify-between">
      <h1 class="text-base font-semibold">
        {{ isSignUp ? 'Create account' : 'Sign in' }}
      </h1>
      <button
        type="button"
        class="text-xs text-blue-600 hover:underline disabled:opacity-50"
        :disabled="loading"
        @click="toggleMode"
      >
        {{ isSignUp ? 'Have an account? Sign in' : 'New here? Sign up' }}
      </button>
    </div>

    <div class="p-4 mt-4 border border-gray-300 rounded-lg dark:border-neutral-800">
      <p class="text-xs text-muted-foreground">
        Optional: sign in for cloud backup and sync when you choose to use it.
      </p>

      <form class="mt-4 space-y-4" @submit="onAuthSubmit">
        <FormField v-slot="{ componentField }" name="name" :validate-on-model-update="false">
          <FormItem v-show="isSignUp">
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input autocomplete="name" :disabled="loading" v-bind="componentField" class="mt-2" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email" :validate-on-model-update="false">
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input
                type="email"
                autocomplete="email"
                :disabled="loading"
                v-bind="componentField"
                class="mt-2"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password" :validate-on-model-update="false">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                autocomplete="current-password"
                :disabled="loading"
                v-bind="componentField"
                class="mt-2"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in' }}
        </Button>
      </form>
    </div>
  </div>
</template>
