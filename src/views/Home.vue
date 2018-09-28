<template>
  <div class="home">
    <div>
      <img class="avatar" alt="Peoples Image" :src="image" />
    </div>

    <HelloWorld :name="name" />
  </div>
</template>

<script>
import _ from 'lodash';

import firebaseWrapper from '@/lib/firebaseWrapper';
import HelloWorld from '@/components/HelloWorld.vue';

export default {
  name: 'Home',

  data: function() {
    return {
      // the name of the authenticated user to display for preview reasons.
      name: null,
      // the current profile image of the authenticated user
      image: null
    };
  },

  created: function() {
    // get the currenlty authenticated user.
    const user = firebaseWrapper.getCurrentUser();

    // if we are authenticated and the user object exists, set the name and image from the
    // authenticated object.
    if (!_.isNil(user)) {
      this.name = user.displayName;
      this.image = user.photoURL;
    }
  },

  methods: {},

  components: {
    HelloWorld
  }
};
</script>

<style scoped>
.avatar {
  vertical-align: middle;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
</style>
