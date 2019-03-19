<template>
  <v-container class="container">
    <v-card class="settings-container">
      <form>
        <div class="text-sm-left gray lighten-1">Passive</div>
        <v-divider />
        <v-switch v-model="dark" label="Dark Mode"></v-switch>
      </form>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Settings',

  data: function() {
    return {
      dark: false
    };
  },

  mounted: function() {
    if (localStorage.dark) this.dark = localStorage.dark === 'true' ? true : false;
  },

  watch: {
    dark: function(newValue) {
      this.$emit('set-dark', newValue);
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 500px;
}

.settings-container {
  padding: 25px;
}
</style>
