<template>
  <div id="profile">
  <v-app id="inspire">
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card>
            <v-card-text class="px-0">Dog Walker Profile: {{ fName }} {{ lName }}</v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs3>
          <v-card>
            <v-card-text class="px-0">
              Name: {{ fName }} {{ lName }}<br />
              Age: {{ age }}<br />
              Completed Walks: {{ completedWalks }}<br />
              Area: {{ area }}<br />
              Distance: {{ distance }}<br />
              Ratings: {{ rating }}/10<br />
              Price Range: £{{ priceMin }} - £{{priceMax}} (/h)<br />
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs9>
          <v-card>
            <v-card-title primary class="title">Feedback</v-card-title>
            <v-card-text class="px-0">Coming Soon</v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs3 offset-xs3 offset-md2 offset-lg3>
          <v-card>
            <v-card-text class="px-0">
              Name: {{ dName }}<br />
              Breed: {{ breed }}<br />
              Age: {{ dAge }}<br />
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
      fName: "Júnior",
      lName: "Silva",
      age: 20,
      completedWalks: 0,
      area: "Portsmouth",
      distance: 0,
      rating: 8,
      priceMin: 3,
      priceMax: 7,
      dName: "Richy",
      breed: "German Shepard",
      dAge: 3
    };
  },

};
</script>
