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
   * When the single walk is first created, we will just have a single id related to the walk, with
   * this walk id will result in gathering all the related information about a given walk and two
   * ids, these ids will be used to gather the profiles for the given walker and owner. Both
   * required to display the related information.
   *
   * Depending on what kind of person the current viewer is (walker, owner), will depend on how we
   * display and adjust the page.
   */
  created: async function() {},
  methods: {
    /**
     * This will return the type of the current user based around the walk, if the current
     * authenticated user is a owner, walker or none, if its none then the user will be redirected
     * away.
     */
    getCurrentUserType: async function() {
      //   const currentUser = await firebaseWrapper.getProfile();

      // ... Validation

      // redirect home as the user has no real reason to be viewing a walk that is not related to them.
      this.$router.push({ name: 'home ' });
    }
  }
};
</script>
