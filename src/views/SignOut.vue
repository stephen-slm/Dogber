<template>
  <div></div>
</template>

<script>
import _ from 'lodash';
import firebaseWrapper from '@/lib/firebaseWrapper';

export default {
  name: 'SignOut',

  /**
   * On creation
   */
  created: async function() {
    const user = firebaseWrapper.getCurrentUser();

    if (!_.isNil(user)) {
      return await firebaseWrapper.authentication.signOut();
    }

    this.$router.push({ name: 'login' });
  }
};
</script>
