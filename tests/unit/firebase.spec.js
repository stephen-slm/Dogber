import _ from 'lodash';

import firebaseWrapper from '../../src/lib/firebaseWrapper';

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
      expect.assertions(17); // four assertions are taking plac and expected.

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
      // application. This will be changed throughout the use of the application.
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

    it('Should reject if the feedbacker id is null', async () => {
      expect.assertions(1);

      await expect(firebaseWrapper.addFeedback(null, 'targetid', 'message')).rejects.toEqual(feedtargetNull);
    });

    it('Should reject if the feedbacker id is not a string', async () => {
      expect.assertions(4);

      await expect(firebaseWrapper.addFeedback('id', [1], 'm')).rejects.toEqual(feedtargetString);
      await expect(firebaseWrapper.addFeedback('id', false, 'm')).rejects.toEqual(feedtargetString);
      await expect(firebaseWrapper.addFeedback('id', true, 'm')).rejects.toEqual(feedtargetString);
      await expect(firebaseWrapper.addFeedback('id', () => {}, 'm')).rejects.toEqual(feedtargetString);
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
      await expect(firebaseWrapper.addFeedback(() => {}, 'id', 'm')).rejects.toEqual(feedtargetString);
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
      await expect(firebaseWrapper.addFeedback('id', 'id', () => {})).rejects.toEqual(nullNotStringError);
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

    it('Should reject if the current amount - the change is less than 0', async () => {});

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
