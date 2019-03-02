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
      expect.assertions(4); // four assertions are taking plac and expected.

      const profile = await firebaseWrapper.getProfile();

      expect(profile.email).toEqual(email);
      expect(profile.new).toBeTruthy();
      expect(profile.login_count).toBe(1);
      expect(profile.last_login).toEqual(expect.any(Number));
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
  });

  describe('incrementUsersLoginAcountAsync', async () => {
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
    it('Should reset the last login count for the given user', async () => {
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
});
