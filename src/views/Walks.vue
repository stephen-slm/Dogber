<template>
  <div id="walks">
    <v-app id="inspire">
      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card>
              <v-card-title primary class="subheading text-sm-left">My Walks</v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs12 sm3>
            <v-select :items="dropdown_walkCompleted" label="Walk Completed"></v-select>
          </v-flex>
          <v-flex xs12 sm3>
            <v-select :items="dropdown_date" label="Date"></v-select>
          </v-flex>
          <v-flex xs12 sm3>
            <v-select :items="dropdown_price" label="Price"></v-select>
          </v-flex>
          <v-flex xs12 sm3>
            <v-select :items="dropdown_walkDistance" label="Walk Distance"></v-select>
          </v-flex>
          <v-flex xs12>
            <WalkHistory v-for="item in userKeys" :key="item" class="walk-history" :id="item" />
          </v-flex>
        </v-layout>
      </v-container>
    </v-app>
  </div>
</template>

<script>
import WalkHistory from '@/components/WalkHistory.vue';
import firebaseWrapper from '@/lib/firebaseWrapper';

export default {
  name: 'Walks',
  data: function() {
    return {
      localUserId: firebaseWrapper.getUid(),
      dropdown_walkCompleted: ['Yes', 'No'],
      dropdown_date: ['All', 'Last 24 Hours', 'Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 60 Days'],
      dropdown_price: ['0 - 5', '5 - 10', '10 - 20', '20+'],
      dropdown_walkDistance: ['0 - 1', '1 - 3', '2 - 5', '5 - 10', '10+']
    };
  },

  components: {
    WalkHistory
  }
};
</script>

<style scoped>
.walk-history {
  margin-bottom: 25px;
}
</style>
