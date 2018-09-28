import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import * as _ from 'lodash';
import * as firebaseConstants from '../constants/firebaseConstants.js';

let instance = null;

class FirebaseWrapper {
  constructor(config) {
    if (!_.isNil(instance)) return instance;

    firebase.initializeApp(config);
    this.database = firebase.database();
    this.authentication = firebase.auth();

    instance = this;
  }

  /**
   * Authenticate the user with the provider based on mobile status.
   * @param {bool} mobile if the authentication device is mobile.
   * @param {object} The provider to authenticate with.
   */
  async authenticateAsync(mobile = false, provider) {
    if (mobile) {
      return await this.authentication.signInWithRedirect(provider);
    } else {
      return await this.authentication.signInWithPopup(provider);
    }
  }

  /**
   * Authenticates the user with Google.
   * @param {bool} mobile if the authentication device is mobile.
   */
  async authenticateWithGoogleAsync(mobile = false) {
    return await this.authenticateAsync(mobile, this.getAuthenticationProvider('google'));
  }

  /**
   * Authenticates the user with Github.
   * @param {bool} mobile if the authentication device is mobile.
   */
  async authenticateWithGithubAsync(mobile) {
    return await this.authenticateAsync(mobile, this.getAuthenticationProvider('github'));
  }

  /**
   * Authenticates the user with Facebook.
   * @param {bool} mobile if the authentication device is mobile.
   */

  async authenticateWithFacebookAsync(mobile = false) {
    return await this.authenticateAsync(mobile, this.getAuthenticationProvider('facebook'));
  }

  getAuthenticationProvider(name) {
    switch (name) {
      case 'facebook':
        return new firebase.auth.FacebookAuthProvider();
      case 'google':
        return new firebase.auth.GoogleAuthProvider();
      case 'github':
        return new firebase.auth.GithubAuthProvider();
      default:
        return new firebase.auth.GoogleAuthProvider();
    }
  }

  /**
   * Gets the current active users uid which is used to reference in the database
   * @returns {string}
   */
  getUid() {
    return !_.isNil(this.authentication.currentUser) ? this.authentication.currentUser.uid : null;
  }

  /**
   * returns the full path to the image of the users profile picture
   */
  getProfileImageUrl() {
    if (!_.isNil(this.authentication.currentUser)) {
      return this.authentication.currentUser.photoURL;
    }
    return '';
  }

  /**
   * returns the current user
   */
  getCurrentUser() {
    return this.authentication.currentUser;
  }

  /**
   * Gets the notification reference that is used for live notification updates.
   */
  getNotificationReference() {
    return this.database.ref(`/users/${this.getUid()}/notifications`);
  }

  // returns all the users content
  async getUserContent() {
    try {
      const user = await this.database.ref(`users/${this.getUid()}`).once('value');
      return Promise.resolve(user.val());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Gets the active users profile
   * @returns {firebase.Promise.<*>}
   */
  async getProfileByIdAsync() {
    return await this.database.ref(`users/${this.getUid()}/profile`).once('value');
  }

  /**
   * deletes the current account
   */
  async deleteAccountAsync() {
    await this.database.ref(`users/${this.getUid()}`).remove();
    await this.getCurrentUser().delete();
    return this.authentication.signOut();
  }

  /**
   * Builds the profile up that would be used to create users while also can be used for displaying
   * data if its not required from the server when making the first gather of information.
   */
  generateProfileFromLogin() {
    const { currentUser } = this.authentication;
    const profileSelectionList = firebaseConstants.PROFILE_SELECTION;
    const profile = _.pick(currentUser, profileSelectionList);

    return profile;
  }

  /**
   * creates a new user for which is called when a new sign in user happens
   * @returns {firebase.Promise.<*>}
   */
  async createNewUserAsync() {
    const profile = this.generateProfileFromLogin();

    const created = await this.database.ref(`users/${this.getUid()}/profile`).set({
      email: profile.email,
      name: profile.displayName,
      last_login: Date.now(),
      new: true
    });

    return created;
  }
}

export default new FirebaseWrapper({
  apiKey: 'AIzaSyA_zbj6P3C-LnncBKrn95J4xam7WelG6rA',
  authDomain: 'dogber2018.firebaseapp.com',
  databaseURL: 'https://dogber2018.firebaseio.com',
  projectId: 'dogber2018',
  storageBucket: 'dogber2018.appspot.com',
  messagingSenderId: '145705113606'
});
