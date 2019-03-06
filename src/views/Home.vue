<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap>
      <v-flex xs12 sm6 md6 class="box-spacing">
        <GenericPanel topText="Welcome to Dogber" bottomText="Pending walk requests">12</GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md6 class="box-spacing">
        <GenericPanel topText="Activities" bottomText="Confirmed/Future Walks">37</GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md3 class="box-spacing">
        <GenericPanel bottomText="Miles Walked" topTextColor="blue" topText="37.6K">
          <v-icon>directions_walk</v-icon>
        </GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md3 class="box-spacing">
        <GenericPanel bottomText="My 5 Star Rating" topTextColor="red" topText="4.75">
          <v-icon>star</v-icon>
        </GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md3 class="box-spacing">
        <GenericPanel bottomText="Completed Walks" topTextColor="green" topText="107">
          <v-icon>check</v-icon>
        </GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md3 class="box-spacing">
        <GenericPanel bottomText="Available" topTextColor="orange" topText="£48.64">
          <v-icon>credit_card</v-icon>
        </GenericPanel>
      </v-flex>

      <v-flex xs12 class="calendar-wrapper">
        <Calendar/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import _ from 'lodash';

import firebaseWrapper from '@/lib/firebaseWrapper';
import HelloWorld from '@/components/HelloWorld.vue';
import GenericPanel from '@/components/GenericPanel.vue';
import Calendar from '@/components/Calendar.vue';

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
    HelloWorld,
    GenericPanel,
    Calendar
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

.calendar-wrapper {
  margin-top: 25px;
}

.box-spacing {
  margin-bottom: 5px;
}
</style>
