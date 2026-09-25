import tColors from 'tailwindcss/colors'
import { toast } from 'vue-sonner'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import z from 'zod'

const key = 'remoteExtensions'
const CLOUD_BACKUP_NAME = 'Cloud Backup'
/** Leave headroom under Firestore's 1 MiB document limit. */
const MAX_BACKUP_BYTES = 900_000

const colors = Object.values(tColors)
  .filter((v) => typeof v === 'object')
  .map((v) => v[500])

const zImportedExtensions = z.object({
  file: z.object({
    name: z.string(),
    size: z.number(),
  }),
  color: z.string(),
  size: z.number(),
  importedAt: z.number(),
  exportedAt: z.number(),
  extensions: z.array(z.any()),
})

const getRemoteExtensions = async () => {
  return new Promise<TRemoteExtensions[]>((resolve) => {
    chrome.storage.local.get([key], (result) => {
      try {
        const data = JSON.parse(result[key])
        if (Array.isArray(data)) {
          return resolve(data)
        }
      } catch {
        // ignore corrupt storage
      }
      resolve([])
    })
  })
}

const saveRemoteExtensions = async (items: TRemoteExtensions[]) => {
  await chrome.storage.local.set({ [key]: JSON.stringify(items) })
}

const buildExtensionPayload = async (list: TExtension[], includeIcons: boolean) => {
  return Promise.all(
    list.map(async (v) => {
      const base = { ...v }
      if (!includeIcons) {
        delete (base as { icon?: string }).icon
        return base
      }
      return {
        ...base,
        icon: v.icons?.length ? await urlToBase64(v.icons[v.icons.length - 1].url) : undefined,
      }
    }),
  )
}

const upsertRemoteItem = async (item: TRemoteExtensions) => {
  const items = await getRemoteExtensions()
  const index = items.findIndex((e) => e.file.name === item.file.name)
  if (index !== -1) items[index] = item
  else items.push(item)
  await saveRemoteExtensions(items)
  return items
}

export const useExtensionsStore = defineStore('extensions', () => {
  const extensions = ref<TExtension[]>([])
  const remoteExtensions = ref<TRemoteExtensions[]>([])

  const { user, isSignedIn } = useAuthState()

  const onBackup = async () => {
    if (!isSignedIn.value || !user.value?.uid) {
      return toast.error('Sign in with Google to backup your extensions')
    }
    if (!extensions.value.length) {
      return toast.error('No extensions to backup')
    }

    const id = toast.loading('Backing up extensions...')
    try {
      let withIcons = true
      let payloadExtensions = await buildExtensionPayload(extensions.value, true)
      let data = { exportedAt: Date.now(), extensions: payloadExtensions }

      if (new Blob([JSON.stringify(data)]).size > MAX_BACKUP_BYTES) {
        withIcons = false
        payloadExtensions = await buildExtensionPayload(extensions.value, false)
        data = { exportedAt: Date.now(), extensions: payloadExtensions }
      }

      if (new Blob([JSON.stringify(data)]).size > MAX_BACKUP_BYTES) {
        toast.dismiss(id)
        return toast.error('Backup too large for cloud storage. Export JSON instead.')
      }

      await setDoc(doc(collection(db, 'backups'), user.value.uid), data)
      toast.dismiss(id)
      toast.success(
        withIcons
          ? 'Extensions backed up successfully'
          : 'Extensions backed up (icons omitted to fit size limit)',
      )
    } catch (error) {
      toast.dismiss(id)
      toast.error(error instanceof Error ? error.message : 'Backup failed')
    }
  }

  const onRestore = async () => {
    if (!isSignedIn.value || !user.value?.uid) {
      return toast.error('Sign in with Google to restore your extensions')
    }

    const id = toast.loading('Restoring extension list...')
    try {
      const document = await getDoc(doc(collection(db, 'backups'), user.value.uid))
      const data = document.data() as { exportedAt?: number; extensions?: TExtension[] } | undefined

      if (!data?.extensions?.length) {
        toast.dismiss(id)
        return toast.error('No cloud backup found')
      }

      const item: TRemoteExtensions = {
        file: {
          name: CLOUD_BACKUP_NAME,
          size: data.extensions.length,
        },
        color: colors[Math.floor(Math.random() * colors.length)],
        size: data.extensions.length,
        importedAt: Date.now(),
        exportedAt: data.exportedAt ?? Date.now(),
        extensions: data.extensions,
      }

      remoteExtensions.value = await upsertRemoteItem(item)
      toast.dismiss(id)
      toast.success('Sync list restored. Use Open Store for missing extensions.')
    } catch (error) {
      toast.dismiss(id)
      toast.error(error instanceof Error ? error.message : 'Restore failed')
    }
  }

  const onExport = async () => {
    try {
      const data = {
        exportedAt: Date.now(),
        extensions: await buildExtensionPayload(extensions.value, true),
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

  const onImport = async (file?: File): Promise<void> => {
    if (!file) {
      toast.error('No file selected')
      return
    }
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const parsed = zImportedExtensions.safeParse({
          file: {
            name: file.name,
            size: file.size,
          },
          color: colors[Math.floor(Math.random() * colors.length)],
          size: data.extensions.length,
          importedAt: Date.now(),
          exportedAt: data.exportedAt,
          extensions: data.extensions,
        })

        if (!parsed.success) {
          return toast.error(`Error: ${parsed.error.message}`)
        }

        const item = parsed.data as TRemoteExtensions
        remoteExtensions.value = await upsertRemoteItem(item)
        toast.success('Extensions imported successfully')
      } catch (error) {
        toast.error(`Error: ${error instanceof Error ? error.message : 'parse error'}`)
      }
    }
    reader.readAsText(file)
  }

  const onDeleteRemoteExtensions = async (item: TRemoteExtensions) => {
    const items = await getRemoteExtensions()
    remoteExtensions.value = items.filter((e) => e.file.name !== item.file.name)
    await saveRemoteExtensions(remoteExtensions.value)
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
    onExport,
    onImport,
    onDeleteRemoteExtensions,
  }
})

export const useExtensionsState = () => {
  return storeToRefs(useExtensionsStore())
}
