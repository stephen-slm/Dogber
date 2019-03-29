import _ from 'lodash';
import firebaseWrapper from '../../src/lib/firebaseWrapper';
import * as firebaseConstants from '../../src/constants/firebaseConstants.js';

describe('Firebase Wrapper', async () => {
  // generate a random apendix so that two tests running at any given time will not be clashing when
  // attempting to create the account. This is a cheap away of avoiding collision.
  const email = `test-${Math.floor(Math.random() * (1000 - 0) + 0)}@dogber.co.uk`;
  const emailSecond = `test-${Math.floor(Math.random() * (1000 - 0) + 0)}-second@dogber.co.uk`;
  const password = 'testingpassword';

  // user id references that will be used for when two ids will be required, this can be related to
  // storing notifications, adding feedback and creating related works for given users.
  let userOneId = '';
  let userTwoId = '';

  /**
   * Before any test has been ran, we want to test and ensure that the account has been created.
   * This account will then be used to be authenticated with the system  / test the sections of the
   * database and firebase that we need to test. Without this process we are limited in what we can
   * test.
   */
  beforeAll(async (done) => {
    await firebaseWrapper.authentication.createUserWithEmailAndPassword(emailSecond, password);
    await firebaseWrapper.authentication.signInWithEmailAndPassword(emailSecond, password);
    await firebaseWrapper.createNewUser();
    userTwoId = firebaseWrapper.getUid();

    // sign out the second account
    await firebaseWrapper.authentication.signOut();

    // create the account that will actually be used for the authentication and data processsing the
    // first email (email second) will be used for transfering data between two existing users.
    await firebaseWrapper.authentication.createUserWithEmailAndPassword(email, password);
    await firebaseWrapper.authentication.signInWithEmailAndPassword(email, password);
    await firebaseWrapper.createNewUser();
    userOneId = firebaseWrapper.getUid();

    done();
  });

  /**
   * Delete the account afterward, we don't need it anymore and we dont need the junk data in the
   * system. This will run no matter if the tests fail or pass.
   */
  afterAll(async (done) => {
    const currentWalkKeys = Object.values(await firebaseWrapper.getAllWalkKeys());

    // making sure to clean up and remove all current walks created by the given/authenticated
    // users. This is required as they are referenced by keys for the users and not stored locally.
    for (const key of currentWalkKeys) {
      await firebaseWrapper.database
        .ref(`walks/${key}`)
        .remove()
        .catch(/* do nothing */);
    }

    await firebaseWrapper.deleteAccount();

    // authentication as the old account and delete the account as we have two accounts.
    await firebaseWrapper.authentication.signInWithEmailAndPassword(emailSecond, password);
    await firebaseWrapper.deleteAccount();

    done();
  });

  /**
   * Testing the creation process. Making sure the correct information exists for user. Checking
   * that the new tag is set and validating that the login timestamp is correct and recent (but not
   * pefect).
   */
  describe('Creating a new user', async () => {
    it('Should create a profile with the basic users details', async () => {
      expect.assertions(19); // four assertions are taking plac and expected.

      const profile = await firebaseWrapper.getProfile();

      expect(profile.email).toEqual(email);
      expect(profile.new).toBeTruthy();
      expect(profile.login_count).toEqual(1);
      expect(profile.last_login).toEqual(expect.any(Number));
      expect(profile.photo).toEqual(expect.any(String));

      // We can determine the users age when they first login with the welcome screen. but until
      // then we will have the age defaulted to 0. Its not really required but used for information
      // gathering.
      expect(profile.age).toEqual(expect.any(Number));
      expect(profile.age).toEqual(0);

      // the rating will start off as 0 as the user as no real rating when first starting to use the
      // application. This will be changed throughout the use of th`e application.
      expect(profile.walk.rating).toEqual(expect.any(Number));
      expect(profile.walk.rating).toEqual(0);

      // The user has not completed any walks so we will default to 0
      expect(profile.walk.completed).toEqual(expect.any(Number));
      expect(profile.walk.completed).toEqual(0);

      // The user will get a welcome amount of balance of 5.
      expect(profile.walk.balance).toEqual(expect.any(Number));
      expect(profile.walk.balance).toEqual(5);

      // The user has not set a price so we will default to 5/10
      expect(profile.walk.price.min).toEqual(expect.any(Number));
      expect(profile.walk.price.min).toEqual(5);

      // The user has not set a price so we will default to 5/10
      expect(profile.walk.price.max).toEqual(expect.any(Number));
      expect(profile.walk.price.max).toEqual(10);

      // The user has not set a default active state (if they can be active or not).
      expect(profile.walk.active).toEqual(expect.any(Boolean));
      expect(profile.walk.active).toEqual(false);
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

  describe('adjustWalkActiveState', async () => {
    // errors that occure during the adjust walk phase, these are here to help improve testability of the code without repeating it constantly.
    const notBooleanError = new Error('New active state must be a boolean');

    it('Should reject if the input value is not a boolean', async () => {
      expect.assertions(5);

      // validate that the core types are not going to be accepted within the function, heavily
      // reducing the chance of misplaced data types being inserted instead of the correct
      // responding value.
      await expect(firebaseWrapper.adjustWalkActiveState('boolean')).rejects.toEqual(notBooleanError);
      await expect(firebaseWrapper.adjustWalkActiveState(8001)).rejects.toEqual(notBooleanError);
      await expect(firebaseWrapper.adjustWalkActiveState(['boolean'])).rejects.toEqual(notBooleanError);
      await expect(firebaseWrapper.adjustWalkActiveState({ active: true })).rejects.toEqual(notBooleanError);
      await expect(firebaseWrapper.adjustWalkActiveState((x) => x > 5)).rejects.toEqual(notBooleanError);
    });

    it('Should set the value if a given boolean is used', async () => {
      expect.assertions(2);

      const profile = await firebaseWrapper.getProfile();
      const existingState = profile.walk.active;

      // by taking the exsting state, we can reflect the change on the users profile, then
      // validating that its changed easily (instead of expecting it to always be false).
      await firebaseWrapper.adjustWalkActiveState(!existingState);

      // get the updated profile, this will be used to validate the changes going through.
      const updatedProfile = await firebaseWrapper.getProfile();
      const updatedState = updatedProfile.walk.active;

      expect(updatedState).toEqual(!existingState);

      // now lets confirm that the changes work going backwards as well, we need to make sure
      // that is a consistant result.
      await firebaseWrapper.adjustWalkActiveState(existingState);

      const revertedProfile = await firebaseWrapper.getProfile();
      const revertedState = revertedProfile.walk.active;

      expect(revertedState).toEqual(existingState);
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
      const currentRating = profile.walk.rating;

      // Increment the profile rating to 3
      await firebaseWrapper.incrementRating(3);

      // Get the updated profile with new rating
      const updatedProfile = await firebaseWrapper.getProfile();
      const updatedCurrentRating = updatedProfile.walk.rating;

      // Compare the ratings from old profile to new profile
      expect(updatedCurrentRating).toEqual(currentRating + 3);

      // Increment profile rating by 7 using different calls
      await firebaseWrapper.incrementRating(2);
      await firebaseWrapper.incrementRating(5);

      // Check if the profile rating has added the values correctly
      const updatedProfile2 = await firebaseWrapper.getProfile();
      expect(updatedProfile2.walk.rating).toEqual(updatedCurrentRating + 7);

      // Increment floating point .5
      await firebaseWrapper.incrementRating(2.5);

      // Check if the profile rating has added the values correctly
      const updatedProfile3 = await firebaseWrapper.getProfile();
      expect(updatedProfile3.walk.rating).toEqual(updatedCurrentRating + 9.5);
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

      // must fit within the correct ranges of 0-5
      await expect(firebaseWrapper.incrementRating(-1)).rejects.toEqual(
        new Error('Your rating should be between 0 to 5 and integer or .5 floating number')
      );
    });

    it('The rating should not be bigger than 5', async () => {
      expect.assertions(1);

      // must fit within the correct ranges of 0-5
      await expect(firebaseWrapper.incrementRating(10)).rejects.toEqual(
        new Error('Your rating should be between 0 to 5 and integer or .5 floating number')
      );
    });

    it('The rating should not be bigger than 5', async () => {
      expect.assertions(1);

      // all though we allow decimal numbers, it should be in the range of 0.5, so we must make sure
      // to reject the possible chance of it being a decimal place but not .5
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
      const profileWalk = profile.walk.completed;

      // Increment the number of walks by 1
      await firebaseWrapper.incrementCompletedWalks();

      // We get again the profile with the updated completed number of walks
      const updatedProfile = await firebaseWrapper.getProfile();
      const updatedProfileCompleted = updatedProfile.walk.completed;

      // Now compare the new expected value with the previous value number of walks
      expect(updatedProfileCompleted).toEqual(profileWalk + 1);
    });
  });

  describe('UpdateProfile', async () => {
    it('Should reject any non-core components of the profile', async () => {
      expect.assertions(2);

      // update the profile with the new data, once we regather the profile we need to validate that
      // the fake value does not exist in the updated.
      await firebaseWrapper.updateProfile({ fake: 'invalid_value' });

      // the updated profile we will use to validate that the changes have taken place.
      const updatedProfile = await firebaseWrapper.getProfile();

      // validate that our fake input value did not actually make it into the profile.
      expect(updatedProfile.fake).not.toEqual('invalid_value');
      expect(updatedProfile.fake).toBeUndefined();
    });

    it('should replace any existing value that is already in the profile', async () => {
      expect.assertions(4);

      // get the current profile as we will use this to expect that the updated profile has changed
      // based on the calls to update the profile.
      const existingProfile = await firebaseWrapper.getProfile();

      // update the profile with the new data, once we regather the profile we need to validate that
      // the name and age have been updated but the fake value does not exist in the updated.
      await firebaseWrapper.updateProfile({ name: 'new_name', age: 5 });

      // the updated profile we will use to validate that the changes have taken place.
      const updatedProfile = await firebaseWrapper.getProfile();

      // validate that the updated profile does actually contain some kind of change.
      expect(updatedProfile.name).not.toEqual(existingProfile.name);
      expect(updatedProfile.age).not.toEqual(existingProfile.age);

      // validate that our new values are actually what we expect them to be.
      expect(updatedProfile.name).toEqual('new_name');
      expect(updatedProfile.age).toEqual(5);
    });

    it('should not update the walk section, as this is not related the profile', async () => {
      expect.assertions(2);

      // update the profile with the new data, once we regather the profile we need to validate that
      // the walk has not been updated.
      await firebaseWrapper.updateProfile({ walk: { bob: 5 } });

      // the updated profile we will use to validate that the changes have taken place.
      const updatedProfile = await firebaseWrapper.getProfile();

      // validate that our fake input value did not actually make it into the profile.
      expect(updatedProfile.walk.bob).not.toEqual(5);
      expect(updatedProfile.walk.bob).toBeUndefined();
    });
  });

  describe('GetProfile', async () => {
    // the errors that can be thrown through the implementation process of the get profile, these
    // are here to allow for better code qualifty of testing. We don't have to keep repeating the
    // errors.
    const idNullError = new Error('Passed id cannot be null or undefined');
    const notStringError = new Error('Passed id should be of type string');

    it('Should return a valid profile object when the user is authenticated with no id passed', async () => {
      expect.assertions(7);

      const profile = await firebaseWrapper.getProfile();

      // all the core properties we are expecting on the object.
      expect(profile.last_login).toEqual(expect.any(Number));
      expect(profile.age).toEqual(expect.any(Number));
      expect(profile.walk.rating).toEqual(expect.any(Number));
      expect(profile.walk.completed).toEqual(expect.any(Number));
      expect(profile.walk.balance).toEqual(expect.any(Number));
      expect(profile.walk.price.min).toEqual(expect.any(Number));
      expect(profile.walk.price.max).toEqual(expect.any(Number));
    });

    it('Should reject the id if its not of type string', async () => {
      expect.assertions(3);

      // all given ids should be of type string,this is due to firebase ids being related around the
      // string properly, using anything else should be rejected.
      await expect(firebaseWrapper.getProfile([5])).rejects.toEqual(notStringError);
      await expect(firebaseWrapper.getProfile(5)).rejects.toEqual(notStringError);
      await expect(firebaseWrapper.getProfile(true)).rejects.toEqual(notStringError);
    });

    it('Should reject the id if its null or undefined it should use the authenticated user.', async () => {
      expect.assertions(2);

      // all given ids should be of type null or undefined,this is due to firebase ids being related
      // around the string properly, using anything else should be rejected.
      await expect(firebaseWrapper.getProfile(null)).rejects.toEqual(idNullError);

      // the current profile and profile with the undefined state, we should expect undefined to
      // pull back the actual profile as the defautlt value will kick in (using the current
      // authenticated person).
      const profile = firebaseWrapper.getProfile(undefined);
      const actualProfile = firebaseWrapper.getProfile();

      await expect(profile).toEqual(actualProfile);
    });
  });

  describe('UpdateWalkCost', async () => {
    // the errors that can be thrown, just defined to stop the creation of duplicate code.
    const minMissingError = new Error('if min is provided it must be a number');
    const maxMissingError = new Error('if min is provided it must be a number');
    const minMinError = new Error('if min is provided it must be greater than 0');
    const maxMinError = new Error('if max is provided it must be greater than 0 and greater than min');

    it('Should reject if min value is not a number', async () => {
      expect.assertions(2);

      // we need to process it as a number for displaying for a given user.
      await expect(firebaseWrapper.updateWalkCost([5], 5)).rejects.toEqual(minMissingError);
      await expect(firebaseWrapper.updateWalkCost('5', 5)).rejects.toEqual(minMissingError);
    });

    it('Should reject if max value is not a number', async () => {
      expect.assertions(2);

      // we need to process it as a number for displaying for a given user.
      await expect(firebaseWrapper.updateWalkCost(5, [5])).rejects.toEqual(maxMissingError);
      await expect(firebaseWrapper.updateWalkCost(5, '5')).rejects.toEqual(maxMissingError);
    });

    it('Should reject if min value is less than 0', async () => {
      expect.assertions(2);

      // negative numbers will always be misleading for a users interface.
      await expect(firebaseWrapper.updateWalkCost(-5, 5)).rejects.toEqual(minMinError);
      await expect(firebaseWrapper.updateWalkCost(-100, 5)).rejects.toEqual(minMinError);
    });

    it('Should reject if max value is less than 0', async () => {
      expect.assertions(2);

      // negative numbers will always be misleading for a users interface.
      await expect(firebaseWrapper.updateWalkCost(5, -1)).rejects.toEqual(maxMinError);
      await expect(firebaseWrapper.updateWalkCost(5, -100)).rejects.toEqual(maxMinError);
    });

    it('Should reject if max value is less than min value', async () => {
      expect.assertions(2);

      // it is important to check that the max value is actually bigger than the min, otherwise it
      // will be really misleading when it comes to dislaying this information on the profile
      // section for a given user, when someone is viewing another persons profile.
      await expect(firebaseWrapper.updateWalkCost(5, 4)).rejects.toEqual(maxMinError);
      await expect(firebaseWrapper.updateWalkCost(11, 1)).rejects.toEqual(maxMinError);
    });

    it('Should just update min if max is null', async () => {
      expect.assertions(1);

      // we will use this to validate that the changes have taken place.
      const currentProfile = await firebaseWrapper.getProfile();

      // update the min value to be less than the current min value, we can then validate that this
      // has changed but max has not.
      await firebaseWrapper.updateWalkCost(currentProfile.walk.price.min - 1, null);
      const updatedProfile = await firebaseWrapper.getProfile();

      expect(updatedProfile.walk.price.min).toEqual(currentProfile.walk.price.min - 1);
    });

    it('Should just update max if min is null', async () => {
      expect.assertions(1);

      // we will use this to validate that the changes have taken place.
      const currentProfile = await firebaseWrapper.getProfile();

      // update the max value to be more than the current max value, we can then validate that this
      // has changed but max has not.
      await firebaseWrapper.updateWalkCost(null, currentProfile.walk.price.max + 1);
      const updatedProfile = await firebaseWrapper.getProfile();

      expect(updatedProfile.walk.price.max).toEqual(currentProfile.walk.price.max + 1);
    });

    it('Should update both min and max with all values are valid', async () => {
      expect.assertions(2);

      // we will use this to validate that the changes have taken place.
      const currentProfile = await firebaseWrapper.getProfile();

      // update the max value to be more than the current max value, we can then validate that this
      // has changed but max has not.
      await firebaseWrapper.updateWalkCost(
        currentProfile.walk.price.min + 2,
        currentProfile.walk.price.max + 2
      );

      const updatedProfile = await firebaseWrapper.getProfile();

      // in this case we must validate that both the values have updated to the newly incremented by two values.
      expect(updatedProfile.walk.price.min).toEqual(currentProfile.walk.price.min + 2);
      expect(updatedProfile.walk.price.max).toEqual(currentProfile.walk.price.max + 2);
    });

    it('Should update no values if both input values are null', async () => {
      expect.assertions(2);

      // we will use this to validate that the changes have taken place.
      const currentProfile = await firebaseWrapper.getProfile();

      // update the max value to be more than the current max value, we can then validate that this
      // has changed but max has not.
      await firebaseWrapper.updateWalkCost(null, null);

      const updatedProfile = await firebaseWrapper.getProfile();

      // in this case we must validate that both the values have not updated as we have passed null
      // for both inputs, resulting in nothing being set and all inputs being ingored.
      expect(updatedProfile.walk.price.min).toEqual(currentProfile.walk.price.min);
      expect(updatedProfile.walk.price.max).toEqual(currentProfile.walk.price.max);
    });
  });

  describe('addFeedback', async () => {
    // the list of possible errors that have been created by the add feedback method, this is used
    // for testing reasons as it will help with the validation of errors when you don't have to
    // constantly repeat the error messages.
    const feedtargetNull = new Error('Feedback and target id must not be null or undefined');
    const feedtargetString = new Error('Feedback and target id must be of type string');
    const nullNotStringError = new Error('Feedback message must be a valid string');
    const noSelfFeedbackERror = new Error('Feedback cannot be given to youself.');

    it('Should reject if the feedbacker id is null', async () => {
      expect.assertions(1);

      await expect(firebaseWrapper.addFeedback(null, 'targetid', 'message')).rejects.toEqual(feedtargetNull);
    });

    it('Should reject if the feedbacker id is not a string', async () => {
      expect.assertions(4);

      await expect(firebaseWrapper.addFeedback('id', [1], 'm')).rejects.toEqual(feedtargetString);
      await expect(firebaseWrapper.addFeedback('id', false, 'm')).rejects.toEqual(feedtargetString);
      await expect(firebaseWrapper.addFeedback('id', true, 'm')).rejects.toEqual(feedtargetString);
      await expect(firebaseWrapper.addFeedback('id', () => { }, 'm')).rejects.toEqual(feedtargetString);
    });

    it('Should reject if the target id is null', async () => {
      expect.assertions(1);

      await expect(firebaseWrapper.addFeedback(null, 'targetid', 'message')).rejects.toEqual(feedtargetNull);
    });

    it('Should reject if the target id is not a string', async () => {
      expect.assertions(4);

      await expect(firebaseWrapper.addFeedback([1], 'id', 'm')).rejects.toEqual(feedtargetString);
      await expect(firebaseWrapper.addFeedback(false, 'id', 'm')).rejects.toEqual(feedtargetString);
      await expect(firebaseWrapper.addFeedback(true, 'id', 'm')).rejects.toEqual(feedtargetString);
      await expect(firebaseWrapper.addFeedback(() => { }, 'id', 'm')).rejects.toEqual(feedtargetString);
    });

    it('Should reject the message if its null or undefined', async () => {
      expect.assertions(2);

      await expect(firebaseWrapper.addFeedback('id', 'id', null)).rejects.toEqual(nullNotStringError);
      await expect(firebaseWrapper.addFeedback('id', 'id', undefined)).rejects.toEqual(nullNotStringError);
    });

    it('Should reject the message if its not a string', async () => {
      expect.assertions(4);

      await expect(firebaseWrapper.addFeedback('id', 'id', [1])).rejects.toEqual(nullNotStringError);
      await expect(firebaseWrapper.addFeedback('id', 'id', false)).rejects.toEqual(nullNotStringError);
      await expect(firebaseWrapper.addFeedback('id', 'id', true)).rejects.toEqual(nullNotStringError);
      await expect(firebaseWrapper.addFeedback('id', 'id', () => { })).rejects.toEqual(nullNotStringError);
    });

    it('Should reject adding feedback if you are attempting to add feedback to youself', async () => {
      expect.assertions(1);

      // the user who is giving feedback should not be able to give feedback to themselves, as this
      // defeats the point of feedback and will give a unrealistc feeling for a given user. who see
      // there profile.
      const selfId = firebaseWrapper.getUid();
      await expect(firebaseWrapper.addFeedback(selfId, selfId, 'message')).rejects.toEqual(
        noSelfFeedbackERror
      );
    });

    it('Should add feedback to the provided id', async () => {
      expect.assertions(5);

      // first we can get the base feedback, this is important as we can then use this in the future
      // to validate that the new feedback does not exist in the old feedback, making sure changes
      // are taken place.
      const userTwoFeedback = await firebaseWrapper.getFeedback(userTwoId);

      // first add a feedback so we can then validate that a single feedback is being added
      // correctly. Then we can test aginast multiple in a row and so fourth.
      const feedbackOne = await firebaseWrapper.addFeedback(userOneId, userTwoId, 'feedback one');
      const feedbackOneUpdate = await firebaseWrapper.getFeedback(userTwoId);

      // validate that the new feedback size has increased and the feedback exists.
      expect(_.size(feedbackOneUpdate)).toEqual(_.size(userTwoFeedback) + 1);
      expect(_.isNil(feedbackOneUpdate[feedbackOne])).toBeFalsy();

      // used to validate that the correct name was stored under the profile and id.
      const currentProfile = await firebaseWrapper.getProfile();

      // validate that the feedback object contains all the correct information.
      expect(feedbackOneUpdate[feedbackOne].message).toEqual('feedback one');
      expect(feedbackOneUpdate[feedbackOne].feedbacker.id).toEqual(userOneId);
      expect(feedbackOneUpdate[feedbackOne].feedbacker.name).toEqual(
        currentProfile.name || currentProfile.email
      );
    });
  });

  describe('getFeedback', async () => {
    // get feedback related error messages, put here to help with cleaner testing code and better
    // quality of testing.
    const nullError = new Error('Passed id cannot be null or undefined');
    const notStringErorr = new Error('Passed id should be of type string');

    it('Should reject if the id is null', async () => {
      expect.assertions(1);

      // attempt to gather a null feedback should error.
      await expect(firebaseWrapper.getFeedback(null)).rejects.toEqual(nullError);
    });

    it('Should reject if the id is not a string', async () => {
      expect.assertions(3);

      // attempt to gather a non-string feedback should error.
      await expect(firebaseWrapper.getFeedback(false)).rejects.toEqual(notStringErorr);
      await expect(firebaseWrapper.getFeedback({ cat: 'dog' })).rejects.toEqual(notStringErorr);
      await expect(firebaseWrapper.getFeedback(['id'])).rejects.toEqual(notStringErorr);
    });

    it('Should return the valid feedback by the id', async () => {
      expect.assertions();

      // first create some feedback for the second user, when we regather we can validate that the
      // feedback is all correct and what we should expect it ot be.
      const userTwoFeedback = await firebaseWrapper.getFeedback(userTwoId);

      const feedbackOne = await firebaseWrapper.addFeedback(userOneId, userTwoId, 'feedback one');
      const feedbackOneUpdate = await firebaseWrapper.getFeedback(userTwoId);

      // validate that the new feedback size has increased and the feedback exists.
      expect(_.size(feedbackOneUpdate)).toEqual(_.size(userTwoFeedback) + 1);
      expect(_.isNil(feedbackOneUpdate[feedbackOne])).toBeFalsy();

      // validate that the message and id is what we expect it all to be.
      expect(feedbackOneUpdate[feedbackOne].message).toEqual('feedback one');
      expect(feedbackOneUpdate[feedbackOne].feedbacker.id).toEqual(userOneId);
    });
  });

  describe('getFeedbackReference', async () => {
    it('Should return a valid reference to the feedback for the current user', () => {
      // gather the reference, gather the data, validaste that its not null.
      const feedbackReference = firebaseWrapper.getFeedbackReference();
      expect(_.isNil(feedbackReference)).toBeFalsy();
    });
  });

  describe('getActiveWalkers', async () => {
    it('should return a object of all active users', async () => {
      expect.assertions(3);

      // the current users id.
      const currentUserId = firebaseWrapper.getUid();

      // gather the current active and validate that the current user does not exist in this list.
      const curerntActive = await firebaseWrapper.getActiveWalkers();

      // validate that the active exists but the current user is null
      expect(_.isNil(curerntActive)).toBeFalsy();
      expect(_.isNil(curerntActive[currentUserId])).toBeTruthy();

      let allActive = true;

      _.forEach(curerntActive, (e) => {
        if (!e.profile.walk.active) allActive = false;
      });

      // valiate all are active.
      expect(allActive).toBeTruthy();
    });
  });

  describe('getActiveWalkersKeys', async () => {
    it('Should return a valid list of all active users keys', async () => {
      expect.assertions(1);

      // get the current active walkers list
      const activeWalkers = await firebaseWrapper.getActiveWalkers();

      // now we can get the active walkers keys, validating that all the active keys exist in the
      // active walkers list. Both tests go hand in hand to make sure that they are all valid.
      const activeWalkersKeys = await firebaseWrapper.getActiveWalkersKeys();
      let validKeys = true;

      _.forEach(activeWalkersKeys, (key) => {
        if (_.isNil(activeWalkers[key])) validKeys = false;
      });

      // if all keys exist, then it should be true and not false.
      expect(validKeys).toBeTruthy();
    });
  });

  describe('addDog', async () => {
    // Get all add dog related errors messages for help with writting cleaner test code.
    const errorDogName = new Error("Dog name cannot be empty and must be a string");
    const errorDogAge = new Error('Dog age cannot be empty and must be a number');
    const errorDogRace = new Error('Dog race cannot be empty and must be a string');
    const errorDogFavoriteToy = new Error('Dogs favorite toy cannot be empty and must be a string');
    const errorDogFavoriteFood = new Error('Dogs favorite food cannot be empty and must be a string');

    it('Should reject if the name of dog is invalid', async () => {
      expect.assertions(4);

      // It should reject all non-string values passed to the function addDog (parameter: dogName)
      await expect(firebaseWrapper.addDog(1, 1, "Doberman", "Ball", "Pizza")).rejects.toEqual(errorDogName);
      await expect(firebaseWrapper.addDog(true, 1, "Doberman", "Ball", "Pizza")).rejects.toEqual(errorDogName);
      await expect(firebaseWrapper.addDog(0.1, 1, "Doberman", "Ball", "Pizza")).rejects.toEqual(errorDogName);
      await expect(firebaseWrapper.addDog(["Maria"], 1, "Doberman", "Ball", "Pizza")).rejects.toEqual(errorDogName);
    });

    it('Shoud reject if the age of dog is invalid', async () => {
      expect.assertions(3);

      // It should reject all non-numeric values passed to the function addDog (parameter: dogAge)
      await expect(firebaseWrapper.addDog("Lara", "1", "Doberman", "Ball", "Pizza")).rejects.toEqual(errorDogAge);
      await expect(firebaseWrapper.addDog("Lara", [1], "Doberman", "Ball", "Pizza")).rejects.toEqual(errorDogAge);
      await expect(firebaseWrapper.addDog("Lara", false, "Doberman", "Ball", "Pizza")).rejects.toEqual(errorDogAge);
    });

    it('Shoud reject if the race of dog is invalid', async () => {
      expect.assertions(3);

      // It should reject all non-string values passed to the function addDog (parameter: dogRace)
      await expect(firebaseWrapper.addDog("Lara", 1, 5, "Ball", "Pizza")).rejects.toEqual(errorDogRace);
      await expect(firebaseWrapper.addDog("Lara", 1, false, "Ball", "Pizza")).rejects.toEqual(errorDogRace);
      await expect(firebaseWrapper.addDog("Lara", 1, ["Doberman"], "Ball", "Pizza")).rejects.toEqual(errorDogRace);
    });

    it('Shoud reject if the favorite toy of dog is invalid', async () => {
      expect.assertions(3);

      // It should reject all non-string values passed to the function addDog (parameter: dogFavoriteToy)
      await expect(firebaseWrapper.addDog("Lara", 1, "Doberman", ["Ball"], "Pizza")).rejects.toEqual(errorDogFavoriteToy);
      await expect(firebaseWrapper.addDog("Lara", 1, "Doberman", false, "Pizza")).rejects.toEqual(errorDogFavoriteToy);
      await expect(firebaseWrapper.addDog("Lara", 1, "Doberman", 9, "Pizza")).rejects.toEqual(errorDogFavoriteToy);
    });

    it('Shoud reject if the favorite toy of dog is invalid', async () => {
      expect.assertions(3);

      // It should reject all non-string values passed to the function addDog (parameter: dogFavoriteFood)
      await expect(firebaseWrapper.addDog("Lara", 1, "Doberman", "Ball", ["Pizza"])).rejects.toEqual(errorDogFavoriteFood);
      await expect(firebaseWrapper.addDog("Lara", 1, "Doberman", "Ball", true)).rejects.toEqual(errorDogFavoriteFood);
      await expect(firebaseWrapper.addDog("Lara", 1, "Doberman", "Ball", 1)).rejects.toEqual(errorDogFavoriteFood);
    });

    /**
     * When the dog is created we must ensure that we are getting back to the key, this is
     * the key we will be using to reference the dog. This would be used for the removing
     * of dog as well. / single gathering.
     */
    it('Should should return the dog key if the dog has been created', async () => {
      expect.assertions(1);

      const dog = await firebaseWrapper.addDog("Lara", 1, "Doberman", "Ball", "Pizza");
      expect(typeof dog).toBe('string');
    });
  });

  describe('getAllDogs', async () => {
    // get all dogs related error messages for help with writting cleaner test code.
    const dogOwnerIdError = new Error('Dog owner id cannot be a valid non-empty string');

    it('Should reject if the dogOwnerId is not a valid string', async () => {
      expect.assertions(4);

      // we should not be allowing non string related dogOwnerIds.
      await expect(firebaseWrapper.getAllDogs({ dog: 1 })).rejects.toEqual(dogOwnerIdError);
      await expect(firebaseWrapper.getAllDogs(false)).rejects.toEqual(dogOwnerIdError);
      await expect(firebaseWrapper.getAllDogs(['dog'])).rejects.toEqual(dogOwnerIdError);
      await expect(firebaseWrapper.getAllDogs(() => false)).rejects.toEqual(dogOwnerIdError);
    });

    it('Should reject if the dogOwnerId is null', async () => {
      expect.assertions(1);

      // we should not be allowing undefined values.
      await expect(firebaseWrapper.getAllDogs(null)).rejects.toEqual(dogOwnerIdError);
    });

    it('Should return a valid list of dogs when called with a valid dog owner id', async () => {
      expect.assertions(3);

      // first we need to add a couple of dogs, get those dogs ids and validate that they correctly
      // exist within the newly gathered list of dogs.
      const beforeDogs = await firebaseWrapper.getAllDogs(userOneId);
      const beforeDogsCount = _.size(beforeDogs);

      // add two dogs, these ids will be used to validate that they exist in the regathered list of
      // dogs. If they don't exist it will fail, and it will fail if the count is not correct.
      const dogOne = await firebaseWrapper.addDog('name', 5, 'race', 'toy', 'food');
      const dogTwo = await firebaseWrapper.addDog('name', 5, 'race', 'toy', 'food');

      // get the updated amount of dogs and count.
      const afterDogs = await firebaseWrapper.getAllDogs(userOneId);
      const afterDogsCount = _.size(afterDogs);

      // get the keys, so we can validate that they exist.
      const afterKeys = Object.keys(afterDogs);

      // validate the dog coutn is correct and the dogs exist.
      expect(afterDogsCount).toEqual(beforeDogsCount + 2);
      expect(afterKeys.includes(dogOne)).toBeTruthy();
      expect(afterKeys.includes(dogTwo)).toBeTruthy();
    });
  });

  describe('getSingleDog', async () => {
    // get single dog related error messages for help with writting cleaner test code.
    const dogOwnerIdError = new Error('Dog owner id cannot be a valid non-empty string');
    const dogIdError = new Error('Dog id cannot be a valid non-empty string');

    it('Should reject if the dogOwnerId is not a valid string', async () => {
      expect.assertions(4);

      // we should not be allowing non string related dogOwnerIds.
      await expect(firebaseWrapper.getSingleDog({ dog: 1 }, 'dogid')).rejects.toEqual(dogOwnerIdError);
      await expect(firebaseWrapper.getSingleDog(false, 'dogid')).rejects.toEqual(dogOwnerIdError);
      await expect(firebaseWrapper.getSingleDog(['dog'], 'dogid')).rejects.toEqual(dogOwnerIdError);
      await expect(firebaseWrapper.getSingleDog(() => false, 'dogid')).rejects.toEqual(dogOwnerIdError);
    });

    it('Should reject if the dogOwnerId is null', async () => {
      expect.assertions(1);

      // we should not be allowing undefined values.
      await expect(firebaseWrapper.getSingleDog(null, 'dogid')).rejects.toEqual(dogOwnerIdError);
    });

    it('Should reject if the dogId is not a valid string', async () => {
      expect.assertions(4);

      // we should not be allowing non string related dogIds.
      await expect(firebaseWrapper.getSingleDog('dogOwnerId', { dog: 1 })).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.getSingleDog('dogOwnerId', false)).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.getSingleDog('dogOwnerId', ['dog'])).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.getSingleDog('dogOwnerId', () => false)).rejects.toEqual(dogIdError);
    });

    it('Should reject if the dogId is undefined, null or empty', async () => {
      expect.assertions(4);

      // we should not be allowing undefined values.
      await expect(firebaseWrapper.getSingleDog('dogOwnerId', undefined)).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.getSingleDog('dogOwnerId', null)).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.getSingleDog('dogOwnerId', '')).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.getSingleDog('dogOwnerId', '  ')).rejects.toEqual(dogIdError);
    });

    it('Should return a valid dog when called with a valid dog owner id and dog id', async () => {
      expect.assertions(4);

      // first lets add this dog, we can then use the id of the created dog to regather and validate that the dog correctly exists.
      const dogObject = {
        name: 'name',
        age: 10,
        race: 'doggy',
        favoriteToy: 'toy',
        favoriteFood: 'food'
      };

      // create the dog.
      const createdDog = await firebaseWrapper.addDog(
        dogObject.name,
        dogObject.age,
        dogObject.race,
        dogObject.favoriteToy,
        dogObject.favoriteFood
      );

      // validate that the created dog object is not null. Should be a valid string
      expect(_.isNil(createdDog)).toBeFalsy();
      expect(_.isString(createdDog)).toBeTruthy();

      // lets validate that we can now regather that dog and it matches correctly. Also deleting any
      // timestamp so it does a equal compare with the content and not including the time stamp.
      const regatheredDog = await firebaseWrapper.getSingleDog(userOneId, createdDog);
      delete regatheredDog.timestamp;

      expect(_.isNil(regatheredDog)).toBeFalsy();
      expect(regatheredDog).toEqual(dogObject);
    });
  });

  describe('removeDog', async () => {
    // get single dog related error messages for help with writting cleaner test code.
    const dogOwnerIdError = new Error('Dog owner id cannot be a valid non-empty string');
    const dogIdError = new Error('Dog id cannot be a valid non-empty string');

    it('Should reject if the dogOwnerId is not a valid string', async () => {
      expect.assertions(4);

      // we should not be allowing non string related dogOwnerIds.
      await expect(firebaseWrapper.removeDog({ dog: 1 }, 'dogid')).rejects.toEqual(dogOwnerIdError);
      await expect(firebaseWrapper.removeDog(false, 'dogid')).rejects.toEqual(dogOwnerIdError);
      await expect(firebaseWrapper.removeDog(['dog'], 'dogid')).rejects.toEqual(dogOwnerIdError);
      await expect(firebaseWrapper.removeDog(() => false, 'dogid')).rejects.toEqual(dogOwnerIdError);
    });

    it('Should reject if the dogOwnerId is null', async () => {
      expect.assertions(1);

      // we should not be allowing null values.
      await expect(firebaseWrapper.removeDog(null, 'dogid')).rejects.toEqual(dogOwnerIdError);
    });

    it('Should reject if the dogId is not a valid string', async () => {
      expect.assertions(4);

      // we should not be allowing non string related dogIds.
      await expect(firebaseWrapper.removeDog('dogOwnerId', { dog: 1 })).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.removeDog('dogOwnerId', false)).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.removeDog('dogOwnerId', ['dog'])).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.removeDog('dogOwnerId', () => false)).rejects.toEqual(dogIdError);
    });

    it('Should reject if the dogId is undefined, null or empty', async () => {
      expect.assertions(4);

      // we should not be allowing undefined values.
      await expect(firebaseWrapper.removeDog('dogOwnerId', undefined)).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.removeDog('dogOwnerId', null)).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.removeDog('dogOwnerId', '')).rejects.toEqual(dogIdError);
      await expect(firebaseWrapper.removeDog('dogOwnerId', '  ')).rejects.toEqual(dogIdError);
    });

    it('Should remove a valid dog when called with a valid dog owner id and dog id', async () => {
      expect.assertions(5);

      const dogOne = await firebaseWrapper.addDog('name', 5, 'race', 'toy', 'food');
      const dogTwo = await firebaseWrapper.addDog('name', 5, 'race', 'toy', 'food');

      const beforeDogs = await firebaseWrapper.getAllDogs(userOneId);
      const beforeDogsCount = _.size(beforeDogs);

      expect(Object.keys(beforeDogs).includes(dogOne)).toBeTruthy();
      expect(Object.keys(beforeDogs).includes(dogTwo)).toBeTruthy();

      // lets remove the two dogs.
      await firebaseWrapper.removeDog(userOneId, dogOne);
      await firebaseWrapper.removeDog(userOneId, dogTwo);

      // get the updated amount of dogs and count.
      const afterDogs = await firebaseWrapper.getAllDogs(userOneId);
      const afterDogsCount = _.size(afterDogs);

      // get the keys, so we can validate that they exist.
      const afterKeys = Object.keys(afterDogs);

      // validate the dog coutn is correct and the dogs exist.
      expect(afterDogsCount).toEqual(beforeDogsCount - 2);
      expect(afterKeys.includes(dogOne)).toBeFalsy();
      expect(afterKeys.includes(dogTwo)).toBeFalsy();
    });
  });

  describe('addAddress', async () => {
    // testing and making sure for all properties of the address, that if anyone of the values are
    // not strings then they should be fully rejected, we dont want any addresses being added if
    // they are not complete strings.
    it('Should reject if any property is not a string', async () => {
      expect.assertions(5);

      let addressOne = {
        lineOne: ['lineOne'],
        city: 'city',
        state: 'state',
        zip: 'zip',
        country: 'country'
      };

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`lineOne cannot be null, undefined or not a string`)
      );

      addressOne.lineOne = 'LineOne';
      addressOne.city = ['city'];

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`city cannot be null, undefined or not a string`)
      );

      addressOne.city = 'city';
      addressOne.state = ['state'];

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`state cannot be null, undefined or not a string`)
      );

      addressOne.state = 'state';
      addressOne.zip = ['zip'];

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`zip cannot be null, undefined or not a string`)
      );

      addressOne.zip = 'zip';
      addressOne.country = ['country'];

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`country cannot be null, undefined or not a string`)
      );
    });

    // testing and making sure for all properties of the address, that if anyone of the values are
    // not defined then they should be fully rejected, we dont want any addresses being added if
    // they are not complete defined.
    it('Should reject if any property is null or undefined', async () => {
      expect.assertions(5);

      let addressOne = {
        lineOne: null,
        city: 'city',
        state: 'state',
        zip: 'zip',
        country: 'country'
      };

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`lineOne cannot be null, undefined or not a string`)
      );

      addressOne.lineOne = 'LineOne';
      addressOne.city = null;

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`city cannot be null, undefined or not a string`)
      );

      addressOne.city = 'city';
      addressOne.state = null;

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`state cannot be null, undefined or not a string`)
      );

      addressOne.state = 'state';
      addressOne.zip = null;

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`zip cannot be null, undefined or not a string`)
      );

      addressOne.zip = 'zip';
      addressOne.country = null;

      await expect(firebaseWrapper.addAddress(addressOne)).rejects.toEqual(
        new Error(`country cannot be null, undefined or not a string`)
      );
    });

    it('Should add a new address if all properties are valid', async () => {
      expect.assertions(5);

      // create the address for the authenticated user with a basic address, easily testable when we
      // reather the address.
      const createdAddress = await firebaseWrapper.addAddress({
        lineOne: 'lineOne',
        city: 'city',
        state: 'state',
        zip: 'zip',
        country: 'country'
      });

      // Creating a address gets the address key, we can then regather that address and validate
      // that all the information went in correctly
      const regatheredAddress = await firebaseWrapper.getAddressByKey(createdAddress);

      expect(regatheredAddress.lineOne).toEqual('lineOne');
      expect(regatheredAddress.city).toEqual('city');
      expect(regatheredAddress.state).toEqual('state');
      expect(regatheredAddress.zip).toEqual('zip');
      expect(regatheredAddress.country).toEqual('country');
    });
  });

  describe('getAddress', async () => {
    // the related error to get address, used thoughout the testing process to have a simplier and
    // easier to read testing process.
    const nullStringError = new Error('Address key must not be empty and must be a valid string');

    it('Should reject if the address key is not a string', async () => {
      expect.assertions(3);

      // validate that any other type that can be used for gathering a address is rejected by the
      // function, we don't want any other invalid data being added into the database.
      await expect(firebaseWrapper.getAddressByKey(['addressOne'])).rejects.toEqual(nullStringError);
      await expect(firebaseWrapper.getAddressByKey(false)).rejects.toEqual(nullStringError);
      await expect(firebaseWrapper.getAddressByKey({ name: 'empty' })).rejects.toEqual(nullStringError);
    });

    it('Should reject if the address key is null or undefined', async () => {
      expect.assertions(2);

      // testing both cases that the get address does not accept null or undefined values.
      await expect(firebaseWrapper.getAddressByKey(null)).rejects.toEqual(nullStringError);
      await expect(firebaseWrapper.getAddressByKey(undefined)).rejects.toEqual(nullStringError);
    });

    it('Should return a valid address object if a correct id is used', async () => {
      expect.assertions(1);

      // first create a new address and gather / validate it correctly exists.
      const createdAddress = await firebaseWrapper.addAddress({
        lineOne: 'lineOne',
        city: 'city',
        state: 'state',
        zip: 'zip',
        country: 'country'
      });

      const allAddresses = await firebaseWrapper.getAddresses();
      const keys = Object.keys(allAddresses);

      // validate that the array of keys of all the addresses contains the created key.
      expect(keys.includes(createdAddress)).toEqual(true);
    });
  });

  describe('removeAddress', async () => {
    // the related error to get address, used thoughout the testing process to have a simplier and
    // easier to read testing process.
    const nullStringError = new Error('Address key must not be empty and must be a valid string');

    it('Should reject if the address key is not a string', async () => {
      expect.assertions(3);

      // validate that any other type that can be used for gathering a address is rejected by the
      // function, we don't want any other invalid data being added into the database.
      await expect(firebaseWrapper.removeAddress(['addressOne'])).rejects.toEqual(nullStringError);
      await expect(firebaseWrapper.removeAddress(false)).rejects.toEqual(nullStringError);
      await expect(firebaseWrapper.removeAddress({ name: 'empty' })).rejects.toEqual(nullStringError);
    });

    it('Should reject if the address key is null or undefined', async () => {
      expect.assertions(2);

      // testing both cases that the get address does not accept null or undefined values.
      await expect(firebaseWrapper.removeAddress(null)).rejects.toEqual(nullStringError);
      await expect(firebaseWrapper.removeAddress(undefined)).rejects.toEqual(nullStringError);
    });

    it('Should remove a valid address object if a correct id is used', async () => {
      expect.assertions(2);

      // first we must create a address, this address will be the one is removed, but first we will
      // have to validate that it exists and then validate that the move excatly has removed.
      // first create a new address and gather / validate it correctly exists.
      const createdAddress = await firebaseWrapper.addAddress({
        lineOne: 'lineOne',
        city: 'city',
        state: 'state',
        zip: 'zip',
        country: 'country'
      });

      const allAddresses = await firebaseWrapper.getAddresses();
      const keys = Object.keys(allAddresses);

      // validate that the array of keys of all the addresses contains the created key.
      expect(keys.includes(createdAddress)).toEqual(true);

      // now remove the address and validate now that the address has been fully removed.
      await firebaseWrapper.removeAddress(createdAddress);

      // updated addresses since we have removed the last one.
      const updatedAddresses = await firebaseWrapper.getAddresses();
      const updatedKeys = Object.keys(updatedAddresses);

      // validate that its now gone.
      expect(updatedKeys.includes(createdAddress)).toEqual(false);
    });
  });

  describe('getAddresses', async () => {
    it('Should return a empty object if no addresses exist', async () => {
      expect.assertions(2);

      // first lets remove all the current addresses, then we can validate that it returns a empty object.
      await firebaseWrapper.database.ref(`users/${firebaseWrapper.getUid()}/profile/addresses`).remove();

      // gather all the addresses and validate that its empty.
      const allEmptyAddresses = await firebaseWrapper.getAddresses();
      expect(_.size(allEmptyAddresses)).toEqual(0);

      // now add a new address and validate that the address size increases.
      await firebaseWrapper.addAddress({ lineOne: '', city: '', state: '', zip: '', country: '' });
      const updatedAddresses = await firebaseWrapper.getAddresses();

      // validate that the size has now increased.
      expect(_.size(updatedAddresses)).toEqual(1);
    });

    it('Should return a valid array of all the existing addresses', async () => {
      expect.assertions(3);

      // get the current addresses and the current size.
      const allAddresses = await firebaseWrapper.getAddresses();
      const currentAmount = _.size(allAddresses);

      // add a couple of addresses which we can then use to validate that they exist.
      const a = await firebaseWrapper.addAddress({ lineOne: '', city: '', state: '', zip: '', country: '' });
      const b = await firebaseWrapper.addAddress({ lineOne: '', city: '', state: '', zip: '', country: '' });

      // get the updated list so we can validate that they exist.
      const updatedAddresses = await firebaseWrapper.getAddresses();
      expect(_.size(updatedAddresses)).toEqual(currentAmount + 2);

      // validate that the size of the addresses has increased by two and that the content is all correct.
      expect(updatedAddresses[a]).toEqual({ lineOne: '', city: '', state: '', zip: '', country: '' });
      expect(updatedAddresses[b]).toEqual({ lineOne: '', city: '', state: '', zip: '', country: '' });
    });
  });

  describe('createWalkRequest', async () => {
    // the generic error related for the create walk request, this error can and will occure when
    // the ids are not valid for firebase, making sure that they are valid firebase ids are
    // required.
    const createWalKIdError = new Error('required ids cannot be null or a invalid/empty string');
    const createWalkValidArray = new Error('owner dog ids must be a valid array');
    const loc = { lat: 1, lng: 1 };

    // short hand create walk for smaller tests for easier readablility.
    const createWalk = firebaseWrapper.createWalkRequest.bind(firebaseWrapper);

    it('Should reject if the walk id is null or undefined', async () => {
      expect.assertions(2);

      // the two possible requests for null and undefined (not awaited so it will just return a promise)
      const nullRequest = createWalk(null, 'owner', ['dog'], new Date(), new Date(), loc, 'notes');
      const undefinedRequest = createWalk(undefined, 'owner', ['dog'], new Date(), new Date(), loc, 'notes');

      await expect(nullRequest).rejects.toEqual(createWalKIdError);
      await expect(undefinedRequest).rejects.toEqual(createWalKIdError);
    });

    it('Should reject if the walk id is not a string', async () => {
      expect.assertions(4);

      // the four possible requests for non string values (not awaited so it will just return a promise)
      const requestArray = createWalk([], 'owner', ['dog'], new Date(), new Date(), loc, 'notes');
      const requestBool = createWalk(false, 'owner', ['dog'], new Date(), new Date(), loc, 'notes');
      const requestObject = createWalk({ walk: 5 }, 'owner', ['dog'], new Date(), new Date(), loc, 'notes');
      const requestNum = createWalk(5, 'owner', ['dog'], new Date(), new Date(), loc, 'notes');

      await expect(requestArray).rejects.toEqual(createWalKIdError);
      await expect(requestBool).rejects.toEqual(createWalKIdError);
      await expect(requestObject).rejects.toEqual(createWalKIdError);
      await expect(requestNum).rejects.toEqual(createWalKIdError);
    });

    it('Should reject if the walk id is a empty string', async () => {
      expect.assertions(1);

      // the single possible requests for a non empty string (not awaited so it will just return a promise)
      const requestNotEmpty = createWalk('    ', 'owner', ['dog'], new Date(), new Date(), loc, 'notes');
      await expect(requestNotEmpty).rejects.toEqual(createWalKIdError);
    });

    it('Should reject if the owner id is null or undefined', async () => {
      expect.assertions(2);

      // the two possible requests for null and undefined (not awaited so it will just return a promise)
      const nullRequest = createWalk('walk', null, ['dog'], new Date(), new Date(), loc, 'notes');
      const undefinedRequest = createWalk('walk', undefined, ['dog'], new Date(), new Date(), loc, 'notes');

      await expect(nullRequest).rejects.toEqual(createWalKIdError);
      await expect(undefinedRequest).rejects.toEqual(createWalKIdError);
    });

    it('Should reject if the owner id is not a string', async () => {
      expect.assertions(4);

      // the four possible requests for non string values (not awaited so it will just return a promise)
      const requestArray = createWalk('walk', [], ['dog'], new Date(), new Date(), loc, 'notes');
      const requestBool = createWalk('walk', false, ['dog'], new Date(), new Date(), loc, 'notes');
      const requestObject = createWalk('walk', { walk: 5 }, ['dog'], new Date(), new Date(), loc, 'notes');
      const requestNum = createWalk('walk', 5, ['dog'], new Date(), new Date(), loc, 'notes');

      await expect(requestArray).rejects.toEqual(createWalKIdError);
      await expect(requestBool).rejects.toEqual(createWalKIdError);
      await expect(requestObject).rejects.toEqual(createWalKIdError);
      await expect(requestNum).rejects.toEqual(createWalKIdError);
    });

    it('Should reject if the owner id is a empty string', async () => {
      expect.assertions(1);

      // the single possible requests for a non empty string (not awaited so it will just return a promise)
      const requestNotEmpty = createWalk('walk', '    ', ['dog'], new Date(), new Date(), loc, 'notes');
      await expect(requestNotEmpty).rejects.toEqual(createWalKIdError);
    });

    it('Should reject if the owner dog ids is null or undefined', async () => {
      expect.assertions(2);

      // the two possible requests for null and undefined (not awaited so it will just return a promise)
      const nullRequest = createWalk('walk', 'owner', null, new Date(), new Date(), loc, 'notes');
      const undefinedRequest = createWalk('walk', 'owner', undefined, new Date(), new Date(), loc, 'notes');

      await expect(nullRequest).rejects.toEqual(createWalkValidArray);
      await expect(undefinedRequest).rejects.toEqual(createWalkValidArray);
    });

    it('Should reject if the owner dog ids is not a string', async () => {
      expect.assertions(3);

      // the three possible requests for non string values (not awaited so it will just return a promise)
      const requestBool = createWalk('walk', 'owner', false, new Date(), new Date(), loc, 'notes');
      const requestObject = createWalk('walk', 'owner', { walk: 5 }, new Date(), new Date(), loc, 'notes');
      const requestNum = createWalk('walk', 'owner', 5, new Date(), new Date(), loc, 'notes');

      await expect(requestBool).rejects.toEqual(createWalkValidArray);
      await expect(requestObject).rejects.toEqual(createWalkValidArray);
      await expect(requestNum).rejects.toEqual(createWalkValidArray);
    });

    it('Should reject if the owner dog ids is not a valid array of strings', async () => {
      expect.assertions(1);

      // the single possible requests for a non empty string (not awaited so it will just return a promise)
      const requestNotEmpty = createWalk('w', 'o', ['dog', null], new Date(), new Date(), loc, 'notes');
      await expect(requestNotEmpty).rejects.toEqual(createWalKIdError);
    });

    it('Should reject if the start date time is not a date time value', async () => {
      expect.assertions(1);

      // validate that if and when the datetime inputs are not a correct date time input,then it should be fully rejected.
      const dateTimeError = new Error('start date time and end date time must be date time objects.');
      const dateTimeRequest = createWalk('walk', 'owner', ['dog'], 'date', new Date(), loc, 'notes');
      await expect(dateTimeRequest).rejects.toEqual(dateTimeError);
    });

    it('Should reject if the end date time is not a date time value', async () => {
      expect.assertions(1);

      // validate that if and when the datetime inputs are not a correct date time input,then it should be fully rejected.
      const dateTimeError = new Error('start date time and end date time must be date time objects.');
      const dateTimeRequest = createWalk('walk', 'owner', ['dog'], new Date(), 'date', loc, 'notes');
      await expect(dateTimeRequest).rejects.toEqual(dateTimeError);
    });

    it('Should reject if the location is a non empty string', async () => {
      expect.assertions(1);

      // the related error expected to be thrown when the method is called badly.
      const locationError = new Error('location cannot be null and must contain lat and long');

      // validation and checking that the location parameter is correctly rejected.
      const locationRequest = createWalk('w', 'o', ['dog'], new Date(), new Date(), '     ', 'notes');
      await expect(locationRequest).rejects.toEqual(locationError);
    });

    it('Should reject if the location is not a object with lat and lng', async () => {
      expect.assertions(2);

      // the related error expected to be thrown when the method is called badly.
      const locationError = new Error('location cannot be null and must contain lat and long');

      // validation and checking that the location parameter is correctly rejected.
      const locationRequestBool = createWalk('w', 'o', ['dog'], new Date(), new Date(), false, 'notes');
      const locationRequestArray = createWalk('w', 'o', ['dog'], new Date(), new Date(), ['string'], 'notes');

      await expect(locationRequestBool).rejects.toEqual(locationError);
      await expect(locationRequestArray).rejects.toEqual(locationError);
    });

    it('Should reject non string note if notes are set', async () => {
      expect.assertions(3);

      // the related error expected to be thrown when the method is called badly.
      const noteError = new Error('if notes are set, they cannot be a invalid/empty string');

      // validation and checking that the notes parameter is correctly rejected.
      const loc = { lat: 1, lng: 1 };

      const notesRequestArray = createWalk('w', 'o', ['dog'], new Date(), new Date(), loc, ['notes']);
      const notesRequestBool = createWalk('w', 'o', ['dog'], new Date(), new Date(), loc, false);
      const notesRequestNum = createWalk('w', 'o', ['dog'], new Date(), new Date(), loc, 5);

      await expect(notesRequestArray).rejects.toEqual(noteError);
      await expect(notesRequestBool).rejects.toEqual(noteError);
      await expect(notesRequestNum).rejects.toEqual(noteError);
    });

    it('Should reject empty string notes', async () => {
      expect.assertions(1);

      // the related error expected to be thrown when the method is called badly.
      const noteError = new Error('if notes are set, they cannot be a invalid/empty string');

      // validation and checking that the notes parameter is correctly rejected.
      const notesRequest = createWalk('w', 'o', ['dog'], new Date(), new Date(), loc, '   ');
      await expect(notesRequest).rejects.toEqual(noteError);
    });

    it('Should create a valid walk request for a given user if all properties are correct', async () => {
      // when the rquest process is complete, both users should have a reference to the walk request
      // inserted into the users walk section, directing them to a walk request object related to
      // the given id. This is done instead of keeping two copies for any user.  We must validate
      // that the id exists for both users and that the content of the walk request that was
      // generated matches the parameters that was specified.
      expect.assertions(8);

      // current date used for the date properties for the testing process.
      const insertD = new Date();
      const walkRequestId = await createWalk(userTwoId, userOneId, ['d'], insertD, insertD, loc, 'N/A');

      // lets first validate the the walkRequestId back is valid, this should at least show that the
      // id was created within firebase.
      expect(_.isNil(walkRequestId)).toEqual(false);
      expect(_.isString(walkRequestId)).toEqual(true);

      // regather the walk object, this will then be used to validate that all the properties have
      // been created correctly.
      const walkObject = await firebaseWrapper.getWalkByKey(walkRequestId);

      // validating that all the properties we are expecting exists.
      expect(walkObject.walker).toEqual(userTwoId);
      expect(walkObject.owner).toEqual(userOneId);
      expect(walkObject.dogs).toEqual(['d']);
      expect(walkObject.location).toEqual(loc);
      expect(walkObject.notes.includes('N/A')).toEqual(true);
      expect(walkObject.status).toEqual(firebaseConstants.WALK_STATUS.PENDING);
    });

    it('Should push the related walk id for the given walker and owner', async () => {
      // first the creation process needs to take place to get the related id, this id will be used
      // to validate that the id exists within the  two users. Both users need to have a reference
      // to this id otherwise there is no way for each user to see there owned and walking walks.
      const insertD = new Date();
      const walkRequestId = await createWalk(userTwoId, userOneId, ['d'], insertD, insertD, loc, 'N/A');

      const ownerKeys = await firebaseWrapper.getAllWalkKeys(userTwoId);
      const walkerKeys = await firebaseWrapper.getAllWalkKeys(userOneId);

      // both walker and owner should have references to the walk objects
      expect(Object.values(ownerKeys).includes(walkRequestId)).toEqual(true);
      expect(Object.values(walkerKeys).includes(walkRequestId)).toEqual(true);
    });
  });

  describe('acceptWalkRequest', async () => {
    // short hand create walk for smaller tests for easier readablility.
    const createWalk = firebaseWrapper.createWalkRequest.bind(firebaseWrapper);
    const loc = { lat: 1, lng: 1 };

    it('Should reject if the accepter or walk request ids are not valid', async () => {
      expect.assertions(11);

      // the two possible related errors that can occure if the request or accepter id is not valid.
      const requestError = new Error('walk request id cannot be null or a invalid/empty string');
      const accepterError = new Error('accepter id cannot be null or a invalid/empty string');

      // short hand accept for cleaner testing.
      const accept = firebaseWrapper.acceptWalkRequest.bind(firebaseWrapper);

      // validate the common cases related to invalid value inputs.
      // accepter id does not validate for undefined due to it being replaced with the current
      // authenticated user if the value is undefined (using default params).
      await expect(accept(null, 'reqid', 'notes')).rejects.toEqual(accepterError);
      await expect(accept(['value'], 'reqid', 'notes')).rejects.toEqual(accepterError);
      await expect(accept(false, 'reqid', 'notes')).rejects.toEqual(accepterError);
      await expect(accept(5, 'reqid', 'notes')).rejects.toEqual(accepterError);
      await expect(accept('    ', 'reqid', 'notes')).rejects.toEqual(accepterError);

      await expect(accept('acept', null, 'notes')).rejects.toEqual(requestError);
      await expect(accept('acept', undefined, 'notes')).rejects.toEqual(requestError);
      await expect(accept('acept', ['value'], 'notes')).rejects.toEqual(requestError);
      await expect(accept('acept', false, 'notes')).rejects.toEqual(requestError);
      await expect(accept('acept', 5, 'notes')).rejects.toEqual(requestError);
      await expect(accept('acept', '    ', 'notes')).rejects.toEqual(requestError);
    });

    it('Should reject if notes are set that they are not null, invalid or not a string', async () => {
      expect.assertions(3);

      // the related error expected to be thrown when the method is called badly.
      const noteError = new Error('if notes are set, they cannot be a invalid/empty string');

      // short hand accept for cleaner testing.
      const accept = firebaseWrapper.acceptWalkRequest.bind(firebaseWrapper);

      // validation and checking that the notes parameter is correctly rejected.
      const notesAcceptArray = accept('acept', 'walkId', ['notes']);
      const notesAcceptBool = accept('acept', 'walkId', false);
      const notesAcceptNum = accept('acept', 'walkId', 5);

      await expect(notesAcceptArray).rejects.toEqual(noteError);
      await expect(notesAcceptBool).rejects.toEqual(noteError);
      await expect(notesAcceptNum).rejects.toEqual(noteError);
    });

    it('Should reject if the accepter is the same as the owner', async () => {
      expect.assertions(1);

      // first lets create the walk, the walk request id can then be used to regather and accept the
      // walk request, ensuring that its not being accepted due to the ownership limitation.
      const inDate = new Date();
      const acceptWalk = await createWalk(userTwoId, userOneId, ['d'], inDate, inDate, loc, 'N/A');

      // the error that is expected to occure when accepting a walk as the given owner of the dog.
      const ownerError = new Error('You cannot accept a walk if you are the owner.');

      // short hand accept for cleaner testing.
      const accept = firebaseWrapper.acceptWalkRequest.bind(firebaseWrapper);
      await expect(accept(userOneId, acceptWalk, 'notes')).rejects.toEqual(ownerError);
    });

    it('Should accept the walk if all required properties are correctly set', async () => {
      expect.assertions(2);

      // first lets create the walk, the walk request id can then be used to regather and accept the
      // walk request, ensuring that its beging accepted.
      const inDate = new Date();
      const acceptWalk = await createWalk(userTwoId, userOneId, ['d'], inDate, inDate, loc, 'N/A');

      // short hand accept for cleaner testing. lets accept the walk, the accepting process does
      // not return anything so we should have to regather the walk object and validate that the
      // status and history object has been updated.
      const accept = firebaseWrapper.acceptWalkRequest.bind(firebaseWrapper);
      await accept(userTwoId, acceptWalk, 'notes');

      // rgathered walk since the accepting process has gone through.
      const updatedWalk = await firebaseWrapper.getWalkByKey(acceptWalk);

      expect(!_.isNil(updatedWalk)).toEqual(true);
      expect(updatedWalk.status).toEqual(firebaseConstants.WALK_STATUS.ACTIVE);
    });
  });

  describe('rejectWalkRequest', async () => {
    // short hand create walk for smaller tests for easier readablility.
    const createWalk = firebaseWrapper.createWalkRequest.bind(firebaseWrapper);
    const loc = { lat: 1, lng: 1 };

    it('Should reject if the rejector or walk request ids are not valid', async () => {
      expect.assertions(11);

      // the two possible related errors that can occure if the request or accepter id is not valid.
      const requestError = new Error('walk request id cannot be null or a invalid/empty string');
      const rejecterError = new Error('rejector id cannot be null or a invalid/empty string');

      // short hand accept for cleaner testing.
      const reject = firebaseWrapper.rejectWalkRequest.bind(firebaseWrapper);

      // validate the common cases related to invalid value inputs.
      // accepter id does not validate for undefined due to it being replaced with the current
      // authenticated user if the value is undefined (using default params).
      await expect(reject(null, 'reqid', 'notes')).rejects.toEqual(rejecterError);
      await expect(reject(['value'], 'reqid', 'notes')).rejects.toEqual(rejecterError);
      await expect(reject(false, 'reqid', 'notes')).rejects.toEqual(rejecterError);
      await expect(reject(5, 'reqid', 'notes')).rejects.toEqual(rejecterError);
      await expect(reject('    ', 'reqid', 'notes')).rejects.toEqual(rejecterError);

      await expect(reject('reject', null, 'notes')).rejects.toEqual(requestError);
      await expect(reject('reject', undefined, 'notes')).rejects.toEqual(requestError);
      await expect(reject('reject', ['value'], 'notes')).rejects.toEqual(requestError);
      await expect(reject('reject', false, 'notes')).rejects.toEqual(requestError);
      await expect(reject('reject', 5, 'notes')).rejects.toEqual(requestError);
      await expect(reject('reject', '    ', 'notes')).rejects.toEqual(requestError);
    });

    it('Should reject if notes are set that they are not null, invalid or not a string', async () => {
      expect.assertions(3);

      // the related error expected to be thrown when the method is called badly.
      const noteError = new Error('if notes are set, they cannot be a invalid/empty string');

      // short hand accept for cleaner testing.
      const reject = firebaseWrapper.rejectWalkRequest.bind(firebaseWrapper);

      // validation and checking that the notes parameter is correctly rejected.
      const notesRejectArray = reject('acept', 'walkId', ['notes']);
      const notesRejectBool = reject('acept', 'walkId', false);
      const notesRejectNum = reject('acept', 'walkId', 5);

      await expect(notesRejectArray).rejects.toEqual(noteError);
      await expect(notesRejectBool).rejects.toEqual(noteError);
      await expect(notesRejectNum).rejects.toEqual(noteError);
    });

    it('Should reject if the rejector is the same as the owner', async () => {
      expect.assertions(1);

      // first lets create the walk, the walk request id can then be used to regather and accept the
      // walk request, ensuring that its not being accepted due to the ownership limitation.
      const inDate = new Date();
      const acceptWalk = await createWalk(userTwoId, userOneId, ['d'], inDate, inDate, loc, 'N/A');

      // the error that is expected to occure when accepting a walk as the given owner of the dog.
      const ownerError = new Error('You cannot reject a walk if you are the owner, cancel the walk instead');

      // short hand accept for cleaner testing.
      const reject = firebaseWrapper.rejectWalkRequest.bind(firebaseWrapper);
      await expect(reject(userOneId, acceptWalk, 'notes')).rejects.toEqual(ownerError);
    });

    it('Should reject the walk if all required properties are correctly set', async () => {
      expect.assertions(2);

      // first lets create the walk, the walk request id can then be used to regather and accept the
      // walk request, ensuring that its beging accepted.
      const inDate = new Date();
      const acceptWalk = await createWalk(userTwoId, userOneId, ['d'], inDate, inDate, loc, 'N/A');

      // short hand reject for cleaner testing. lets reject the walk, the rejecting process does
      // not return anything so we should have to regather the walk object and validate that the
      // status and history object has been updated.
      const reject = firebaseWrapper.rejectWalkRequest.bind(firebaseWrapper);
      await reject(userTwoId, acceptWalk, 'notes');

      // rgathered walk since the accepting process has gone through.
      const updatedWalk = await firebaseWrapper.getWalkByKey(acceptWalk);

      expect(!_.isNil(updatedWalk)).toEqual(true);
      expect(updatedWalk.status).toEqual(firebaseConstants.WALK_STATUS.REJECTED);
    });
  });

  describe.only('cancelWalkRequest', async () => {
    // short hand create walk for smaller tests for easier readablility.
    const createWalk = firebaseWrapper.createWalkRequest.bind(firebaseWrapper);
    const loc = { lat: 1, lng: 1 };

    it('Should cancel if the cancelor or walk request ids are not valid', async () => {
      expect.assertions(11);

      // the two possible related errors that can occure if the request or accepter id is not valid.
      const requestError = new Error('walk request id cannot be null or a invalid/empty string');
      const cancelerError = new Error('cancelor id cannot be null or a invalid/empty string');

      // short hand accept for cleaner testing.
      const cancel = firebaseWrapper.cancelWalkRequest.bind(firebaseWrapper);

      // validate the common cases related to invalid value inputs.
      // accepter id does not validate for undefined due to it being replaced with the current
      // authenticated user if the value is undefined (using default params).
      await expect(cancel(null, 'reqid', 'notes')).rejects.toEqual(cancelerError);
      await expect(cancel(['value'], 'reqid', 'notes')).rejects.toEqual(cancelerError);
      await expect(cancel(false, 'reqid', 'notes')).rejects.toEqual(cancelerError);
      await expect(cancel(5, 'reqid', 'notes')).rejects.toEqual(cancelerError);
      await expect(cancel('    ', 'reqid', 'notes')).rejects.toEqual(cancelerError);

      await expect(cancel('cancel', null, 'notes')).rejects.toEqual(requestError);
      await expect(cancel('cancel', undefined, 'notes')).rejects.toEqual(requestError);
      await expect(cancel('cancel', ['value'], 'notes')).rejects.toEqual(requestError);
      await expect(cancel('cancel', false, 'notes')).rejects.toEqual(requestError);
      await expect(cancel('cancel', 5, 'notes')).rejects.toEqual(requestError);
      await expect(cancel('cancel', '    ', 'notes')).rejects.toEqual(requestError);
    });

    it('Should cancel if notes are set that they are not null, invalid or not a string', async () => {
      expect.assertions(3);

      // the related error expected to be thrown when the method is called badly.
      const noteError = new Error('if notes are set, they cannot be a invalid/empty string');

      // short hand accept for cleaner testing.
      const cancel = firebaseWrapper.cancelWalkRequest.bind(firebaseWrapper);

      // validation and checking that the notes parameter is correctly canceled.
      const notescancelArray = cancel('acept', 'walkId', ['notes']);
      const notescancelBool = cancel('acept', 'walkId', false);
      const notescancelNum = cancel('acept', 'walkId', 5);

      await expect(notescancelArray).rejects.toEqual(noteError);
      await expect(notescancelBool).rejects.toEqual(noteError);
      await expect(notescancelNum).rejects.toEqual(noteError);
    });

    it('Should cancel the walk if all required properties are correctly set', async () => {
      expect.assertions(2);

      // first lets create the walk, the walk request id can then be used to regather and accept the
      // walk request, ensuring that its beging accepted.
      const inDate = new Date();
      const acceptWalk = await createWalk(userTwoId, userOneId, ['d'], inDate, inDate, loc, 'N/A');

      // short hand cancel for cleaner testing. lets cancel the walk, the canceling process does
      // not return anything so we should have to regather the walk object and validate that the
      // status and history object has been updated.
      const cancel = firebaseWrapper.cancelWalkRequest.bind(firebaseWrapper);
      await cancel(userTwoId, acceptWalk, 'notes');

      // rgathered walk since the accepting process has gone through.
      const updatedWalk = await firebaseWrapper.getWalkByKey(acceptWalk);

      expect(!_.isNil(updatedWalk)).toEqual(true);
      expect(updatedWalk.status).toEqual(firebaseConstants.WALK_STATUS.CANCELLED);
    });
  });

  describe('completeWalkRequest', async () => {
    // short hand create walk for smaller tests for easier readablility.
    const createWalk = firebaseWrapper.createWalkRequest.bind(firebaseWrapper);
    const loc = { lat: 1, lng: 1 };

    it('Should reject if the completer or walk request ids are not valid', async () => {
      expect.assertions(11);

      // the two possible related errors that can occure if the request or accepter id is not valid.
      const requestError = new Error('walk request id cannot be null or a invalid/empty string');
      const completeError = new Error('completer id cannot be null or a invalid/empty string');

      // short hand accept for cleaner testing.
      const complete = firebaseWrapper.completeWalkRequest.bind(firebaseWrapper);

      // validate the common cases related to invalid value inputs.
      // accepter id does not validate for undefined due to it being replaced with the current
      // authenticated user if the value is undefined (using default params).
      await expect(complete(null, 'reqid', 'notes')).rejects.toEqual(completeError);
      await expect(complete(['value'], 'reqid', 'notes')).rejects.toEqual(completeError);
      await expect(complete(false, 'reqid', 'notes')).rejects.toEqual(completeError);
      await expect(complete(5, 'reqid', 'notes')).rejects.toEqual(completeError);
      await expect(complete('    ', 'reqid', 'notes')).rejects.toEqual(completeError);

      await expect(complete('complete', null, 'notes')).rejects.toEqual(requestError);
      await expect(complete('complete', undefined, 'notes')).rejects.toEqual(requestError);
      await expect(complete('complete', ['value'], 'notes')).rejects.toEqual(requestError);
      await expect(complete('complete', false, 'notes')).rejects.toEqual(requestError);
      await expect(complete('complete', 5, 'notes')).rejects.toEqual(requestError);
      await expect(complete('complete', '    ', 'notes')).rejects.toEqual(requestError);
    });

    it('Should reject if notes are set that they are not null, invalid or not a string', async () => {
      expect.assertions(3);

      // the related error expected to be thrown when the method is called badly.
      const noteError = new Error('if notes are set, they cannot be a invalid/empty string');

      // short hand accept for cleaner testing.
      const complete = firebaseWrapper.completeWalkRequest.bind(firebaseWrapper);

      // validation and checking that the notes parameter is correctly rejected.
      const notesCompleteArray = complete('complete', 'walkId', ['notes']);
      const notesCompleteBool = complete('complete', 'walkId', false);
      const notesCompleteNum = complete('complete', 'walkId', 5);

      await expect(notesCompleteArray).rejects.toEqual(noteError);
      await expect(notesCompleteBool).rejects.toEqual(noteError);
      await expect(notesCompleteNum).rejects.toEqual(noteError);
    });

    it('Should complete the walk if all required properties are correctly set', async () => {
      expect.assertions(2);

      // first lets create the walk, the walk request id can then be used to regather and accept the
      // walk request, ensuring that its beging accepted.
      const inDate = new Date();
      const acceptWalk = await createWalk(userTwoId, userOneId, ['d'], inDate, inDate, loc, 'N/A');

      // short hand complete for cleaner testing. lets complete the walk, the completeing process does
      // not return anything so we should have to regather the walk object and validate that the
      // status and history object has been updated.
      const complete = firebaseWrapper.completeWalkRequest.bind(firebaseWrapper);
      await complete(userTwoId, acceptWalk, 'notes');

      // rgathered walk since the accepting process has gone through.
      const updatedWalk = await firebaseWrapper.getWalkByKey(acceptWalk);

      expect(!_.isNil(updatedWalk)).toEqual(true);
      expect(updatedWalk.status).toEqual(firebaseConstants.WALK_STATUS.COMPLETE);
    });
  });

  describe('getWalkByKey', async () => {
    // short hand create walk for smaller tests for easier readablility.
    const createWalk = firebaseWrapper.createWalkRequest.bind(firebaseWrapper);
    const loc = { lat: 1, lng: 1 };

    it('Should return the related work with all properties for a given walk key', async () => {
      // to be consistant, we would first need to properly go and create the given walk, this id of
      // the given walk will then be used to regather it and validate that its content is what we
      // are expecting it ot all be.
      expect.assertions(7);

      const walkId = await createWalk(userTwoId, userOneId, ['d'], new Date(), new Date(), loc, 'N/A');
      const regatheredWalk = await firebaseWrapper.getWalkByKey(walkId);

      // first validate that the regathered walk is not null or undefined.
      expect(_.isNil(regatheredWalk)).toEqual(false);

      // validating that all the properties we are expecting exists.
      expect(regatheredWalk.walker).toEqual(userTwoId);
      expect(regatheredWalk.owner).toEqual(userOneId);
      expect(regatheredWalk.dogs).toEqual(['d']);
      expect(regatheredWalk.location).toEqual(loc);
      expect(regatheredWalk.notes.includes('N/A')).toEqual(true);
      expect(regatheredWalk.status).toEqual(firebaseConstants.WALK_STATUS.PENDING);
    });

    it('Should return null if a non-existing walk id is passed', async () => {
      expect.assertions(1);

      // first lets attempt to gather the walk by the non existing id and then validate that the
      // value is expected to be null.
      const nullWalk = await firebaseWrapper.getWalkByKey('notexistingid');
      await expect(nullWalk).toEqual(null);
    });

    it('Should reject if the provided id is not a valid string', async () => {
      // using a single build error message, we can use this to validate all possible cases that can
      // occure when passing in a invalid related id.
      expect.assertions(6);

      const invalidIdError = new Error('walk id cannot be null or a invalid/empty string');

      // validate the common cases related to invalid value inputs.
      await expect(firebaseWrapper.getWalkByKey(null)).rejects.toEqual(invalidIdError);
      await expect(firebaseWrapper.getWalkByKey(undefined)).rejects.toEqual(invalidIdError);
      await expect(firebaseWrapper.getWalkByKey(['value'])).rejects.toEqual(invalidIdError);
      await expect(firebaseWrapper.getWalkByKey(false)).rejects.toEqual(invalidIdError);
      await expect(firebaseWrapper.getWalkByKey(5)).rejects.toEqual(invalidIdError);
      await expect(firebaseWrapper.getWalkByKey('    ')).rejects.toEqual(invalidIdError);
    });
  });

  describe('getAllWalks', async () => {
    // short hand create walk for smaller tests for easier readablility.
    const createWalk = firebaseWrapper.createWalkRequest.bind(firebaseWrapper);
    const loc = { lat: 1, lng: 1 };

    it('Should return all walks for a given user', async () => {
      // first we must create a  couple of walks (validating that they don't exist before hand)
      // These walk related ids will then be used to validate that they correctly exist within the
      // all walks gathered.
      expect.assertions(4);

      const currentWalks = await firebaseWrapper.getAllWalks(userTwoId);

      // create the two walks
      const insertD = new Date();
      const walkOneId = await createWalk(userTwoId, userOneId, ['d'], insertD, insertD, loc, 'N/A');
      const walkTwoId = await createWalk(userTwoId, userOneId, ['d'], insertD, insertD, loc, 'N/A');

      // assert that new ids dont exist within the old set of walks before regathering the most
      // recent walks.
      expect(!_.isNil(_.find(currentWalks, (e) => e.id === walkOneId))).toEqual(false);
      expect(!_.isNil(_.find(currentWalks, (e) => e.id === walkTwoId))).toEqual(false);

      // regather the updated walks to validate that they do now exist.
      const updatedWalks = await firebaseWrapper.getAllWalks(userTwoId);

      expect(!_.isNil(_.find(updatedWalks, (e) => e.id === walkOneId))).toEqual(true);
      expect(!_.isNil(_.find(updatedWalks, (e) => e.id === walkTwoId))).toEqual(true);
    });

    it('Should reject if the provided id is not a valid string', async () => {
      // using a single build error message, we can use this to validate all possible cases that can
      // occure when passing in a invalid related id.
      expect.assertions(5);

      const invalidIdError = new Error('user id cannot be null or a invalid/empty string');

      // validate the common cases related to invalid value inputs. In this case the undefined will
      // not be taken into consideration. This is down to the default current authenicated user
      // being used as a default value if no value is passed
      await expect(firebaseWrapper.getAllWalks(null)).rejects.toEqual(invalidIdError);
      await expect(firebaseWrapper.getAllWalks(['value'])).rejects.toEqual(invalidIdError);
      await expect(firebaseWrapper.getAllWalks(false)).rejects.toEqual(invalidIdError);
      await expect(firebaseWrapper.getAllWalks(5)).rejects.toEqual(invalidIdError);
      await expect(firebaseWrapper.getAllWalks('    ')).rejects.toEqual(invalidIdError);
    });
  });

  describe('getAllWalkKeys', async () => {
    // short hand create walk for smaller tests for easier readablility.
    const createWalk = firebaseWrapper.createWalkRequest.bind(firebaseWrapper);
    const loc = { lat: 1, lng: 1 };

    it('Should return all walk ids for a given user', async () => {
      // first we must create the at least two given walks, these ids then can be used to validate
      // that they exist within the all keys after the keys have been gathered. But first gather the
      // current ids that we can validate that the newly created ones dont exist before the creation
      // process.
      expect.assertions(4);

      const currentKeys = await firebaseWrapper.getAllWalkKeys(userOneId);

      // create the two walks
      const insertD = new Date();
      const walkOneId = await createWalk(userTwoId, userOneId, ['d'], insertD, insertD, loc, 'N/A');
      const walkTwoId = await createWalk(userTwoId, userOneId, ['d'], insertD, insertD, loc, 'N/A');

      // assert that new ids dont exist within the old set of keys before regathering the most
      // recent keys.
      expect(Object.values(currentKeys).includes(walkOneId)).toEqual(false);
      expect(Object.values(currentKeys).includes(walkTwoId)).toEqual(false);

      // regather the updated keys to validate that they do now exist.
      const updatedKeys = await firebaseWrapper.getAllWalkKeys(userOneId);

      expect(Object.values(updatedKeys).includes(walkOneId)).toEqual(true);
      expect(Object.values(updatedKeys).includes(walkTwoId)).toEqual(true);
    });
  });

  /**
   * Testing the implementation process of the user balance incrementing, this will be used when the
   * user has completed walks, added balance to there account or a new user to the system.
   */
  describe('increaseBalance', async () => {
    // the list of all the errors that could be triggered within the function, this lets us get
    // better format our code to have cleaner tests. Below is all the error cases that are being
    // triggered wtihin the code.
    const notNumberError = new Error('The provided amount must be a number');
    const nonNegError = new Error('The provided amount change must be posative for incrementing');

    it('Should reject if the provided value is not a number', async () => {
      expect.assertions(3);

      // we want to ensure that the balance cannto be adjusted wildly with different values
      // so all other values that are not a number should be rejected.
      await expect(firebaseWrapper.increaseBalance([])).rejects.toEqual(notNumberError);
      await expect(firebaseWrapper.increaseBalance({ balance: 5 })).rejects.toEqual(notNumberError);
      await expect(firebaseWrapper.increaseBalance('string')).rejects.toEqual(notNumberError);
    });

    it('Should reject if the amount is less than 0', async () => {
      expect.assertions(3);

      // incrementing by a negative number could result in a funky outcome, we don't want this to be
      // used as decreasing as decreasing has been done seperately. Validate that you cannot have a
      // negative number as a value.
      await expect(firebaseWrapper.increaseBalance(-0.1)).rejects.toEqual(nonNegError);
      await expect(firebaseWrapper.increaseBalance(-100)).rejects.toEqual(nonNegError);
      await expect(firebaseWrapper.increaseBalance(-1000)).rejects.toEqual(nonNegError);
    });

    it('Should increase the amount of the balance by the given amount', async () => {
      expect.assertions(2);

      // we need to get the current balance value so we can validate that we are actaully increasing
      // the value as we call into the method. The balance value is stored under the profile.
      const profile = await firebaseWrapper.getProfile();
      const currentBalance = profile.walk.balance;

      // pefroming multiple balance increases to ensure that our changes are going through as
      // expected.
      await firebaseWrapper.increaseBalance(5);

      const updatedProfile = await firebaseWrapper.getProfile();
      const updatedBalance = updatedProfile.walk.balance;

      expect(updatedBalance).toEqual(currentBalance + 5);

      // supporting the incrementing of decimal point values should be supported and should be
      // treated properly as we would expect. Not adjusting the output value by anything but the
      // passed values.
      await firebaseWrapper.increaseBalance(0.3);
      await firebaseWrapper.increaseBalance(100);

      const doubleUpdatedProfile = await firebaseWrapper.getProfile();
      const doubleBalance = doubleUpdatedProfile.walk.balance;

      // validate that our overall new double balance does match what we expect it to be.
      expect(doubleBalance).toEqual(currentBalance + 5 + 0.3 + 100);
    });
  });

  describe('decreaseBalance', async () => {
    // the list of all the errors that could be triggered within the function, this lets us get
    // better format our code to have cleaner tests. Below is all the error cases that are being
    // triggered wtihin the code.
    const notNumberError = new Error('The provided amount must be a number');
    const nonNegError = new Error('The provided amount change must be posative for decreasing');

    it('Should reject if the provided value is not a number', async () => {
      expect.assertions(3);

      // we want to ensure that the balance cannto be adjusted wildly with different values
      // so all other values that are not a number should be rejected.
      await expect(firebaseWrapper.decreaseBalance([])).rejects.toEqual(notNumberError);
      await expect(firebaseWrapper.decreaseBalance({ balance: 5 })).rejects.toEqual(notNumberError);
      await expect(firebaseWrapper.decreaseBalance('string')).rejects.toEqual(notNumberError);
    });

    it('Should reject if the amount is less than 0', async () => {
      expect.assertions(3);

      // decreasing by a negative number could result in a funky outcome, we don't want this to be
      // used as decreasing as decreasing has been done seperately. Validate that you cannot have a
      // negative number as a value.
      await expect(firebaseWrapper.decreaseBalance(-0.1)).rejects.toEqual(nonNegError);
      await expect(firebaseWrapper.decreaseBalance(-100)).rejects.toEqual(nonNegError);
      await expect(firebaseWrapper.decreaseBalance(-1000)).rejects.toEqual(nonNegError);
    });

    it('Should reject if the current amount - the change is less than 0', async () => { });

    it('Should decrease the amount of the balance by the given amount', async () => {
      expect.assertions(2);

      // performing a base increase will allow us to make changes without breaking the code by
      // decreasing hte amount below 0 causing a error to be thrown.
      await firebaseWrapper.increaseBalance(200);

      // we need to get the current balance value so we can validate that we are actaully decreasing
      // the value as we call into the method. The balance value is stored under the profile.
      const profile = await firebaseWrapper.getProfile();
      const currentBalance = profile.walk.balance;

      // first pefrom a single small decrease for validation of small changes.
      await firebaseWrapper.decreaseBalance(5);

      const updatedProfile = await firebaseWrapper.getProfile();
      const updatedBalance = updatedProfile.walk.balance;

      expect(updatedBalance).toEqual(currentBalance - 5);

      // supporting the decreasing of decimal point values should be supported and should be
      // treated properly as we would expect. Not adjusting the output value by anything but the
      // passed values.
      await firebaseWrapper.decreaseBalance(0.3);
      await firebaseWrapper.decreaseBalance(100);

      const doubleUpdatedProfile = await firebaseWrapper.getProfile();
      const doubleBalance = doubleUpdatedProfile.walk.balance;

      // validate that our overall new double balance does match what we expect it to be.
      expect(doubleBalance).toEqual(currentBalance - 5 - 0.3 - 100);
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
        new Error('User must be new to have a welcome notification')
      );

      // make sure to set it back to whatever it was before we made the changes to false.
      await firebaseWrapper.database.ref(`users/${firebaseWrapper.getUid()}/profile/new`).set(profile.new);
    });
  });

  describe('createNotification', async () => {
    // the error message that could error when testing the types and values for a given insert for a
    // given notification. Its easier to have them defined before all the tests start than have them
    // repeatedly typed out constantly. Reducing chance of errors being typed in the tests.
    const targetError = new Error('targetId cannot be null or empty or not a string');
    const titleError = new Error('title cannot be null or empty or not a string');
    const messageError = new Error('message cannot be null or empty or not a string');
    const actionTypeError = new Error('actionType cannoot be empty or not a string');
    const actionLinkError = new Error('actionLink cannoot be empty or not a string');

    it('Should reject if the target id is a empty string', async () => {
      expect.assertions(1);

      // target ids are required for where the id should be inserted, if its a empty string we
      // should reject as there will be no user with a empty id that can insert this kind of data.
      await expect(firebaseWrapper.createNotification('', null, null, null, null)).rejects.toEqual(
        targetError
      );
    });

    it('Should reject if the target id is null', async () => {
      expect.assertions(1);

      // target ids are required for where the id should be inserted, if its null we should reject
      // as there will be no user with a empty id that can insert this kind of data.
      await expect(firebaseWrapper.createNotification(null, null, null, null, null)).rejects.toEqual(
        targetError
      );
    });

    it('Should reject if the target id is not a string', async () => {
      expect.assertions(3);

      // shorthand used for better formatted testing.
      const fire = firebaseWrapper;
      const id = { id: 'id' };

      await expect(fire.createNotification(['id'], null, null, null, null)).rejects.toEqual(targetError);
      await expect(fire.createNotification(id, null, null, null, null)).rejects.toEqual(targetError);
      await expect(fire.createNotification(false, null, null, null, null)).rejects.toEqual(targetError);
    });

    /**
     * Test that we are not going to be putting anything but a string within the database for the
     * title. This allows for better parsing of the notifications on the client side later.
     */
    it('Should reject the title if its a empty string', async () => {
      expect.assertions(1);

      await expect(firebaseWrapper.createNotification(undefined, '', null, null, null)).rejects.toEqual(
        titleError
      );
    });

    /**
     * We don't need any missing data, we are always expecting a title.
     */
    it('Should reject the title if its null or undefined', async () => {
      expect.assertions(2);

      await expect(firebaseWrapper.createNotification(undefined, null, null, null, null)).rejects.toEqual(
        titleError
      );
      await expect(
        firebaseWrapper.createNotification(undefined, undefined, null, null, null)
      ).rejects.toEqual(titleError);
    });

    /**
     * We don't need any missing data, we are always expecting a title.
     */
    it('Should reject the title if its not a string', async () => {
      expect.assertions(1);

      const notification = firebaseWrapper.createNotification(undefined, ['testing'], null, null, null);
      await expect(notification).rejects.toEqual(titleError);
    });

    /**
     * Test that we are not going to be putting anything but a string within the database for the
     * message. This allows for better parsing of the notifications on the client side later.
     */
    it('Should reject the message if its a empty string', async () => {
      expect.assertions(2);

      const notification = firebaseWrapper.createNotification(undefined, 'title', ' ', null, null);
      await expect(notification).rejects.toEqual(messageError);

      const notificationSpace = firebaseWrapper.createNotification(undefined, 'title', '', null, null);
      await expect(notificationSpace).rejects.toEqual(messageError);
    });

    /**
     * We don't need any missing data, we are always expecting a message.
     */
    it('Should reject the message if its null or undefined', async () => {
      expect.assertions(2);

      const notification = firebaseWrapper.createNotification(undefined, 'title', null, null, null);
      await expect(notification).rejects.toEqual(messageError);

      const notificationUndefined = firebaseWrapper.createNotification(
        undefined,
        'title',
        undefined,
        null,
        null
      );
      await expect(notificationUndefined).rejects.toEqual(messageError);
    });

    /**
     * We don't need any missing data, we are always expecting a message.
     */
    it('Should reject the message if its not a string', async () => {
      expect.assertions(1);
      const notification = firebaseWrapper.createNotification(undefined, 'title', ['testing'], null, null);
      await expect(notification).rejects.toEqual(messageError);
    });

    /**
     * if we are using a actionType,  we are not going to be putting anything but a string within
     * the database for the actionType. Making sure that the string acutally has content.
     */
    it('Should reject the actionType if its not null and if its a empty string', async () => {
      expect.assertions(2);
      const notification = firebaseWrapper.createNotification(undefined, 'title', 'message', '', null);
      await expect(notification).rejects.toEqual(actionTypeError);

      const notificationSpace = firebaseWrapper.createNotification(undefined, 'title', 'message', ' ', null);
      await expect(notificationSpace).rejects.toEqual(actionTypeError);
    });

    /**
     * if we are using a actionType,  we are not going to be putting anything but a string within the
     * database for the actionType. Making sure that its a string.
     */
    it('Should reject the actionType if its not null and if its not a string', async () => {
      expect.assertions(1);
      const notification = firebaseWrapper.createNotification(
        undefined,
        'title',
        'message',
        ['testing'],
        null
      );
      await expect(notification).rejects.toEqual(actionTypeError);
    });

    /**
     * if we are using a actionLink,  we are not going to be putting anything but a string within the
     * database for the actionLink. Making sure that the string acutally has content.
     */
    it('Should reject the actionLink if its not null and if its a empty string', async () => {
      expect.assertions(2);
      const notification = firebaseWrapper.createNotification(
        undefined,
        'title',
        'message',
        'actionType',
        ''
      );
      await expect(notification).rejects.toEqual(actionLinkError);

      const notificationSpace = firebaseWrapper.createNotification(
        undefined,
        'title',
        'message',
        'actionType',
        ' '
      );
      await expect(notificationSpace).rejects.toEqual(actionLinkError);
    });

    /**
     * if we are using a actionLink,  we are not going to be putting anything but a string within the
     * database for the actionLink. Making sure that its a string.
     */
    it('Should reject the actionLink if its not null and if its not a string', async () => {
      expect.assertions(1);
      const notification = firebaseWrapper.createNotification(undefined, 'title', 'message', 'actionType', [
        'testing'
      ]);
      await expect(notification).rejects.toEqual(actionLinkError);
    });

    /**
     * When the notification is created we must ensure that we are getting back to the key, this is
     * the key we will be using to reference the notification. This would be used for the removing
     * of notifications as well. / single gathering.
     */
    it('Should should return the notification key if the notification has been created', async () => {
      expect.assertions(1);

      const notification = await firebaseWrapper.createNotification(
        undefined,
        'title',
        'message',
        null,
        null
      );
      expect(typeof notification).toBe('string');
    });

    /**
     * When the notification is created we get a key reference, this must be validated that we can
     * regather the notification back from the server and all the contents exists correctly.
     */
    it('should return a valid notification key that can be used to regather the notification', async () => {
      expect.assertions(9);

      const nontificationSize = _.size(await firebaseWrapper.getNotifications());

      const notification = await firebaseWrapper.createNotification(
        undefined,
        'title-2',
        'message-2',
        null,
        null
      );
      const regathered = await firebaseWrapper.getNotificationByKey(notification);

      // test that the given notification actually exists within the database with the correct
      // information. e.g correct title, message and existing time stamp.
      expect(regathered.title).toEqual('title-2');
      expect(regathered.message).toEqual('message-2');
      expect(!_.isNil(regathered.timestamp)).toBeTruthy();

      const notificationFull = await firebaseWrapper.createNotification(
        undefined,
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

      const key = await firebaseWrapper.createNotification(undefined, 'title', 'message');
      const key2 = await firebaseWrapper.createNotification(undefined, 'title2', 'message3');
      const key3 = await firebaseWrapper.createNotification(undefined, 'title3', 'message3');

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

  describe('updateContactNumber', async () => {
    // We need to make sure that the contact number is added in correct format to the profile

    // Get the possible erros of the functions
    const errorNumber = new Error('Contact number cannot be a string or empty');
    const errorNotaNumber = new Error('Contact number can only be a number');

    it('Shoud not add the contact number if string or empty', async () => {
      expect.assertions(2);
      await expect(firebaseWrapper.updateContactNumber("string")).rejects.toEqual(errorNumber);
      await expect(firebaseWrapper.updateContactNumber("")).rejects.toEqual(errorNumber);
    });

    it('Should not add the contact number if it not a number', async () => {
      expect.assertions(2);
      await expect(firebaseWrapper.updateContactNumber(false)).rejects.toEqual(errorNotaNumber);
      await expect(firebaseWrapper.updateContactNumber([1])).rejects.toEqual(errorNotaNumber);
    });

  });

  describe('updateStatusType', async () => {
    // Get the errors when the entered values are not a string or empty
    const statusNameError = new Error('The status must a string and non-empty value');

    // We need to make sure invalid values do not pass
    it.only('Should update the status if it is a string', async () => {
      expect.assertions(3);
      await expect(firebaseWrapper.updateStatusType(false)).rejects.toEqual(statusNameError);
      await expect(firebaseWrapper.updateStatusType(1)).rejects.toEqual(statusNameError);
      await expect(firebaseWrapper.updateStatusType(['hello'])).rejects.toEqual(statusNameError);
    });
  });
});
