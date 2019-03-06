<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap>
      <v-flex xs12 sm6 md6 class="box-spacing">
        <GenericPanel top-text="Welcome to Dogber" bottom-text="Pending walk requests">
          {{
          pendingWalks
          }}
        </GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md6 class="box-spacing">
        <GenericPanel top-text="Activities" bottom-text="Confirmed/Future Walks">
          {{
          confirmedWalks
          }}
        </GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md3 class="box-spacing">
        <GenericPanel bottom-text="Miles Walked" top-text-color="blue" :top-text="milesWalked">
          <v-icon>directions_walk</v-icon>
        </GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md3 class="box-spacing">
        <GenericPanel bottom-text="My 5 Star Rating" top-text-color="red" :top-text="currentRating">
          <v-icon>star</v-icon>
        </GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md3 class="box-spacing">
        <GenericPanel
          bottom-text="Completed Walks"
          top-text-color="green"
          :top-text="completedWalks"
        >
          <v-icon>check</v-icon>
        </GenericPanel>
      </v-flex>

      <v-flex xs12 sm6 md3 class="box-spacing">
        <GenericPanel bottom-text="Available" top-text-color="orange" :top-text="availableIncome">
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
import GenericPanel from '@/components/GenericPanel.vue';
import Calendar from '@/components/Calendar.vue';

export default {
  name: 'Home',

  data: function() {
    return {
      pendingWalks: 0,
      confirmedWalks: 0,
      milesWalked: 0,
      currentRating: 0,
      completedWalks: 0,
      availableIncome: `£0`
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
