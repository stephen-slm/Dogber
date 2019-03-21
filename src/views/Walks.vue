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
          <v-flex xs12>
            <SingleWalkResult v-for="(item, index) in walks" :key="index" class="walk-history" :id="item" />
          </v-flex>
        </v-layout>
      </v-container>
    </v-app>
  </div>
</template>

<script>
import SingleWalkResult from '@/components/SingleWalkResult.vue';

export default {
  name: 'Walks',
  data: function() {
    return {
      dropdown_walkCompleted: ['Yes', 'No'],
      dropdown_date: ['Ascending', 'Descending'],
      walks: {}
    };
  },

  components: {
    SingleWalkResult
  }
};
</script>

<style scoped>
.walk-history {
  margin-bottom: 25px;
}
</style>
