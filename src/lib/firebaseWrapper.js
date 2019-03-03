import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import * as _ from 'lodash';
import * as firebaseConstants from '../constants/firebaseConstants.js';
import * as packageJson from '../../package.json';

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
  async authenticate(mobile = false, provider) {
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
  async authenticateWithGoogle(mobile = false) {
    return await this.authenticate(mobile, this.getAuthenticationProvider('google'));
  }

  /**
   * Authenticates the user with Github.
   * @param {bool} mobile if the authentication device is mobile.
   */
  async authenticateWithGithub(mobile) {
    return await this.authenticate(mobile, this.getAuthenticationProvider('github'));
  }

  /**
   * Authenticates the user with Facebook.
   * @param {bool} mobile if the authentication device is mobile.
   */

  async authenticateWithFacebook(mobile = false) {
    return await this.authenticate(mobile, this.getAuthenticationProvider('facebook'));
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

  /**
   * Adds a new notification to the users data.
   * @param {string} title The title that will be displayed for the given notification.
   * @param {string} message The message that will be getting displayed for the user for the notification.
   * @param {string} actionType The kind of action type. e.g link internal, external etc.
   * @param {string} actionLink If its a link then the action link.
   */
  async createNotification(title, message, actionType, actionLink) {
    // validate that the passed title is a string, not empty and is not a empty string.
    if (_.isNil(title) || typeof title !== 'string' || title.trim() === '') {
      throw new Error('title cannot be null or empty or not a string');
    }

    // validate that the passed message is a string, not empty and is not a empty string.
    if (_.isNil(message) || typeof message !== 'string' || message.trim() === '') {
      throw new Error('message cannot be null or empty or not a string');
    }

    // validate that if the action type is not null that its a string and not a empty string.
    if (!_.isNil(actionType) && (typeof actionType !== 'string' || actionType.trim() === '')) {
      throw new Error('actionType cannoot be empty or not a string');
    }

    // validate that if the action link is not null that its a string and not a empty string.
    if (!_.isNil(actionLink) && (typeof actionLink !== 'string' || actionLink.trim() === '')) {
      throw new Error('actionLink cannoot be empty or not a string');
    }

    const notificaionsReference = this.getNotificationReference();
    const notification = { message, title, timestamp: Date.now() };

    // make sure to append the action type and link if they are not null. Otherwise we can just
    // leave it blank and assume it as null. We will always be appending the message and title to
    // the notification object.
    if (!_.isNil(actionType)) notification.actionType = actionType;
    if (!_.isNil(actionLink)) notification.actionLink = actionLink;

    // push the notification object into the firebase database. Even though its async we dont have
    // to call await as the calling function will await on the returned push.
    const notificationInsert = await notificaionsReference.push(notification);
    return notificationInsert.key;
  }

  /**
   * Creates the default welcome notification for a new user, this will use the current working
   * version within the default notification. This should only be used once per user. If they are
   * new.
   */
  async createWelcomeMessageNotification() {
    const profile = await this.getProfile();

    // if the user is  not new then we don't want to be adding this. This is  notification just for
    // users who have a newly created account.
    if (!_.isNil(profile.new) && !profile.new)
      throw new Error('User must be null to have a welcome notification');

    return this.createNotification(
      `Welcome ${this.authentication.currentUser.displayName || 'User'}!`,
      `Welcome to Dogber! Currently in Alpha at version ${
        packageJson.version
      }, if you have any problems please send feedback via the menu.`
    );
  }

  /**
   * Gets all the current notifications for the current authentication user. This will default to a
   * empty array if no value is actually being stored within the database.
   */
  async getNotifications() {
    const notifications = await this.database.ref(`users/${this.getUid()}/notifications`).once('value');
    return notifications.val();
  }

  /**
   * Deletes / removes a notification by the given key for the currently authenticated user.
   * @param {string} key The key reference for the notifications.
   */
  removeNotification(key) {
    return this.database.ref(`users/${this.getUid()}/notifications/${key}`).remove();
  }

  /**
   * Gets a single notification from the database that is of the key that was provided.
   * @param {string} key The key of the notification to be gathered.
   */
  async getNotificationByKey(key) {
    const notification = await this.database.ref(`users/${this.getUid()}/notifications/${key}`).once('value');
    return notification.val();
  }

  /**
   * Gets the current profile object for the given authenticated user. This will include all the
   * basic information that was created for the authenticated user when they first signed into the
   * application.
   */
  async getProfile() {
    const profile = await this.database.ref(`users/${this.getUid()}/profile`).once('value');
    return profile.val();
  }

  /**
   * Performs the deletion process for a given authenticated account, this includes the deletion of
   * all stored data for that user and then the deletion of the authenticated account. Finally
   * followed by signing out the user.
   */
  async deleteAccount() {
    // locate and remove all the data that is stored in the databsae for the current user.
    await this.database.ref(`users/${this.getUid()}`).remove();

    // delete the authentication process for the current user.
    await this.getCurrentUser().delete();

    // finally sign the user out of the system.
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
   * This will increment the login count on the profile section for a given user, this will allow us
   * to keep track of how many times a given user has authenticated and logged into the page. The
   * downside of this is that it could result in a heavy increase in logins if we just refresh the
   * page.
   */
  async incrementUsersLoginAcount() {
    const profile = await this.getProfile();

    if (!_.isNil(profile)) {
      await this.database.ref(`users/${this.getUid()}/profile/login_count`).set(profile.login_count + 1);
      await this.database.ref(`users/${this.getUid()}/profile/last_login`).set(Date.now());
    }
  }

  /**
   * creates a new user for which is called when a new sign in user happens.
   * @returns {firebase.Promise.<*>}
   */
  async createNewUser() {
    const profile = this.generateProfileFromLogin();

    const created = await this.database.ref(`users/${this.getUid()}/profile`).set({
      email: profile.email,
      name: profile.displayName,
      last_login: Date.now(),
      login_count: 1,
      new: true
    });

    // create the welcome message for the newly created account.
    await this.createWelcomeMessageNotification();

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
