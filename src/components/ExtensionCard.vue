<script setup lang="ts">
const props = defineProps<{
  isLocal?: boolean
  extension: TExtension
}>()

const emit = defineEmits<{
  (e: 'toggle', extension: TExtension): void
  (e: 'install', extension: TExtension): void
  (e: 'uninstall', extension: TExtension): void
}>()

const onClick = () => {
  if (props.isLocal) {
    return emit('toggle', props.extension)
  }
  emit('install', props.extension)
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger>
      <Tooltip>
        <TooltipTrigger>
          <div
            :class="{ 'opacity-40': isLocal && !extension.enabled }"
            class="relative p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-black dark:border-neutral-800 dark:hover:border-neutral-500"
            @click="onClick"
          >
            <div class="absolute flex gap-px -top-1 right-1">
              <div
                v-for="color in extension.colors"
                :key="color"
                class="w-1.5 h-1.5 rounded-full"
                :style="{ backgroundColor: color }"
              />
            </div>
            <img
              v-if="extension.icon || extension.icons?.length"
              :src="
                extension.icon ||
                extension.icons?.[extension.icons.length - 1].url ||
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0U1RTdGQSIvPgo8cGF0aCBkPSJNMTYgOEwxMiAxMkwxNiAxNkwxMiAyMEwxNiAyNEwyMCAyMEwxNiAxNkwyMCAxMkwxNiA4WiIgZmlsbD0iIzk5Q0FGRiIvPgo8L3N2Zz4K'
              "
              :alt="extension.name"
              class="w-6 h-6"
            />
            <div v-else class="w-6 h-6 bg-gray-200 rounded" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {{ extension.name }}
        </TooltipContent>
      </Tooltip>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem v-if="isLocal" @click="emit('toggle', extension)">
        {{ extension.enabled ? 'Disable' : 'Enable' }}
      </ContextMenuItem>
      <ContextMenuItem v-if="isLocal" @click="emit('uninstall', extension)">
        Remove
      </ContextMenuItem>
      <ContextMenuItem v-else @click="emit('install', extension)"> Open Store </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
