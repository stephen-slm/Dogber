<template>
  <v-layout>
    <v-btn flat color="warning" @click="showDeleteAccountLocal = true">Delete Account</v-btn>
    <v-dialog v-model="showDeleteAccountLocal" max-width="290">
      <v-card>
        <v-card-title class="headline">Delete your account {{ name }}?</v-card-title>
        <v-progress-circular v-if="deleting" indeterminate color="warning"></v-progress-circular>
        <v-card-text v-if="!deleting">
          Deleting your account will remove all records and information Dogber as currently about you. You
          will no longer exist at all in the system.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn v-if="!deleting" flat="flat" @click="showDeleteAccountLocal = false">Cancel</v-btn>
          <v-btn v-if="!deleting" color="warning" flat="flat" @click="deleteAccount()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import firebaseWrapper from '../lib/firebaseWrapper.js';

export default {
  props: {
    // triggered when the external requiring object is looking to display the feedback panel.
    showDeleteAccount: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      // if we are displaying the message or not.
      showDeleteAccountLocal: this.showDeleteAccount || false,
      // the current name of the given user.
      name: '',
      // if the user account is currently being deleted.
      deleting: false
    };
  },

  created: async function() {
    const profile = await firebaseWrapper.getProfile();
    this.name = profile.name;
  },

  methods: {
    deleteAccount: async function() {
      // updating deleting allows the spinner to appear, letting the user know that something is
      // happening.
      this.deleting = true;
      await firebaseWrapper.deleteAccount();
      location.reload();
    }
  },

  watch: {
    // props should not be updated directly, in this case we will use a local value that can be
    // changed to reflect the displaying status, in this case we can update local but not break
    // vues properties.
    showDeleteAccount: function(newValue) {
      this.showDeleteAccountLocal = newValue;
    }
  }
};
</script>

<style scoped></style>
