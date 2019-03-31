<template>
  <v-card>
    <v-layout align-baseline>
      <v-flex xs12 sm1 style="margin: auto">
        <v-avatar color="grey lighten-4">
          <img :src="walker.photo" alt="avatar" />
        </v-avatar>
      </v-flex>
      <v-flex xs12 sm3 style="margin: auto">
        <div>Walker: {{ walker.name || 'User' }}</div>
        <div>Start Time: {{ new Date(walk.start || Date.now()).toLocaleString() }}</div>
      </v-flex>
      <v-flex xs12 sm3 style="margin: auto">
        <div>
          Status:
          <span :style="{ color: getStatusColor() }">{{ getStatus() }}</span>
        </div>
        <div>Miles: {{ getMiles() }}</div>
      </v-flex>
      <v-flex xs12 sm5 style="margin: auto">
        <v-btn depressed color="primary" :to="walkerProfilePath">Profile</v-btn>
        <v-btn depressed :to="walkPath">View Walk</v-btn>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
import _ from 'lodash';
import firebaseWrapper from '../lib/firebaseWrapper.js';
import * as firebaseConstants from '../constants/firebaseConstants.js';

export default {
  props: {
    id: {
      type: String,
      default: null
    }
  },

  data: function() {
    return {
      walk: {},
      walker: {},
      walkerProfilePath: '',
      walkPath: ''
    };
  },

  created: async function() {
    // first gather the related walk and the relatd walker for the given walk, this will be used for
    // display related information. And navigating to the walkers profile.
    this.walk = await firebaseWrapper.getWalkByKey(this.id);
    this.walker = await firebaseWrapper.getProfile(this.walk.walker);

    // update the path to the walkers profile and update the path to the walk directly.
    this.walkerProfilePath = `/profile/${this.walk.walker}`;
    this.walkPath = `/walks/${this.id}`;
  },

  methods: {
    // gets the display related text for a given walk message, this is what the user is going to see
    // as the text for a given status. This has to be clean and easy to read.
    getStatus: function() {
      switch (this.walk.status) {
        case firebaseConstants.WALK_STATUS.ACTIVE:
          return 'Active';
        case firebaseConstants.WALK_STATUS.PENDING:
          return 'Pending';
        case firebaseConstants.WALK_STATUS.CANCELLED:
          return 'Cancelled';
        case firebaseConstants.WALK_STATUS.COMPLETE:
          return 'Complete';
        case firebaseConstants.WALK_STATUS.REJECTED:
          return 'Rejected';
        default:
          return 'N/A';
      }
    },
    // gets the display related text color for a given walk message, this is what the user is going to see
    // as the text for a given status. This has to be clean and easy to read.
    getStatusColor: function() {
      switch (this.walk.status) {
        case firebaseConstants.WALK_STATUS.ACTIVE:
        case firebaseConstants.WALK_STATUS.COMPLETE:
          return 'green';
        case firebaseConstants.WALK_STATUS.PENDING:
        case firebaseConstants.WALK_STATUS.CANCELLED:
          return 'orange';
        case firebaseConstants.WALK_STATUS.REJECTED:
          return 'red';
        default:
          return 'black';
      }
    },
    // returns the current miles that could be possible at the high end for the user if they walked
    // the full length of the tiven time span.
    getMiles() {
      // average walk of twenty minutes to walk a single mile. so 60 / 20 equal average miles.
      const averageMilesPerHour = 60 / 20;

      // determine the unix time differnce, convert it to hours and times that by the average.
      const timeDiff = Math.abs(new Date(this.walk.start).getTime() - new Date(this.walk.end).getTime());

      // if we did not have the time objects, then just default to Unknown.
      if (_.isNaN(timeDiff)) return 'N/A';
      return ((timeDiff / (1000 * 3600 * 1)) * averageMilesPerHour).toFixed(2);
    }
  }
};
</script>

<style scoped>
.rating-inline {
  display: inline-flex;
}
</style>
