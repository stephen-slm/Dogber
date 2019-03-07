import _ from 'lodash';

import firebaseWrapper from '../../src/lib/firebaseWrapper';

describe('Firebase Wrapper', async () => {
  // generate a random apendix so that two tests running at any given time will not be clashing when
  // attempting to create the account. This is a cheap away of avoiding collision.
  const email = `test-${Math.floor(Math.random() * (1000 - 0) + 0)}@dogber.co.uk`;
  const password = 'testingpassword';

  /**
   * Before any test has been ran, we want to test and ensure that the account has been created.
   * This account will then be used to be authenticated with the system  / test the sections of the
   * database and firebase that we need to test. Without this process we are limited in what we can
   * test.
   */
  beforeAll(() => {
    return firebaseWrapper.authentication
      .createUserWithEmailAndPassword(email, password)
      .then(() => firebaseWrapper.authentication.signInWithEmailAndPassword(email, password))
      .then(() => firebaseWrapper.createNewUser())
      .then((account) => expect(account));
  });

  /**
   * Delete the account afterward, we don't need it anymore and we dont need the junk data in the
   * system. This will run no matter if the tests fail or pass.
   */
  afterAll(async () => {
    return firebaseWrapper.deleteAccount().then(() => expect());
  });

  /**
   * Testing the creation process. Making sure the correct information exists for user. Checking
   * that the new tag is set and validating that the login timestamp is correct and recent (but not
   * pefect).
   */
  describe('Creating a new user', async () => {
    it('Should create a profile with the basic users details', async () => {
      expect.assertions(8); // four assertions are taking plac and expected.

      const profile = await firebaseWrapper.getProfile();

      expect(profile.email).toEqual(email);
      expect(profile.new).toBeTruthy();
      expect(profile.login_count).toEqual(1);
      expect(profile.last_login).toEqual(expect.any(Number));

      expect(profile.rating).toEqual(expect.any(Number));
      expect(profile.rating).toEqual(0);

      expect(profile.completedWalks).toEqual(expect.any(Number));
      expect(profile.completedWalks).toEqual(0);
    });

    it('Should should be marked as new within the profile if the account is recently created', async () => {
      expect.assertions(1); // one assertions are taking plac and expected.

      const profile = await firebaseWrapper.getProfile();
      expect(profile.new).toBeTruthy();
    });

    it('Should have a datetime stamp of when the account was created', async () => {
      expect.assertions(1); // one assertions are taking plac and expected.

      // we don't care that is perfect, just that its within the last two seconds of when the
      // account creation process was requested. Otherwise its probably not been set properly.
      const profile = await firebaseWrapper.getProfile();
      expect(Date.now() - profile.last_login <= 25000).toBeTruthy();
    });

    it('Should insert a default notification into the notifications section of the new user', async () => {
      expect.assertions(4);

      const notifications = await firebaseWrapper.getNotifications();
      const notification = notifications[_.first(Object.keys(notifications))];

      // validate that we only have one when the first notification has been created.
      expect(_.size(notifications)).toEqual(1);

      // validate that the items exist, we don't care too much about the contents of the default
      // notification as this will be tested in is own section, testing notification creation. As
      // long as the items exist that is what matters.
      expect(!_.isNil(notification.message)).toBeTruthy();
      expect(!_.isNil(notification.title)).toBeTruthy();
      expect(!_.isNil(notification.timestamp)).toBeTruthy();
    });
  });

  describe('incrementUsersLoginAcount', async () => {
    it('Should increment the login count for the logged in user', async () => {
      expect.assertions(1);

      // we must gather the profile to know what the login count is before we attempt to increment
      // the value. So when we increment the value we can check back with the old login count + 1.
      const profile = await firebaseWrapper.getProfile();
      const profileLoginCount = profile.login_count;

      // increment the login count and the login date time.
      await firebaseWrapper.incrementUsersLoginAcount();

      const updatedProfile = await firebaseWrapper.getProfile();
      const updatedProfileLoginCount = updatedProfile.login_count;

      // validate that the old profile has been incremented (by validating that the old value + 1 is
      // the new value that is being stored).
      expect(profileLoginCount + 1).toEqual(updatedProfileLoginCount);
    });

    /**
     * We need to check that when we call the incrementation of the login count that the given users
     * login date time stamp is also incremented, this allows us to follow be able to check when the
     * users have logged in last and how many people login. Additionally this will help with
     * understanding if someone has been accessing a given account. (for reporting reasons).
     */
    it('Should reset the last login count date for the given user', async () => {
      expect.assertions(1); // we only have one assertion that is being checked.

      // we must get the current profile, so we can use the last login count later on for validating
      // the difference.
      const profile = await firebaseWrapper.getProfile();
      const profileDateTime = profile.last_login;

      // increment the login count and the login date time.
      await firebaseWrapper.incrementUsersLoginAcount();

      const updatedProfile = await firebaseWrapper.getProfile();

      // we determine the difference here because we need to know the time difference from the point
      // of the new updated. Otherwise we will not be testing the correct difference if we do it
      // before hand. We would be also taking into account the communication time of dating the
      // records which should be avoided.
      const difference = Date.now() - profileDateTime;
      const updatedDifference = Date.now() - updatedProfile.last_login;

      // the difference should be greater as this is the old date time.
      expect(difference > updatedDifference).toBeTruthy();
    });
  });

  /**
   * Test to check if the increment function works correctly.
   * we also checks the parameter validates correctly before incrementing.
   */
  describe('incrementRating', async () => {
    it('Should increment user profile rating', async () => {
      expect.assertions(3);

      // Get the a profile and rating
      const profile = await firebaseWrapper.getProfile();
      const currentRating = profile.rating;

      // Increment the profile rating to 3
      await firebaseWrapper.incrementRating(3);

      // Get the updated profile with new rating
      const updatedProfile = await firebaseWrapper.getProfile();
      const updatedCurrentRating = updatedProfile.rating;

      // Compare the ratings from old profile to new profile
      expect(updatedCurrentRating).toEqual(currentRating + 3);

      // Increment profile rating by 7 using different calls
      await firebaseWrapper.incrementRating(2);
      await firebaseWrapper.incrementRating(5);

      // Check if the profile rating has added the values correctly
      const updatedProfile2 = await firebaseWrapper.getProfile();
      expect(updatedProfile2.rating).toEqual(updatedCurrentRating + 7);

      // Increment floating point .5
      await firebaseWrapper.incrementRating(2.5);

      // Check if the profile rating has added the values correctly
      const updatedProfile3 = await firebaseWrapper.getProfile();
      expect(updatedProfile3.rating).toEqual(updatedCurrentRating + 9.5);
    });
    it('The rating should be a number', async () => {
      expect.assertions(1);
      await expect(firebaseWrapper.incrementRating('Not a number')).rejects.toEqual(
        new Error('Previous rating must be number')
      );
    });
    it('The rating should be a number', async () => {
      expect.assertions(1);
      await expect(firebaseWrapper.incrementRating(true)).rejects.toEqual(
        new Error('Previous rating must be number')
      );
    });
    it('The rating should be a number', async () => {
      expect.assertions(1);
      await expect(firebaseWrapper.incrementRating([1, 2])).rejects.toEqual(
        new Error('Previous rating must be number')
      );
    });
    it('The rating should not be less than 0', async () => {
      expect.assertions(1);
      await expect(firebaseWrapper.incrementRating(-1)).rejects.toEqual(
        new Error('Your rating should be between 0 to 5 and integer or .5 floating number')
      );
    });

    it('The rating should not be bigger than 5', async () => {
      expect.assertions(1);
      await expect(firebaseWrapper.incrementRating(10)).rejects.toEqual(
        new Error('Your rating should be between 0 to 5 and integer or .5 floating number')
      );
    });
    it('The rating should not be bigger than 5', async () => {
      expect.assertions(1);
      await expect(firebaseWrapper.incrementRating(3.2)).rejects.toEqual(
        new Error('Your rating should be between 0 to 5 and integer or .5 floating number')
      );
    });
  });

  describe('incrementCompletedWalks', async () => {
    it('Should increment the profile total amount of completed wakls', async () => {
      expect.assertions(1);

      // To test the increment of walk we get the profile alongisde the number of walks
      // and store in a variable used afterwards to compare old value to a new one
      const profile = await firebaseWrapper.getProfile();
      const profileCompletedWalks = profile.completedWalks;

      // Increment the number of walks by 1
      await firebaseWrapper.incrementCompletedWalks();

      // We get again the profile with the updated completed number of walks
      const updatedProfile = await firebaseWrapper.getProfile();
      const updatedProfileCompletedWalks = updatedProfile.completedWalks;

      // Now compare the new expected value with the previous value number of walks
      expect(updatedProfileCompletedWalks).toEqual(profileCompletedWalks + 1);
    });
  });

  /**
   * Welcome messages are only for new users, we should not be able to create a welcome message for
   * a user what has existed long enough for the account to be marked as "not" new.
   */
  describe('createWelcomeMessageNotification', async () => {
    it('Should not create a new welcome notification if the account is marked as not new', async () => {
      expect.assertions(1);

      // get the current profile so we know what to set it back too afterwards.
      const profile = await firebaseWrapper.getProfile();

      await firebaseWrapper.database.ref(`users/${firebaseWrapper.getUid()}/profile/new`).set(false);

      await expect(firebaseWrapper.createWelcomeMessageNotification()).rejects.toEqual(
        new Error('User must be null to have a welcome notification')
      );

      // make sure to set it back to whatever it was before we made the changes to false.
      await firebaseWrapper.database.ref(`users/${firebaseWrapper.getUid()}/profile/new`).set(profile.new);
    });
  });

  describe('createNotification', async () => {
    // the error message that could error when testing the types and values for a given insert for a
    // given notification. Its easier to have them defined before all the tests start than have them
    // repeatedly typed out constantly. Reducing chance of errors being typed in the tests.
    const titleError = new Error('title cannot be null or empty or not a string');
    const messageError = new Error('message cannot be null or empty or not a string');
    const actionTypeError = new Error('actionType cannoot be empty or not a string');
    const actionLinkError = new Error('actionLink cannoot be empty or not a string');

    /**
     * Test that we are not going to be putting anything but a string within the database for the
     * title. This allows for better parsing of the notifications on the client side later.
     */
    it('Should reject the title if its a empty string', async () => {
      expect.assertions(2);

      await expect(firebaseWrapper.createNotification('', null, null, null)).rejects.toEqual(titleError);
      await expect(firebaseWrapper.createNotification(' ', null, null, null)).rejects.toEqual(titleError);
    });

    /**
     * We don't need any missing data, we are always expecting a title.
     */
    it('Should reject the title if its null or undefined', async () => {
      expect.assertions(2);

      await expect(firebaseWrapper.createNotification(null, null, null, null)).rejects.toEqual(titleError);
      await expect(firebaseWrapper.createNotification(undefined, null, null, null)).rejects.toEqual(
        titleError
      );
    });

    /**
     * We don't need any missing data, we are always expecting a title.
     */
    it('Should reject the title if its not a string', async () => {
      expect.assertions(1);

      const notification = firebaseWrapper.createNotification(['testing'], null, null, null);
      await expect(notification).rejects.toEqual(titleError);
    });

    /**
     * Test that we are not going to be putting anything but a string within the database for the
     * message. This allows for better parsing of the notifications on the client side later.
     */
    it('Should reject the message if its a empty string', async () => {
      expect.assertions(2);

      const notification = firebaseWrapper.createNotification('title', ' ', null, null);
      await expect(notification).rejects.toEqual(messageError);

      const notificationSpace = firebaseWrapper.createNotification('title', '', null, null);
      await expect(notificationSpace).rejects.toEqual(messageError);
    });

    /**
     * We don't need any missing data, we are always expecting a message.
     */
    it('Should reject the message if its null or undefined', async () => {
      expect.assertions(2);

      const notification = firebaseWrapper.createNotification('title', null, null, null);
      await expect(notification).rejects.toEqual(messageError);

      const notificationUndefined = firebaseWrapper.createNotification('title', undefined, null, null);
      await expect(notificationUndefined).rejects.toEqual(messageError);
    });

    /**
     * We don't need any missing data, we are always expecting a message.
     */
    it('Should reject the message if its not a string', async () => {
      expect.assertions(1);
      const notification = firebaseWrapper.createNotification('title', ['testing'], null, null);
      await expect(notification).rejects.toEqual(messageError);
    });

    /**
     * if we are using a actionType,  we are not going to be putting anything but a string within
     * the database for the actionType. Making sure that the string acutally has content.
     */
    it('Should reject the actionType if its not null and if its a empty string', async () => {
      expect.assertions(2);
      const notification = firebaseWrapper.createNotification('title', 'message', '', null);
      await expect(notification).rejects.toEqual(actionTypeError);

      const notificationSpace = firebaseWrapper.createNotification('title', 'message', ' ', null);
      await expect(notificationSpace).rejects.toEqual(actionTypeError);
    });

    /**
     * if we are using a actionType,  we are not going to be putting anything but a string within the
     * database for the actionType. Making sure that its a string.
     */
    it('Should reject the actionType if its not null and if its not a string', async () => {
      expect.assertions(1);
      const notification = firebaseWrapper.createNotification('title', 'message', ['testing'], null);
      await expect(notification).rejects.toEqual(actionTypeError);
    });

    /**
     * if we are using a actionLink,  we are not going to be putting anything but a string within the
     * database for the actionLink. Making sure that the string acutally has content.
     */
    it('Should reject the actionLink if its not null and if its a empty string', async () => {
      expect.assertions(2);
      const notification = firebaseWrapper.createNotification('title', 'message', 'actionType', '');
      await expect(notification).rejects.toEqual(actionLinkError);

      const notificationSpace = firebaseWrapper.createNotification('title', 'message', 'actionType', ' ');
      await expect(notificationSpace).rejects.toEqual(actionLinkError);
    });

    /**
     * if we are using a actionLink,  we are not going to be putting anything but a string within the
     * database for the actionLink. Making sure that its a string.
     */
    it('Should reject the actionLink if its not null and if its not a string', async () => {
      expect.assertions(1);
      const notification = firebaseWrapper.createNotification('title', 'message', 'actionType', ['testing']);
      await expect(notification).rejects.toEqual(actionLinkError);
    });

    /**
     * When the notification is created we must ensure that we are getting back to the key, this is
     * the key we will be using to reference the notification. This would be used for the removing
     * of notifications as well. / single gathering.
     */
    it('Should should return the notification key if the notification has been created', async () => {
      expect.assertions(1);

      const notification = await firebaseWrapper.createNotification('title', 'message', null, null);
      expect(typeof notification).toBe('string');
    });

    /**
     * When the notification is created we get a key reference, this must be validated that we can
     * regather the notification back from the server and all the contents exists correctly.
     */
    it('should return a valid notification key that can be used to regather the notification', async () => {
      expect.assertions(9);

      const nontificationSize = _.size(await firebaseWrapper.getNotifications());

      const notification = await firebaseWrapper.createNotification('title-2', 'message-2', null, null);
      const regathered = await firebaseWrapper.getNotificationByKey(notification);

      // test that the given notification actually exists within the database with the correct
      // information. e.g correct title, message and existing time stamp.
      expect(regathered.title).toEqual('title-2');
      expect(regathered.message).toEqual('message-2');
      expect(!_.isNil(regathered.timestamp)).toBeTruthy();

      const notificationFull = await firebaseWrapper.createNotification(
        'title-3',
        'message-3',
        'actiontype-3',
        'actionlink-3'
      );
      const regatheredFull = await firebaseWrapper.getNotificationByKey(notificationFull);

      // test that the given notification actually exists within the database with the correct
      // information when all parameters are provided to get the most amount of data to be stored
      // about a given notification.
      expect(regatheredFull.title).toEqual('title-3');
      expect(regatheredFull.message).toEqual('message-3');
      expect(regatheredFull.actionType).toEqual('actiontype-3');
      expect(regatheredFull.actionLink).toEqual('actionlink-3');

      expect(!_.isNil(regatheredFull.timestamp)).toBeTruthy();

      const updatedNotificationCount = _.size(await firebaseWrapper.getNotifications());
      expect(nontificationSize + 2).toEqual(updatedNotificationCount);
    });
  });

  describe('removeNotification', async () => {
    /**
     * We must be sure that when we want to remove a notification that its properly removed and does
     * not affect any other notification within the database. This means testing with other
     * notifications in the data.
     */
    it('Should remove the notification if it exists within the database', async () => {
      expect.assertions(5);

      const currentNotifications = await firebaseWrapper.getNotifications();
      const sizeOfCurrent = _.size(currentNotifications);

      const key = await firebaseWrapper.createNotification('title', 'message');
      const key2 = await firebaseWrapper.createNotification('title2', 'message3');
      const key3 = await firebaseWrapper.createNotification('title3', 'message3');

      let updatedNotifications = await firebaseWrapper.getNotifications();

      // assert that we are actually creating the notifications
      expect(_.size(updatedNotifications)).toEqual(sizeOfCurrent + 3);
      expect(Object.keys(updatedNotifications)).toEqual(expect.arrayContaining([key, key2, key3]));

      // remove the first notification.
      await firebaseWrapper.removeNotification(key);

      // regather after deleting just one notification.
      updatedNotifications = await firebaseWrapper.getNotifications();

      // validate that the first key has gone but the others have stayed.
      expect(Object.keys(updatedNotifications)).not.toEqual(expect.arrayContaining([key]));
      expect(Object.keys(updatedNotifications)).toEqual(expect.arrayContaining([key2, key3]));

      // remove the last two notifications and check if they have gone.
      await firebaseWrapper.removeNotification(key2);
      await firebaseWrapper.removeNotification(key3);

      // regather after deleting the other two notifications.
      updatedNotifications = await firebaseWrapper.getNotifications();

      // expect that the notifications have now gone.
      expect(Object.keys(updatedNotifications)).not.toEqual(expect.arrayContaining([key, key2, key3]));
    });
  });
});
