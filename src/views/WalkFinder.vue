<template>
  <div id="walkFinder">
    <v-app id="inspire">
      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card xs6>
              <v-layout row wrap>
                <v-flex xs6>
                  <v-card-title primary class="subheading text-sm-left">Walk Finder</v-card-title>
                </v-flex>
                <v-flex xs6 class="text-sm-right">
                  <v-btn
                    icon
                    large
                    :loading="refreshingWalkers"
                    :disabled="refreshingWalkers"
                    @click="refreshWalkers"
                  >
                    <v-icon>refresh</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
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
            <WalkFinderResult v-for="item in userKeys" :key="item" class="walk-result" :id="item" />
          </v-flex>
        </v-layout>
      </v-container>
    </v-app>
  </div>
</template>

<script>
import WalkFinderResult from '@/components/WalkFinderResult.vue';
import firebaseWrapper from '../lib/firebaseWrapper';

export default {
  name: 'WalkFinder',
  data: function() {
    return {
      localUserId: firebaseWrapper.getUid(),
      dropdown_distanceArea: ['Portsmouth', 'London', 'Brighton'],
      dropdown_ratings: ['0 - 1', '1 - 2', '2 - 3', '3 - 4', '4 - 5'],
      dropdown_availability: ['now', 'later'],
      dropdown_priceRange: ['0 - 5', '5 - 10', '10 - 20', '20+'],
      userKeys: [],
      refreshingWalkers: false
    };
  },

  created: async function() {
    // Get the current active walkers keys.
    this.userKeys = await firebaseWrapper.getActiveWalkersKeys();
  },

  methods: {
    // reloads the current active walkers on the page, getting the latest walkers to the page.
    // Giving users refresh feedback.
    refreshWalkers: async function() {
      // set the freshing on the refreh button, so get get the correct loading process.
      this.refreshingWalkers = true;
      this.userKeys = {};

      // update the keys, vue will auto refresh the displaying content.
      this.userKeys = await firebaseWrapper.getActiveWalkersKeys();

      // make sure to set the button back again otherwise it will be stuck refreshing.
      this.refreshingWalkers = false;
    }
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
