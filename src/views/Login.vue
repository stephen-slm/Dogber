<template>
  <v-layout class="login">
    <snackbar
      :text="snackMessage"
      :show="showSnack"
      :error="authenticationErrored"
      @snackbar-end="resetSnack"
    />

    <v-card elevation="elevation-2" class="login-card">
      <img width="65" height="65" class="avatar" src="../assets/logo.png" alt="Dogber" />

      <div class="text-capitalize subheading">dogber</div>
      <div class="subheading">Intelligent Dog Scheduling</div>

      <Loading v-if="loading" :message="loadingMessage" />

      <div v-if="!loading" class="loginContainer">
        <a @click="loginWithFacebookAsync" class="facebook">
          <i class="fab fa-facebook"></i>
        </a>

        <a @click="loginWithGithubAsync" class="github">
          <i class="fab fa-github"></i>
        </a>

        <a @click="loginWithGoogleAsync" class="google">
          <i class="fab fa-google"></i>
        </a>
      </div>
    </v-card>
  </v-layout>
</template>

<script>
import _ from 'lodash';
import firebaseWrapper from '@/lib/firebaseWrapper';

import Snackbar from '@/components/Snackbar.vue';
import Loading from '@/components/Loading.vue';

export default {
  name: 'Login',

  components: {
    Loading,
    Snackbar
  },

  data: function() {
    return {
      loading: true,
      isMobile: typeof window.orientation !== 'undefined' || navigator.userAgent.indexOf('IEMobile') !== -1,
      loadingMessage: 'Getting redirection results if any.',
      snackMessage: '',
      showSnack: false,
      authenticationErrored: false
    };
  },

  /**
   * When the page first loads, validate that we are not redirecting from a authentication page with
   * the authentication data. Additionally setting up the authentication state change, in case we
   * authenticate on the current page.
   */
  created: async function() {
    const { authentication } = firebaseWrapper;

    // This will wait for the redirection results to complete as the state would not be checked
    // during the login process, this means that its safe to not have a check for this as it
    // would never be hit if a device was logging in from the home page, otherwise it will get
    // the local session and login again if it exists.
    authentication.onAuthStateChanged(async (login) => {
      if (_.isNil(login)) return this.setLoading(false);

      try {
        await this.completeAuthenticationAsync(login, true);
        this.navigateHome();
      } catch (error) {
        this.handleAuthenticationError(error);
      }
    });

    // get the drection result if any.
    const redirectionResult = await authentication.getRedirectResult();

    // if we didnt have any redirection authentication, then just exist early.
    if (_.isNil(redirectionResult) || _.isNil(redirectionResult.user)) return;

    this.loadingMessage = 'authenticating redirection';

    try {
      await this.completeAuthenticationAsync(redirectionResult);
      this.navigateHome();
    } catch (error) {
      this.handleAuthenticationError(error);
    }
  },

  methods: {
    /**
     * Completes the authentication from firebase.
    //  * @param {object} login The authentication loginr returned from firebase.
     * @param {bool} reauth If its not a reauthentication.
     */
    completeAuthenticationAsync: async function(login, reauth = false) {
      if (_.isNil(login)) return;

      const name = _.isNil(login.displayName) ? '' : login.displayName;
      this.loadingMessage = `Authenticating user${name}`;

      if (reauth || !login.additionalUserInfo.isNewUser) {
        await firebaseWrapper.incrementUsersLoginAcountAsync();
        return this.setLoading(false);
      }

      await firebaseWrapper.createNewUserAsync();
    },

    /**
     * Authenticates the user with Google.
     */
    loginWithGoogleAsync: async function() {
      this.loadingMessage = 'Attempting to authenticate with Google.';
      this.showSnackbar(this.loadingMessage);

      this.setLoading(true);

      try {
        const login = await firebaseWrapper.authenticateWithGoogleAsync(this.isMobile);
        await this.completeAuthenticationAsync(login);
      } catch (error) {
        this.handleAuthenticationError(error);
      }

      return this.setLoading(false);
    },

    /**
     * Authenticates the user with Facebook.
     */
    loginWithFacebookAsync: async function() {
      this.loadingMessage = 'Attempting to authenticate with Facebook.';
      this.showSnackbar(this.loadingMessage);
      this.setLoading(true);

      try {
        const login = await firebaseWrapper.authenticateWithFacebookAsync(this.isMobile);

        await this.completeAuthenticationAsync(login);
      } catch (error) {
        this.handleAuthenticationError(error);
      }

      return this.setLoading(false);
    },

    /**
     * Authenticates the user with Github.
     */
    loginWithGithubAsync: async function() {
      this.loadingMessage = 'Attempting to authenticate with Github.';
      this.showSnackbar(this.loadingMessage);
      this.setLoading(true);

      try {
        const login = await firebaseWrapper.authenticateWithGithubAsync(this.isMobile);
        await this.completeAuthenticationAsync(login);
      } catch (error) {
        this.handleAuthenticationError(error);
      }

      return this.setLoading(false);
    },

    /**
     * Handles a authentication error.
     * @param {error} error the error that occured during the authenication.
     */
    handleAuthenticationError: function(error) {
      this.authenticationErrored = true;
      this.showSnackbar(`Error: ${error.message}`);
      this.setLoading(false);
    },

    /**
     * Navigates back to the home page.
     */
    navigateHome: function() {
      this.$router.push({ name: 'home', params: {} });
    },

    /**
     * Sets the loading value of the data prop loading. adjusting this will adjust if the loading panel
     * is showing or not.
     */
    setLoading: function(value) {
      this.loading = value;
    },

    /**
     * @param {string} Message the snackbar message to show.
     */
    showSnackbar: function(message) {
      this.snackMessage = message;
      this.showSnack = true;
    },

    resetSnack: function() {
      this.authenticationErrored = false;
      this.showSnack = false;
      this.snackMessage = '';
    }
  }
};
</script>

<style scoped>
.login {
  margin: 25px auto;
  padding: 30px 25px;
  width: 250px;
}

.login-card {
  padding: 25px;
  min-width: 240px;
  min-height: 370px;
}

.loginContainer a {
  display: block;
  font-size: 1.5em;
  text-decoration: none;
  color: white;
  width: 9em;
  padding: 0.55em 0.3em;
  text-align: center;
  cursor: pointer;
  margin: 0.5em auto;
}
.loginContainer a.facebook {
  background: #3a589a;
}
.loginContainer a.facebook:hover {
  background: rgba(58, 88, 154, 0.8);
}
.loginContainer a.github {
  background: #333;
}
.loginContainer a.github:hover {
  background: rgba(51, 51, 51, 0.8);
}
.loginContainer a.google {
  background: #e9544f;
}
.loginContainer a.google:hover {
  background: rgba(233, 84, 79, 0.8);
}
</style>
