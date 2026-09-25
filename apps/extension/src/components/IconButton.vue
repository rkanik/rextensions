<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
    tooltip?: string
    onClick?: (e: MouseEvent) => void
  }>(),
  {
    as: 'button',
  },
)
</script>

<template>
  <Tooltip>
    <TooltipTrigger>
      <component
        :is="as"
        role="button"
        class="flex items-center justify-center dark:bg-neutral-900 cursor-pointer rounded-full w-9 h-9 flex-none hover:bg-neutral-200 dark:hover:bg-neutral-800"
        @click="onClick"
      >
        <slot />
      </component>
    </TooltipTrigger>
    <TooltipContent>
      {{ tooltip }}
    </TooltipContent>
  </Tooltip>
</template>
