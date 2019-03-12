<template>
  <div id="profile">
    <v-app id="inspire">
      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card>
              <v-card-title primary class="title">
                Dog Walker Profile: {{ firstName }} {{ lastName }}
              </v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs3>
            <v-card>
              <v-avatar color="grey lighten-4">
                <img src="https://vuetifyjs.com/apple-touch-icon-180x180.png" alt="avatar" />
              </v-avatar>
              <v-card-text class="px-0">
                Name: {{ firstName }} {{ lastName }}<br />
                Age: {{ age }}<br />
                Completed Walks: {{ completedWalks }}<br />
                Area: {{ area }}<br />
                Distance: {{ distance }}<br />
                Ratings: {{ rating }}/10<br />
                Price Range: £{{ priceMin }} - £{{ priceMax }} (/h)<br />
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs9>
            <v-card>
              <v-card-title primary class="title">Feedback</v-card-title>
              <v-card-text class="px-0">Coming Soon</v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs3 offset-xs3>
            <v-card>
              <v-card-text class="px-0">
                <div>Name: {{ dogName }}</div>
                <div>Breed: {{ breed }}</div>
                <div>Age: {{ dogAge }}</div>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data: function() {
    return {
      firstName: 'Júnior',
      lastName: 'Silva',
      age: 20,
      completedWalks: 0,
      area: 'Portsmouth',
      distance: 0,
      rating: 8,
      priceMin: 3,
      priceMax: 7,
      dogName: 'Richy',
      breed: 'German Shepard',
      dogAge: 3
    };
  }
};
</script>
