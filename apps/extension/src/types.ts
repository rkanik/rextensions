export type TExtension = chrome.management.ExtensionInfo & {
  icon?: string
  colors?: string[]
}

export type TRemoteExtensions = {
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
