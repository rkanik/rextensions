import tColors from 'tailwindcss/colors'
import { toast } from 'vue-sonner'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import z from 'zod'

const key = 'remoteExtensions'

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

  const onExport = async () => {
    try {
      const data = {
        exportedAt: Date.now(),
        extensions: await Promise.all(
          extensions.value.map(async (v) => {
            return {
              ...v,
              icon: v.icons?.length
                ? await urlToBase64(v.icons[v.icons.length - 1].url)
                : undefined,
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
        const items = await getRemoteExtensions()

        const index = items.findIndex((e) => e.file.name === item.file.name)
        if (index !== -1) items[index] = item
        else items.push(item)

        remoteExtensions.value = items
        chrome.storage.local.set({ [key]: JSON.stringify(items) })
        //
        toast.success('Extensions imported successfully')
        //
      } catch (error) {
        toast.error(`Error: ${error instanceof Error ? error.message : 'parse error'}`)
      }
    }
    reader.readAsText(file)
  }

  const onDeleteRemoteExtensions = async (item: TRemoteExtensions) => {
    const items = await getRemoteExtensions()
    remoteExtensions.value = items.filter((e) => e.file.name !== item.file.name)
    chrome.storage.local.set({ [key]: JSON.stringify(remoteExtensions.value) })
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
