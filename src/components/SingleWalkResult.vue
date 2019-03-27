<template>
  <v-layout></v-layout>
</template>

<script>
export default {
  data: function() {
    return {
      walker: {},
      owner: {},
      walk: {}
    };
  },

  props: {
    id: {
      type: String,
      default: null
    }
  },

  /**
   * When we first get the related id, we are going to need to grab basic information about the
   * walker, owner and walk, so the user can quickly and easily show the user basic related
   * information. This is a simple preview and nothing more.
   */
  created: async function() {},

  methods: {}
};
</script>
