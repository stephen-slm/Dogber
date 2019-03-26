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
   * @param {string} targetId The target id to gather the notifications reference for.
   */
  getNotificationReference(targetId = this.getUid()) {
    return this.database.ref(`users/${targetId}/notifications`);
  }

  /**
   * Adds a new notification to the users data.
   * @param {string} targetId The id of the given user who will be getting the notification.
   * @param {string} title The title that will be displayed for the given notification.
   * @param {string} message The message that will be getting displayed for the user for the notification.
   * @param {string} actionType The kind of action type. e.g link internal, external etc.
   * @param {string} actionLink If its a link then the action link.
   */
  async createNotification(targetId = this.getUid(), title, message, actionType, actionLink) {
    // validate target id is not null and a string
    if (_.isNil(targetId) || !_.isString(targetId) || targetId.trim() === '') {
      throw new Error('targetId cannot be null or empty or not a string');
    }

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

    const notificaionsReference = this.getNotificationReference(targetId);
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
      throw new Error('User must be new to have a welcome notification');

    const currentVersion = packageJson.version;
    const displayName = profile.name || profile.email;

    return this.createNotification(
      this.getUid(),
      `Welcome ${displayName}!`,
      `Welcome to Dogber! Currently in Alpha at version ${currentVersion}, if you have any problems please send feedback via the menu.`
    );
  }

  /**
   * Gets all the current notifications for the current authentication user. This will default to a
   * empty array if no value is actually being stored within the database.
   */
  async getNotifications() {
    const notifications = await this.database.ref(`users/${this.getUid()}/notifications`).once('value');
    return notifications.val() || {};
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
   * Creates a new walk request for the ownerId, requesting the walk with the given walkerId, this
   * walk will lead to the user walker being able to accept, reject the walk and then complete the
   * walk once the given time span has actually passed.
   *
   * @param {string} walkerId The id of the person who is being requested to perfrom the walk.
   * @param {string} ownerId The owner of the dog / walk id.
   * @param {string[]} ownerDogIds The owners dogs that are being walked, array of dog ids.
   * @param {dateTime} startDateTime The start time of the walk.
   * @param {dateTime} endDateTime The end time of the walk.
   * @param {string} location The location the walk will be taking place.
   * @param {string} notes Any additional information that is taken place for the walk
   * @memberof FirebaseWrapper
   */
  async createWalkRequest(walkerId, ownerId, ownerDogIds, startDateTime, endDateTime, location, notes) {
    // the walker, owner and owner dog ids are all related ids that will be set by firebase within
    // the database, these must all not be null, empty or invalid strings. If they are anything but
    // a valid string they will have to be rejected and the creation process stopped.
    _.forEach([walkerId, ownerId], (value) => {
      if (_.isNil(value) || !_.isString(value) || value.trim() === '') {
        throw new Error('required ids cannot be null or a invalid/empty string');
      }
    });

    // owner dog ids must be a valid array to be used correctly.
    if (!_.isArray(ownerDogIds)) {
      throw new Error('owner dog ids must be a valid array');
    }

    // owner dog ids are arrays of ids and not just a id, so we must validate each entry of the id
    // to make sure that its properly validating each dog that is being walked.
    _.forEach(ownerDogIds, (value) => {
      if (_.isNil(value) || !_.isString(value) || value.trim() === '') {
        throw new Error('required ids cannot be null or a invalid/empty string');
      }
    });

    // The walk requests rely alot on the date time objects, if they have not been set or are not
    // correct then the full process should be rejected and the creation process stopped / halted.
    if (!(startDateTime instanceof Date) || !(endDateTime instanceof Date)) {
      throw new Error('start date time and end date time must be date time objects.');
    }

    // location being a required property must be valid but we only need to validate that the notes
    // are correct if and only if they are set. If they are null then they just will be ingored
    // during the creation process.
    if (_.isNil(location) || !_.isString(location) || location.trim() === '') {
      throw new Error('location cannot be null or a invalid/empty string');
    } else if (!_.isNil(notes) && (!_.isString(notes) || notes.trim() === '')) {
      throw new Error('if notes are set, they cannot be a invalid/empty string');
    }

    // first lets push the new walk request onto the walk section of the database and push the walks
    // onto the two users.

    const ownersProfile = await this.getProfile(ownerId);
    const walkerProfile = await this.getProfile(walkerId);

    const history = [
      `${ownersProfile.name || ownersProfile.email} has requested a walk to ${walkerProfile.name ||
        walkerProfile.email}`
    ];

    if (!_.isNil(notes)) {
      history.push(`${ownersProfile.name || ownersProfile.email} added notes to the walk!`);
    }

    const newWalkRequest = await this.database.ref(`walks`).push({
      walker: walkerId,
      owner: ownerId,
      dogs: ownerDogIds,
      location,
      status: firebaseConstants.WALK_STATUS.PENDING,
      notes: [notes],
      history
    });

    // pull the key from the new walk to be used as the id.
    const newWalkRequestId = newWalkRequest.key;

    // since we now have the walk id we can push the walk id onto each user, making sure that they
    // have a reference to there related walk. This will be followed by letting the other user know
    // that someone has requested a walk for them.
    await this.database.ref(`users/${ownerId}/walks`).push(newWalkRequestId);
    await this.database.ref(`users/${walkerId}/walks`).push(newWalkRequestId);

    // create the notification for the walker.
    await this.createNotification(
      walkerId,
      'Walk Request 🏃',
      `${ownersProfile.name || ownersProfile.email} has requested a walk from you!`,
      'navigation',
      `/walks/${newWalkRequestId}`
    );

    return newWalkRequestId;
  }

  /**
   * Accepts the given walk, giving notifications for each user that the notification has been
   * accepted.
   *
   * @param {string} accepterId The person accepting the walk.
   * @param {string} walkRequestId The walk id of the walk that is being accepted.
   * @param {string} notes Any additional notes that are given when accepting a walk.
   * @memberof FirebaseWrapper
   */
  async acceptWalkRequest(accepterId = this.getUid(), walkRequestId, notes) {
    // ids are required and must be valid otherwise we cannot ensure that we are gathering the
    // correct related walk by a given id.
    if (_.isNil(walkRequestId) || !_.isString(walkRequestId) || walkRequestId.trim() === '') {
      throw new Error('walk request id cannot be null or a invalid/empty string');
    } else if (_.isNil(accepterId) || !_.isString(accepterId) || accepterId.trim() === '') {
      throw new Error('accepter id cannot be null or a invalid/empty string');
    }

    // validate that the notes are correct if and only if they are set. If they are null then they
    // just will be ingored during the creation process.
    if (!_.isNil(notes) && (!_.isString(notes) || notes.trim() === '')) {
      throw new Error('if notes are set, they cannot be a invalid/empty string');
    }

    // gather the related walk so we can give the owner of the dogs a notification about that the
    // walker has gone and accepted the walk.
    const walkObject = await this.getWalkByKey(walkRequestId);

    // you cannot accept the walk if you are not the walker.
    if (walkObject.owner === accepterId) {
      throw new Error('You cannot accept a walk if you are the owner.');
    }

    const walkerProfile = await this.getProfile(walkObject.walker);
    const walkerName = walkerProfile.name || walkerProfile.email;

    // update the walk request as now active, and push to the history object that the walk has accepted the walk.
    await this.database.ref(`walks/${walkRequestId}/status`).set(firebaseConstants.WALK_STATUS.ACTIVE);
    await this.database.ref(`walks/${walkRequestId}/history`).push(`${walkerName} has accepted the walk.`);

    // create the notification for the walker.
    this.createNotification(
      walkObject.owner,
      'Walk Update 🏃',
      `${walkerName} has accepted your walk request!`,
      'navigation',
      `/walks/${walkRequestId}`
    );
  }

  /**
   * Rejects the given walk, giving notifications the owner that the walk was rejected and could not
   * be processed.
   *
   * @param {string} rejecterId The person rejecting the walk.
   * @param {string} walkRequestId The walk id of the walk that is being rejected.
   * @param {string} notes Any additional notes that are given when rejecting a walk.
   * @memberof FirebaseWrapper
   */

  async rejectWalkRequest(rejecterId = this.getUid(), walkRequestId, notes) {
    // ids are required and must be valid otherwise we cannot ensure that we are gathering the
    // correct related walk by a given id.
    if (_.isNil(walkRequestId) || !_.isString(walkRequestId) || walkRequestId.trim() === '') {
      throw new Error('walk request id cannot be null or a invalid/empty string');
    } else if (_.isNil(rejecterId) || !_.isString(rejecterId) || rejecterId.trim() === '') {
      throw new Error('rejector id cannot be null or a invalid/empty string');
    }

    // validate that the notes are correct if and only if they are set. If they are null then they
    // just will be ingored during the creation process.
    if (!_.isNil(notes) && (!_.isString(notes) || notes.trim() === '')) {
      throw new Error('if notes are set, they cannot be a invalid/empty string');
    }

    // gather the related walk so we can give the owner of the dogs a notification about that the
    // walker has gone and rejected the walk.
    const walkObject = await this.getWalkByKey(walkRequestId);

    // you cannot reject the walk if you are not the walker, you have to go through the cancel
    // process if you are the owner.
    if (walkObject.owner === rejecterId) {
      throw new Error('You cannot reject a walk if you are the owner, cancel the walk instead');
    }

    const walkerProfile = await this.getProfile(walkObject.walker);
    const walkerName = walkerProfile.name || walkerProfile.email;

    // update the walk request as now active, and push to the history object that the walk has accepted the walk.
    await this.database.ref(`walks/${walkRequestId}/status`).set(firebaseConstants.WALK_STATUS.REJECTED);
    await this.database.ref(`walks/${walkRequestId}/history`).push(`${walkerName} has rejected the walk.`);

    // create the notification for the walker.
    this.createNotification(
      walkObject.owner,
      'Walk Update 🏃',
      `${walkerName} has rejected your walk request!`,
      'navigation',
      `/walks/${walkRequestId}`
    );
  }

  /**
   * Completes a walk.
   *
   * @param {string} completerId The person rejecting the walk.
   * @param {string} walkRequestId The walk id of the walk that is being completed.
   * @param {string} notes Any additional notes that are given when rejecting a walk.
   * @memberof FirebaseWrapper
   */
  async completeWalkRequest(completerId = this.getUid(), walkRequestId, notes) {
    // ids are required and must be valid otherwise we cannot ensure that we are gathering the
    // correct related walk by a given id.
    if (_.isNil(walkRequestId) || !_.isString(walkRequestId) || walkRequestId.trim() === '') {
      throw new Error('walk request id cannot be null or a invalid/empty string');
    } else if (_.isNil(completerId) || !_.isString(completerId) || completerId.trim() === '') {
      throw new Error('completer id cannot be null or a invalid/empty string');
    }

    // validate that the notes are correct if and only if they are set. If they are null then they
    // just will be ingored during the creation process.
    if (!_.isNil(notes) && (!_.isString(notes) || notes.trim() === '')) {
      throw new Error('if notes are set, they cannot be a invalid/empty string');
    }

    // we gather the walk object so that we can determine who should get the notification about the
    // update. So that we don't have to send a notification to both parties.
    const walkObject = await this.getWalkByKey(walkRequestId);

    const completerProfile = await this.getProfile(completerId);
    const comName = completerProfile.name || completerProfile.email;

    // determine who should be getting the notification related to the walk request going through.
    let whoGetsNotification = completerId === walkObject.owner ? walkObject.walker : walkObject.owner;

    // update the walk request as now active, and push to the history object that the walk has accepted the walk.
    await this.database.ref(`walks/${walkRequestId}/status`).set(firebaseConstants.WALK_STATUS.COMPLETE);
    await this.database.ref(`walks/${walkRequestId}/history`).push(`${comName} has completed the walk.`);

    // create the notification for the walker.
    this.createNotification(
      whoGetsNotification,
      'Walk Update 🏃',
      `${comName} has completed your walk!`,
      'navigation',
      `/walks/${walkRequestId}`
    );
  }

  /**
   * Gets a single walk by the id of the wak.
   *
   * @param {*} walkId The id of the walk being gathered.
   * @memberof FirebaseWrapper
   */
  async getWalkByKey(walkId) {
    // ids are required and must be valid otherwise we cannot ensure that we are gathering the
    // correct related walk by a given id.
    if (_.isNil(walkId) || !_.isString(walkId) || walkId.trim() === '') {
      throw new Error('walk id cannot be null or a invalid/empty string');
    }

    const walkObject = await this.database.ref(`walks/${walkId}`).once('value');
    return walkObject.val();
  }

  /**
   * Gets all the related walks for a given user.
   *
   * @param {string} userId the current user to who to get all the walk for.
   * @memberof FirebaseWrapper
   */
  async getAllWalks(userId = this.getUid()) {
    // ids are required and must be valid otherwise we cannot ensure that we are gathering the
    // correct related walk by a given id.
    if (_.isNil(userId) || !_.isString(userId) || userId.trim() === '') {
      throw new Error('user id cannot be null or a invalid/empty string');
    }

    // first we must get all the keys for the given user and then go and gather all the related walks.
    const relatedKeys = Object.values(await this.getAllWalkKeys(userId));

    // iterate through all the keys and gather a walk for each key. This would be faster than
    // gathering them all then applying a filter.
    const relatedWalks = [];

    for (const keyValue of relatedKeys) {
      relatedWalks.push(
        Object.assign(await this.getWalkByKey(keyValue), {
          id: keyValue
        })
      );
    }

    return relatedWalks;
  }

  /**
   * Gets all the related walk keys for a given user.
   *
   * @param {string} userId the current user to who to get all the walk keys for.
   * @memberof FirebaseWrapper
   */
  async getAllWalkKeys(userId = this.getUid()) {
    // ids are required and must be valid otherwise we cannot ensure that we are gathering the
    // correct related walk by a given id.
    if (_.isNil(userId) || !_.isString(userId) || userId.trim() === '') {
      throw new Error('user id cannot be null or a invalid/empty string');
    }

    // grab the reference to the keys section of the given user and return all the keys.
    const keys = await this.database.ref(`users/${userId}/walks`).once('value');
    return keys.val() || {};
  }

  /**
   * Gets the current profile object for the given authenticated user. This will include all the
   * basic information that was created for the authenticated user when they first signed into the
   * application.
   */
  async getProfile(id = this.getUid()) {
    if (_.isNil(id)) {
      // passed id must be of a type, we cannot work with the process if the id is null or
      // undefined. the user should always pass a valid id.
      throw new Error('Passed id cannot be null or undefined');
    }

    if (!_.isString(id)) {
      // while get uid will return a string, a user can pass a string directly into this method,
      // this must be of type string as firebase id are of type string.
      throw new Error('Passed id should be of type string');
    }

    const profile = await this.database.ref(`users/${id}/profile`).once('value');
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
   * Adjusts the active state of the walk state of the given user, doing this will allow the user to
   * join the walk pool, gaining them access to walks.
   * @param {bool} newActiveState the new state that will replace the current one.
   */
  async adjustWalkActiveState(newActiveState) {
    // knowing that firebase will accept any type value, we must just ensure that the user input
    // data is actually a boolean we can use as a flag on the users account.
    if (!_.isBoolean(newActiveState)) {
      throw new Error('New active state must be a boolean');
    }

    // return the change being made, due to the way async works, this will still be awaited and the
    // changes processed before the following actiion has been taken (incase it replies on this
    // change going through).
    return this.database.ref(`users/${this.getUid()}/profile/walk/active`).set(newActiveState);
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
   * Increments the user ratings, respecting the rating limits of being a int, less than or greater
   * than 5 and a modulo of 0.5.
   * @param {int} newRating The newly added rating value.
   */
  async incrementRating(newRating) {
    if (!_.isNumber(newRating)) {
      throw new Error('Previous rating must be number');
    }

    if (newRating < 0 || newRating > 5 || newRating % 0.5 !== 0) {
      throw new Error('Your rating should be between 0 to 5 and integer or .5 floating number');
    }

    if (newRating < 0 || newRating > 5) {
      throw new Error('Your rating should be between 0 to 5');
    }

    const profile = await this.getProfile();

    if (!_.isNil(profile)) {
      await this.database
        .ref(`users/${this.getUid()}/profile/walk/rating`)
        .set(profile.walk.rating + newRating);
    }
  }

  /**
   * Increments the number of completed walks for the given authenticated user. This will gather the
   * existing profile and the existing profiles walk.completed and increment this by 1. Always being
   * consistant with what is currently being stored on the server.
   */
  async incrementCompletedWalks() {
    const profile = await this.getProfile();

    if (!_.isNull(profile)) {
      await this.database
        .ref(`users/${this.getUid()}/profile/walk/completed`)
        .set(profile.walk.completed + 1);
    }
  }

  /**
   * Updates the existing profile with the properties that are set on the profile object. This will
   * be limited to what is currently being stored on the profile, attempting to add anymore
   * information will result in the data being filted out.
   * @param {object} profileObject The profile object containing all required updating properties.
   */
  async updateProfile(profileObject) {
    const filtedProfile = _.pick(profileObject, firebaseConstants.PROFILE_UPDATE_SELECT);

    _.forEach(filtedProfile, async (value, key) => {
      await this.database.ref(`users/${this.getUid()}/profile/${key}`).set(value);
    });
  }

  /**
   * Decreases the amount of the current authenticated balance.
   * @param {number} amount The amount the balance is going to be decreased by.
   */
  async decreaseBalance(amount) {
    if (!_.isNumber(amount)) {
      // we dont want the user to have a chance of seeing there balance as being not what you
      // expect, and in this case it would be actually making sure that they are acutally trying to
      // use a value to increase it by and not a number value.
      throw new Error('The provided amount must be a number');
    }

    if (amount <= 0) {
      // we should not be allowing the user to update the balance to a negative amount, this is not
      // the method for handling the decreasing of the balance.
      throw new Error('The provided amount change must be posative for decreasing');
    }

    // first we need to get the profile, get the curren balance and update that.
    const profile = await this.getProfile();

    if (profile.walk.balance - amount < 0) {
      // if the user does not have enough balance, then they should not be given the chance to
      // adjust it or make changes. They must first have enough of a balance to decrease it.
      throw new Error('You must have enough money to make the decrease in balance');
    }

    // finally updating the value to the new amount, that of the current value with it incremented
    // by the provided amount.
    await this.database.ref(`users/${this.getUid()}/profile/walk/balance`).set(profile.walk.balance - amount);
  }

  /**
   * Inserts feedback for a given user, the users id being the target and the current persons id
   * being the feedback id.
   * @param {string} feedbackerId The id of the person who is giving the feedback.
   * @param {string} targetId The id of the person who is getting the feedback.
   * @param {string} message The message of the feedback for the given target.
   */
  async addFeedback(feedbackerId = this.getUid(), targetId, message) {
    if (_.isNil(feedbackerId) || _.isNil(targetId)) {
      // The id of the person adding the feedback and the person giving the feedback should both not
      // be null or undefined, we don't need random unknown data being used for the id.
      throw new Error('Feedback and target id must not be null or undefined');
    }

    // firebase only uses strings as ids and so the id of the person and target must both be a valid
    // string. Make sure that both the feedback and target are valid strings.
    if (!_.isString(feedbackerId) || !_.isString(targetId)) {
      throw new Error('Feedback and target id must be of type string');
    }

    // validate that our stored message is acutally a string, we don't want the chance of not being
    // able to properly display the information if its a object or a array. etc.
    if (_.isNil(message) || !_.isString(message)) {
      throw new Error('Feedback message must be a valid string');
    }

    // the user who is giving feedback should not be able to give feedback to themselves, as this
    // defeats the point of feedback and will give a unrealistc feeling for a given user. who see
    // there profile.
    if (feedbackerId === this.getUid() && targetId === this.getUid()) {
      throw new Error('Feedback cannot be given to youself.');
    }

    // get the profile so we can store a reference for the name.
    const feedbackerProfile = await this.getProfile(feedbackerId);
    const feedbackerName = feedbackerProfile.name || feedbackerProfile.email;

    // inserts the new feedback for the given target person with the message and reference, we will
    // also store the given name of the feedbacker, this will allow us to have a proper reference
    // without querying to get the information.
    const feedback = await this.database.ref(`users/${targetId}/feedback`).push({
      message,
      feedbacker: {
        id: feedbackerId,
        photo: feedbackerProfile.photo,
        name: feedbackerName
      },
      timestamp: Date.now()
    });

    // lets add the user notification in so that the target id now gets a new notification. This
    // will have a navigation action to allow the user to quickly navigate to there profile when the
    // notification comes in, if they are on the profile page then they will see the feedback
    // instantly.
    await this.createNotification(
      targetId,
      'Feedback 🎉',
      `${feedbackerName} has left you feedback on your profile!`,
      'navigation',
      '/profile/me'
    );

    // returns the related feedback id that was created in insert.
    return feedback.key;
  }

  /**
   * Gathers the feedback for the given user by the user id.
   * @param {string} id The id of the user who feedback is being gathered.
   */
  async getFeedback(id = this.getUid()) {
    if (_.isNil(id)) {
      // passed id must be of a type, we cannot work with the process if the id is null or
      // undefined. the user should always pass a valid id.
      throw new Error('Passed id cannot be null or undefined');
    }

    if (!_.isString(id)) {
      // while get uid will return a string, a user can pass a string directly into this method,
      // this must be of type string as firebase id are of type string.
      throw new Error('Passed id should be of type string');
    }

    const feedback = await this.database.ref(`users/${id}/feedback`).once('value');
    return feedback.val();
  }

  /**
   * Gets the feedback reference that is used for live feedback updates.
   * @param feedbackId The id of the feedbacker to be listening for.
   */
  getFeedbackReference(feedbackId = this.getUid()) {
    return this.database.ref(`users/${feedbackId}/feedback`);
  }

  /**
   * Gets all the active walkers for the current user, generally used when looking for a active
   * walking dog owner. This will return a object that has filtered out all non-active walkers.
   */
  async getActiveWalkers() {
    // grab the object reference, the reference can then be used to get all current users.
    const currentUsersReference = await this.database.ref('users').once('value');
    const users = currentUsersReference.val() || {};

    // we don't want to be getting the current user, so we will make sure to ignore this id if it
    // occures in the filtering process (which it should, it might not be active though).
    const currentUserId = this.getUid();
    const filteredUsers = {};

    // return the filtered amount of users with just the active ones.
    _.forEach(users, (e, index) => {
      if (e.profile.walk.active && index !== currentUserId) filteredUsers[index] = e;
    });

    return filteredUsers;
  }

  /**
   * returns the id keys for all current active walkers, based arond the get active walkers method,
   * filtering down to just the keys.
   */
  async getActiveWalkersKeys() {
    return _.map(await this.getActiveWalkers(), (value, index) => index);
  }

  /**
   * Adds in a new address for the current authenticated user, this will be pushed to a array which
   * will allow the user to acutally have more addresses than a single address. Reference the
   * firebaseConstants.PROFILE_ADDRESS object for all required properties within the address object.
   */
  async addAddress(addressObject) {
    const filteredAddress = _.pick(addressObject, firebaseConstants.PROFILE_ADDRESS);

    // validate that all properties are strings and not a empty string.
    firebaseConstants.PROFILE_ADDRESS.forEach((value) => {
      if (_.isNil(filteredAddress[value]) || !_.isString(filteredAddress[value])) {
        throw new Error(`${value} cannot be null, undefined or not a string`);
      }
    });

    // the address reference that will be used for inserting the addresses into the database
    const addressReference = this.database.ref(`users/${this.getUid()}/profile/addresses`);

    // performing the address insert, allowing us to then return the related key to the address for
    // later on. This could be used for also deleting the addresses.
    const insertedAddress = await addressReference.push(filteredAddress);
    return insertedAddress.key;
  }

  /**
   * Gathers a single address by the address key for the current authenticated user.
   * @param {string} key The addresss key that will be used to gather the address.
   */
  async getAddressByKey(key) {
    // keys are all strings and not null or undefined, we must validate this is correct before
    // attempting to gather the required address by the key.
    if (_.isNil(key) || !_.isString(key)) {
      throw new Error('Address key must not be empty and must be a valid string');
    }

    // get the reference / data object for the single address and return its object.
    const address = await this.database.ref(`users/${this.getUid()}/profile/addresses/${key}`).once('value');
    return address.val();
  }

  /**
   * Removes a single address by the provided address key for the current authenticated user.
   * @param {string} addressKey The address key that will be used to remove the address.
   */
  async removeAddress(addressKey) {
    // keys are all strings and not null or undefined, we must validate this is correct before
    // attempting to gather the required address by the key.
    if (_.isNil(addressKey) || !_.isString(addressKey)) {
      throw new Error('Address key must not be empty and must be a valid string');
    }

    // delete the reference to the address and all the address objects.
    return this.database.ref(`users/${this.getUid()}/profile/addresses/${addressKey}`).remove();
  }

  /**
   * Gets all the addresses for the current authenticated user. This is a object and not a array but
   * will have keys for the indexes of all the objects in the object.
   */
  async getAddresses() {
    const addresses = await this.database.ref(`users/${this.getUid()}/profile/addresses`).once('value');
    return addresses.val() || {};
  }

  /**
   * Increments the current authenticated users balance by the provided amount.
   * @param {number} amount The amount the current balance is going to be incremented by.
   */
  async increaseBalance(amount) {
    if (!_.isNumber(amount)) {
      // we dont want the user to have a chance of seeing there balance as being not what you
      // expect, and in this case it would be actually making sure that they are acutally trying to
      // use a value to increase it by and not a number value.
      throw new Error('The provided amount must be a number');
    }

    if (amount <= 0) {
      // we should not be allowing the user to update the balance to a negative amount, this is not
      // the method for handling the decreasing of the balance.
      throw new Error('The provided amount change must be posative for incrementing');
    }

    // first we need to get the profile, get the curren balance and update that.
    const profile = await this.getProfile();

    // finally updating the value to the new amount, that of the current value with it incremented
    // by the provided amount.
    await this.database.ref(`users/${this.getUid()}/profile/walk/balance`).set(profile.walk.balance + amount);
  }

  /**
   * Updates the current authenticated users min and max value they are using for there dog cost
   * section of there profile. (general cost per walk).
   * @param {number} min The new minimal value to be updated.
   * @param {number} max The new max value to be set.
   */
  async updateWalkCost(min, max) {
    if (!_.isNumber(min) && !_.isNil(min)) {
      // if min is provided and not a number then we don't want to process this information and let
      // the user know that what they are providing is not a valid input.
      throw new Error('if min is provided it must be a number');
    }

    if (!_.isNumber(max) && !_.isNil(max)) {
      // if max is provided and not a number then we don't want to process this information and let
      // the user know that what they are providing is not a valid input.
      throw new Error('if min is provided it must be a number');
    }

    // we don't want the chance of the fields being updated with negative numbers, so we will
    // invalidate anyhing lower than 0 or if the user tries to enter a max lower than the min.
    if (!_.isNil(min) && min < 0) {
      throw new Error('if min is provided it must be greater than 0');
    }

    if (!_.isNil(max) && (max < 0 || max < min)) {
      throw new Error('if max is provided it must be greater than 0 and greater than min');
    }

    // we will only attempt to update the min and max if the values that have been passed are not
    // null, otherwise we will just continue without attempting to update any of the values. This
    // will just result in no value returned. (no error thrown).

    if (!_.isNil(min)) {
      await this.database.ref(`users/${this.getUid()}/profile/walk/price/min`).set(min);
    }

    if (!_.isNil(max)) {
      await this.database.ref(`users/${this.getUid()}/profile/walk/price/max`).set(max);
    }
  }

  /**
   * Adds a new dog into the database
   * @param {number} dogOwnerId the current user ID
   * @param {string} dogName Name of the dog
   * @param {number} dogAge The age of the dog
   * @param {string} dogRace The race of the dog
   * @param {string} dogFavoriteToy The favorite toy of the dog
   * @param {string} dogFavoriteFood The favorite food of the god
   * @returns {string} Unique ID of the dog generated by firebase
   */
  async addDog(dogName, dogAge, dogRace, dogFavoriteToy, dogFavoriteFood) {
    // Dog can't be processed if it's not a string or empty field.
    if (_.isNil(dogName) || !_.isString(dogName)) {
      throw new Error('Dog name cannot be empty and must be a string');
    }

    // The passed value must be number to correctly store in the database
    if (_.isNil(dogAge) || !_.isNumber(dogAge)) {
      throw new Error('Dog age cannot be empty and must be a number');
    }

    if (_.isNil(dogRace) || !_.isString(dogRace)) {
      throw new Error('Dog race cannot be empty and must be a string');
    }

    if (_.isNil(dogFavoriteToy) || !_.isString(dogFavoriteToy)) {
      throw new Error('Dogs favorite toy cannot be empty and must be a string');
    }

    if (_.isNil(dogFavoriteFood) || !_.isString(dogFavoriteFood)) {
      throw new Error('Dogs favorite food cannot be empty and must be a string');
    }

    // create new dog object and add it to the current user reference
    const newDog = await this.database.ref(`users/${this.getUid()}/dogs`).push({
      name: dogName,
      age: dogAge,
      race: dogRace,
      favoriteToy: dogFavoriteToy,
      favoriteFood: dogFavoriteFood,
      timestamp: Date.now()
    });
    return newDog.key;
  }

  /**
   * Gathers all the dogs for a given user.
   * @param {string} dogOwnerId The dog owner id of the persons dogs being gathered.
   */
  async getAllDogs(dogOwnerId = this.getUid()) {
    if (_.isNil(dogOwnerId) || !_.isString(dogOwnerId) || dogOwnerId.trim() === '') {
      // we must validate that a id of the dog owner is not null, or a non-valid / empty string,
      // this is due to all firebase related ids all being a stirng.
      throw new Error('Dog owner id cannot be a valid non-empty string');
    }

    // gather the reference to the dogs and return it.
    const dogs = await this.database.ref(`users/${dogOwnerId}/dogs`).once('value');
    return dogs.val() || {};
  }

  /**
   * Gets a single dog that is related to a owner, by its id.
   * @param {string} dogOwnerId The dog owners id (will default to the current dog owner).
   * @param {string} dogId The id of the dog that is getting gathered.
   */
  async getSingleDog(dogOwnerId = this.getUid(), dogId) {
    if (_.isNil(dogOwnerId) || !_.isString(dogOwnerId) || dogOwnerId.trim() === '') {
      // we must validate that a id of the dog owner is not null, or a non-valid / empty string,
      // this is due to all firebase related ids all being a stirng.
      throw new Error('Dog owner id cannot be a valid non-empty string');
    }

    if (_.isNil(dogId) || !_.isString(dogId) || dogId.trim() === '') {
      // we must validate that a id of the dog owner is not null, or a non-valid / empty string,
      // this is due to all firebase related ids all being a stirng.
      throw new Error('Dog id cannot be a valid non-empty string');
    }

    // gather the reference to the dog and return it.
    const dog = await this.database.ref(`users/${dogOwnerId}/dogs/${dogId}`).once('value');
    return dog.val();
  }

  /**
   * Removes a single dog by the provided dog id and the dog owner id.
   * @param {string} dogOwnerId The dog owner, who owns the dog being removed.
   * @param {string} dogId The dog id of the dog being removed.
   */
  async removeDog(dogOwnerId = this.getUid(), dogId) {
    if (_.isNil(dogOwnerId) || !_.isString(dogOwnerId) || dogOwnerId.trim() === '') {
      // we must validate that a id of the dog owner is not null, or a non-valid / empty string,
      // this is due to all firebase related ids all being a stirng.
      throw new Error('Dog owner id cannot be a valid non-empty string');
    }

    if (_.isNil(dogId) || !_.isString(dogId) || dogId.trim() === '') {
      // we must validate that a id of the dog owner is not null, or a non-valid / empty string,
      // this is due to all firebase related ids all being a stirng.
      throw new Error('Dog id cannot be a valid non-empty string');
    }

    // return the async method call of removing that dog by the dog owner and the dog id.
    return this.database.ref(`users/${dogOwnerId}/dogs/${dogId}`).remove();
  }

  /**
   * Gets the dog reference for the dog owner id (defaulting to the current authenticated users
   * dogs). This can be used to listen to changes, or make direct changes to the users dog section.
   *
   * @param {string} [dogOwnerId=this.getUid()] The id of the dog owner who's reference will be gathered.
   * @returns Database reference.
   * @memberof FirebaseWrapper
   */
  getDogsReference(dogOwnerId = this.getUid()) {
    return this.database.ref(`users/${dogOwnerId}/dogs`);
  }

  /**
   * creates a new user for which is called when a new sign in user happens.
   * @returns {firebase.Promise.<*>}
   */
  async createNewUser() {
    const profile = this.generateProfileFromLogin();
    const user = this.getCurrentUser();

    const created = await this.database.ref(`users/${this.getUid()}/profile`).set({
      email: profile.email,
      name: profile.displayName,
      last_login: Date.now(),
      login_count: 1,
      photo: user.photoURL || 'https://i.imgur.com/7c0tNV6.png',
      phone_number: null,
      addresses: [],
      new: true,
      contact_number: 0,
      status_type: null,
      payment: null,
      walk: {
        active: false,
        rating: 0,
        completed: 0,
        balance: 5,
        price: {
          min: 5,
          max: 10
        }
      },
      age: 0
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
