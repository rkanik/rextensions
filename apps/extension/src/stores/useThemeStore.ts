export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')

  const isDark = computed(() => theme.value === 'dark')
  const isLight = computed(() => theme.value === 'light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    chrome.storage.local.set({ theme: theme.value })
  }

  onMounted(() => {
    chrome.storage.local.get('theme', (result) => {
      theme.value = result.theme || 'light'
    })
  })

  watch(isDark, (isDark) => {
    document.documentElement.classList.toggle('dark', isDark)
  })

  return {
    theme,
    isDark,
    isLight,
    toggleTheme,
  }
})

export const useThemeState = () => {
  return storeToRefs(useThemeStore())
}
