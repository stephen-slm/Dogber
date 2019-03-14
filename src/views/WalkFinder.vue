<template>
  <div id="walkFinder">
    <v-app id="inspire">
      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card>
              <v-card-title primary class="subheading text-sm-left">Walk Finder</v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs12 sm3>
            <v-select :items="dropdown_distanceArea" label="Distance Area"></v-select>
          </v-flex>
          <v-flex xs12 sm3>
            <v-select :items="dropdown_ratings" label="Ratings"></v-select>
          </v-flex>
          <v-flex xs12 sm3>
            <v-select :items="dropdown_availability" label="Availability"></v-select>
          </v-flex>
          <v-flex xs12 sm3>
            <v-select :items="dropdown_priceRange" label="Price Range"></v-select>
          </v-flex>
          <v-flex xs12>
            <WalkFinderResult v-for="item in userKeys" :key="item" class="walk-result" :id="item"/>
          </v-flex>
        </v-layout>
      </v-container>
    </v-app>
  </div>
</template>

<script>
import _ from 'lodash';
import WalkFinderResult from '@/components/WalkFinderResult.vue';
import firebaseWrapper from '@/lib/firebaseWrapper';

export default {
  name: 'WalkFinder',
  data: function() {
    return {
      localUserId: firebaseWrapper.getUid(),
      dropdown_distanceArea: ['Portsmouth', 'London', 'Brighton'],
      dropdown_ratings: ['0 - 1', '1 - 2', '2 - 3', '3 - 4', '4 - 5'],
      dropdown_availability: ['now', 'later'],
      dropdown_priceRange: ['0 - 5', '5 - 10', '10 - 20', '20+'],
      userKeys: []
    };
  },

  created: async function() {
    // for preview information, just generating the displaying data for the given user.
    const usersReference = await firebaseWrapper.database.ref('users').once('value');
    const users = usersReference.val();

    // we don't want to add our current self into the list.
    const currentUserId = firebaseWrapper.getUid();

    const userKeys = _.map(users, (value, index) => {
      if (index !== currentUserId) return index;
    });

    // remove all values that are not valid. e.g null, undefined.
    this.userKeys = _.compact(userKeys);
  },

  components: {
    WalkFinderResult
  }
};
</script>

<style scoped>
.walk-result {
  margin-bottom: 25px;
}
</style>
