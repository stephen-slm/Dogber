export const PROFILE_SELECTION = ['email', 'displayName', 'photoURL', 'emailVerified'];

// what is going to be selected when attempting to upate the profile, giving more information that
// is in this list will result in it being filted out.
export const PROFILE_UPDATE_SELECT = ['email', 'name', 'new', 'age', 'phone_number'];

// when a user has a address they will require the below information, anything missing will throw a
// error and anything more will be filtered out.
export const PROFILE_ADDRESS = ['lineOne', 'lineTwo', 'city', 'state', 'zip', 'country'];
