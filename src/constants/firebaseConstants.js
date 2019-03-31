export const PROFILE_SELECTION = ['email', 'displayName', 'photoURL', 'emailVerified'];

// what is going to be selected when attempting to upate the profile, giving more information that
// is in this list will result in it being filted out.
export const PROFILE_UPDATE_SELECT = ['email', 'name', 'new', 'age', 'contact_number', 'status_type'];

// when a user has a address they will require the below information, anything missing will throw a
// error and anything more will be filtered out.
export const PROFILE_ADDRESS = ['lineOne', 'city', 'state', 'zip', 'country'];

// walk state related to a single walk, this will be used to indicate the current process.
export const WALK_STATUS = {
  PENDING: 0,
  ACTIVE: 1,
  CANCELLED: 2,
  COMPLETE: 3,
  REJECTED: 4
};
