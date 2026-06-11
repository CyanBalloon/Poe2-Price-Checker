<template>
  <img
    :src="realIcon"
    class="max-w-full max-h-full"
    :class="{ 'overflow-hidden': overflowHidden }"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { getDynamicIcon } from "@/web/background/ImageFetcher";

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: false,
    },
    namespace: {
      type: String,
      required: false,
    },
    overflowHidden: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const realIcon = ref(props.icon === '%NOT_FOUND%' || props.icon === '' ? '/images/404.png' : props.icon);

    watch(() => props.icon, async (newIcon) => {
      if (newIcon === '%NOT_FOUND%' || newIcon === '') {
        if (props.itemName && props.namespace) {
          realIcon.value = '/images/404.png';
          const dynamicUrl = await getDynamicIcon(props.itemName, props.namespace);
          if (dynamicUrl) {
            realIcon.value = dynamicUrl;
          }
        } else {
          realIcon.value = '/images/404.png';
        }
      } else {
        realIcon.value = newIcon;
      }
    }, { immediate: true });

    return { realIcon };
  }
});
</script>
