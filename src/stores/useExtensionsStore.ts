import type { TExtension, TRemoteExtensions } from '@/types'
import tColors from 'tailwindcss/colors'
import { useAuthState } from './useAuthStore'
import { toast } from 'vue-sonner'
import { urlToBase64 } from '@/utils/urlToBase64'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'

const key = 'remoteExtensions'

const colors = Object.values(tColors)
  .filter((v) => typeof v === 'object')
  .map((v) => v[500])

const getRemoteExtensions = async () => {
  return new Promise<TRemoteExtensions[]>((resolve) => {
    chrome.storage.local.get([key], (result) => {
      try {
        const data = JSON.parse(result[key])
        if (Array.isArray(data)) {
          return resolve(data)
        }
      } catch {}
      resolve([])
    })
  })
}

export const useExtensionsStore = defineStore('extensions', () => {
  //
  const extensions = ref<TExtension[]>([])
  const remoteExtensions = ref<TRemoteExtensions[]>([])

  //
  const { user } = useAuthState()

  const onBackup = async () => {
    if (!user.value) return toast.error('Please sign in to backup your extensions')
    if (!extensions.value.length) return toast.error('No extensions to backup')

    const data = {
      exportedAt: Date.now(),
      extensions: await Promise.all(
        extensions.value.map(async (v) => {
          return {
            ...v,
            icon: v.icons?.length ? await urlToBase64(v.icons[v.icons.length - 1].url) : undefined,
          }
        }),
      ),
    }

    const id = toast.loading('Backing up extensions...')
    await setDoc(doc(collection(db, 'backups'), user.value.uid), data)
    toast.dismiss(id)
    toast.success('Extensions backed up successfully')
  }

  const onRestore = async () => {
    if (!user.value) return toast.error('Please sign in to restore your extensions')
    const id = toast.loading('Restoring extensions...')

    const document = await getDoc(doc(collection(db, 'backups'), user.value.uid))
    const data = document.data() as TRemoteExtensions | undefined
    toast.dismiss(id)

    if (!data) return toast.error('No backup found')

    const item = {
      file: {
        name: 'Cloud Backup',
        size: data.extensions.length,
      },
      color: colors[Math.floor(Math.random() * colors.length)],
      size: data.extensions.length,
      importedAt: Date.now(),
      exportedAt: data.exportedAt,
      extensions: data.extensions,
    }

    const items = await getRemoteExtensions()

    const index = items.findIndex((e) => e.file.name === item.file.name)
    if (index !== -1) items[index] = item
    else items.push(item)

    remoteExtensions.value = items
    chrome.storage.local.set({ [key]: JSON.stringify(items) })

    toast.success('Extensions restored successfully')
  }

  onMounted(() => {
    chrome.management.getAll((e) => {
      extensions.value = e as TExtension[]
    })
    getRemoteExtensions().then((data) => {
      remoteExtensions.value = data
    })
  })

  return {
    extensions,
    remoteExtensions,
    onBackup,
    onRestore,
  }
})

export const useExtensionsState = () => {
  return storeToRefs(useExtensionsStore())
}
