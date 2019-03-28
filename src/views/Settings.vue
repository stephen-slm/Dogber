<template>
  <v-container class="container">
    <v-card class="settings-container">
      <form>
        <div class="text-sm-left gray lighten-1">Passive</div>
        <v-divider />
        <v-switch v-model="dark" label="Dark Mode"></v-switch>
        <div class="text-sm-left gray lighten-1">Account Related</div>
        <v-divider />
        <v-switch v-model="activeWalker" label="Active Walker"></v-switch>
        <DeleteAccountAgreement />
      </form>
    </v-card>
  </v-container>
</template>

<script>
import firebaseWrapper from '../lib/firebaseWrapper.js';
import DeleteAccountAgreement from '@/components/DeleteAccountAgreement.vue';

export default {
  name: 'Settings',

  data: function() {
    return {
      dark: false,
      activeWalker: false
    };
  },

  // when the page is first loaded, we want to be able to prefill alot of information about the
  // current account, keeping the information relevent and related to whats going on with the
  // account. Letting the user know that changes are meaningful.
  created: async function() {
    const currentProfile = await firebaseWrapper.getProfile();

    // update active state
    this.activeWalker = currentProfile.walk.active;
  },

  mounted: function() {
    if (localStorage.dark) this.dark = localStorage.dark === 'true' ? true : false;
  },

  watch: {
    // if the user enables dark mode, let the upper listening app trigger dark mode across the
    // application. This cannot just be set and must be emitted.
    dark: function(newValue) {
      this.$emit('set-dark', newValue);
    },

    // if the user updates there active state, reflect those changes on the database profile.
    activeWalker: async function(newValue) {
      await firebaseWrapper.adjustWalkActiveState(newValue);
    }
  },

  components: {
    DeleteAccountAgreement
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
