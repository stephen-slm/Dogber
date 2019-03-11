<template>
  <div id="walkFinder">
    <v-app id="inspire">
      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card>
              <v-card-title class="px-2">Walk Finder</v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs12 sm3>
            <v-overflow-btn :items="dropdown_distanceArea" label="Distance Area"></v-overflow-btn>
          </v-flex>
          <v-flex xs12 sm3>
            <v-overflow-btn :items="dropdown_ratings" label="Ratings"></v-overflow-btn>
          </v-flex>
          <v-flex xs12 sm3>
            <v-overflow-btn :items="dropdown_availability" label="Availability"></v-overflow-btn>
          </v-flex>
          <v-flex xs12 sm3>
            <v-overflow-btn :items="dropdown_priceRange" label="Price Range"></v-overflow-btn>
          </v-flex>
          <v-flex xs12>
            <v-card>
              <v-layout align-baseline>
                <v-flex xs12 sm1>
                  <v-avatar color="grey lighten-4">
                    <img src="../assets/placeholder.jpg" alt="avatar">
                  </v-avatar>
                </v-flex>
                <v-flex xs12 sm3>
                  Name: {{ firstName }} {{ lastName }}
                  <br>
                  Price Range: £{{ priceMin }} - £{{ priceMax }} (/h)
                </v-flex>
                <v-flex xs12 sm3>
                  Rating: {{ rating }}/10
                  <br>
                  Distance: {{ distance }} Miles
                </v-flex>
                <v-flex xs12 sm5>
                  <v-btn>Profile</v-btn>
                  <v-btn>Check Availability</v-btn>
                </v-flex>
              </v-layout>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'WalkFinder',
  data: function() {
    return {
      firstName: 'Mark',
      lastName: 'Anthony',
      rating: 8,
      priceMin: 3,
      priceMax: 7,
      distance: 0
    };
  }
};
</script>
