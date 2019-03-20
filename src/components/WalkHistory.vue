<template>
  <v-card>
    <v-layout align-baseline>
      <v-flex xs12 sm1>
        <v-avatar color="grey lighten-4">
          <img :src="walkDetails.photo" alt="avatar" />
        </v-avatar>
      </v-flex>
      <v-flex xs12 sm3>
        <div>Name: {{ walkDetails.name }}</div>
        <div>Price: £{{ walkDetails.walk.price }}</div>
        <div>Walk Distance: {{ walkDetails.walk.walkDistance }} Miles</div>
      </v-flex>
      <v-flex xs12 sm3>
        <div>Date: {{ walkDetails.date.day }}/{{ walkDetails.date.month }}/{{ walkDetails.date.year }}</div>
        <div>Walk Completed: {{ walkDetails.walkCompleted }}</div>
        <div class="rating-inline">
          <div style="padding-right: 5px">Rating:</div>
          <v-rating
            small
            dense
            readonly
            hover
            half-increments
            :value="walkDetails.walk.rating / walkDetails.walk.completed"
          />
        </div>
      </v-flex>
      <v-flex xs12 sm5>
        <v-btn flat color="primary" :to="profilePath">Profile</v-btn>
        <v-btn flat>Check Availability</v-btn>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
import _ from 'lodash';
import firebaseWrapper from '@/lib/firebaseWrapper';

export default {
  data: function() {
    return {
      walkDetails: {
        name: 'User',
        photo: '',
        walk: { date: { year: 0, month: 0, day: 0 }, price: 0, walkCompleted: 0, walkDistance: 0, rating: 0 }
      },
      profilePath: `/profile/${this.id}`
    };
  },
  props: {
    id: {
      type: String,
      default: null
    }
  },

  /**
   * When the walk finder is created we will need to gather the related information for the given
   * user by the provided id, this will then be used to display the related information and
   * provide a means of navigating to that persons profile. + check there availability.
   */
  created: async function() {
    const walkDetails = await firebaseWrapper.getProfile(this.id);

    if (!_.isNil(walkDetails)) {
      // if we have the profile and everything is working then we can update the related
      // information. We can then load the profile url into the page as well.
      this.walkDetails = Object.assign(this.walkDetails, walkDetails);
      this.walkDetails.photo = this.getPhotoUrl();
    }
  },

  methods: {
    /**
     * Gets the curernt profile url for the given users id or the place holder image instead.
     */
    getPhotoUrl() {
      return this.walkDetails.photo;
    }
  }
};
</script>

<style scoped>
.rating-inline {
  display: inline-flex;
}
</style>
