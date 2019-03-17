<template>
  <v-app :dark="dark">
    <Navigation v-if="this.userAuthenticated" />
    <v-content>
      <v-container>
        <router-view @set-dark="dark = $event" />
      </v-container>
    </v-content>
    <v-footer :inset="true" app>
      <v-flex>
        <span class="px-3">
          &copy; Dogber {{ currentYear }} -
          <span class="caption">UP745708, UP806612, UP806905, UP824426, UP840877, UP913796</span>
        </span>
      </v-flex>
    </v-footer>
  </v-app>
</template>

<script>
import * as _ from 'lodash';
import firebaseWrapper from '@/lib/firebaseWrapper';

import Navigation from '@/components/Navigation.vue';

export default {
  name: 'App',

  data: function() {
    return {
      // if the user is authenticated, then this can be used for adjusting ui components.
      userAuthenticated: false,
      // the current year that is going to be displayed within the footer.
      currentYear: new Date().getFullYear(),
      // dark mode set by the user.
      dark: false
    };
  },

  created: function() {
    this.userAuthenticated = !_.isNil(firebaseWrapper.getCurrentUser());
    const { authentication } = firebaseWrapper;

    // if we are not authenticated and attempt to go down the application route, then force them to
    // the login page (its a requirement for the user to be authenticated to use dogber currently);
    if (_.isNil(firebaseWrapper.getCurrentUser())) {
      this.$router.push({ name: 'login', params: {} });
    }

    // if the authentication state changes, (user is redirected as logged in, user logs out etc)
    // then check if we are actually logged in. If we are then just continue, otherwise throw the
    // user to the login page.
    authentication.onAuthStateChanged(() => {
      if (!_.isNil(firebaseWrapper.getCurrentUser())) {
        this.userAuthenticated = true;
      } else {
        this.userAuthenticated = false;
        this.$router.push({ name: 'login', params: {} });
      }
    });
  },

  mounted: function() {
    if (localStorage.dark) this.dark = localStorage.dark === 'true' ? true : false;
  },

  watch: {
    dark: function(newValue) {
      localStorage.dark = newValue;
    }
  },

  components: {
    Navigation
  }
};
</script>

<style>
body {
  font-family: Lato, Helvetica, Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  margin: 0;
  text-align: center;
  background-color: #f9f9f9;
}
</style>
