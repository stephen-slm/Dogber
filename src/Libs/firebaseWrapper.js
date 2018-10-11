import * as firebase from 'firebase';
import * as _ from 'lodash';
import * as firebaseConstants from '../constants/firebaseConstants.js';

let instance = null;

class FirebaseWrapper {
	constructor(config) {
		if (!_.isNil(instance)) {
			return instance;
		}

		this.configuration = config;

		firebase.initializeApp(this.configuration);

		this.database = firebase.database();
		/**
		 * Ensuring that all future authentication request and persisted in the current state and
		 * continuing to use this state for the following refreshes on the webite, meaning that
		 * unless the user clicks that they want to sign out, they will always be logged back
		 * into the site automatically from that same device.
		 */
		this.authentication = firebase.auth();

		this.googleProvider = new firebase.auth.GoogleAuthProvider();
		this.githubProvider = new firebase.auth.GithubAuthProvider();
		this.facebookProvider = new firebase.auth.FacebookAuthProvider();
	}

	/**
	 * Authenticate the user with the provider based on mobile status
	 */
	authenticate(mobile = false, provider) {
		if (mobile) {
			return this.authentication.signInWithRedirect(provider);
		} else {
			return this.authentication.signInWithPopup(provider);
		}
	}

	/**
	 * Authenticates the user with google
	 */
	authenticateWithGoogle(mobile = false) {
		return this.authenticate(mobile, this.googleProvider);
	}

	/**
	 * authenticates the user with github
	 */
	authenticateWithGithub() {
		return this.authenticate(mobile, this.githubProvider);
	}

	/**
	 * authenticates the user with facebook
	 */
	authenicateWithFacebook(mobile = false) {
		return this.authenticate(mobile, this.facebookProvider);
	}

	/**
	 * Gets the current active users uid which is used to reference in the database
	 * @returns {string}
	 */
	getUid() {
		return !_.isNil(this.authentication.currentUser)
			? this.authentication.currentUser.uid
			: null;
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

	// returns all the users content
	getUserContent() {
		return this.database
			.ref(`users/${this.getUid()}`)
			.once('value')
			.then(user => Promise.resolve(user.val()))
			.catch(error => Promise.reject(error));
	}

	/**
	 * Gets the active users profile
	 * @returns {firebase.Promise.<*>}
	 */
	getProfileById() {
		return this.database.ref(`users/${this.getUid()}/profile`).once('value');
	}

	/**
	 * deletes the current account
	 */
	deleteAccount() {
		return this.database
			.ref(`users/${this.getUid()}`)
			.remove()
			.then(() => this.getCurrentUser().delete())
			.then(() => this.authentication.signOut());
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
	createNewUser() {
		const profile = this.generateProfileFromLogin();

		return this.database
			.ref(`users/${this.getUid()}/profile`)
			.set({
				given_name: profile.displayName.split(' ')[0],
				family_name: profile.displayName.split(' ')[1],
				email: profile.email,
				name: profile.displayName,
				last_login: Date.now(),
				login_count: 1,
				new: true,
			})
			.then(() => Promise.resolve(profile));
	}
}

export default new FirebaseWrapper({
	apiKey: 'AIzaSyA_zbj6P3C-LnncBKrn95J4xam7WelG6rA',
	authDomain: 'dogber2018.firebaseapp.com',
	databaseURL: 'https://dogber2018.firebaseio.com',
	projectId: 'dogber2018',
	storageBucket: 'dogber2018.appspot.com',
	messagingSenderId: '145705113606',
});
