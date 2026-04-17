import type { TExtension } from '@/types'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import tColors from 'tailwindcss/colors'

const colors = [
  tColors.red[500],
  tColors.orange[500],
  tColors.yellow[500],
  tColors.green[500],
  tColors.blue[500],
  tColors.indigo[500],
  tColors.purple[500],
  tColors.pink[500],
  tColors.gray[500],
  tColors.zinc[500],
  tColors.neutral[500],
  tColors.stone[500],
  tColors.amber[500],
  tColors.lime[500],
  tColors.emerald[500],
  tColors.teal[500],
  tColors.cyan[500],
  tColors.sky[500],
  tColors.violet[500],
  tColors.rose[500],
]

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

type TRemoteExtensions = {
  file: {
    name: string
    size: number
  }
  color: string
  size: number
  importedAt: number
  exportedAt: number
  extensions: TExtension[]
}

export const useRemoteExtensions = () => {
  const key = 'remoteExtensions'
  const remoteExtensions = ref<TRemoteExtensions[]>([])

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

  const importRemoteExtensions = async (file?: File): Promise<void> => {
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

  const deleteRemoteExtensions = async (item: TRemoteExtensions) => {
    const items = await getRemoteExtensions()
    remoteExtensions.value = items.filter((e) => e.file.name !== item.file.name)
    chrome.storage.local.set({ [key]: JSON.stringify(remoteExtensions.value) })
  }

  onMounted(() => {
    getRemoteExtensions().then((data) => {
      remoteExtensions.value = data
    })
  })

  return {
    remoteExtensions,
    deleteRemoteExtensions,
    importRemoteExtensions,
  }
}
