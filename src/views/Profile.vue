<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-text class="px-0 title-text gray lighten-1"
            >Dog Walker Profile: {{ profile.name }}</v-card-text
          >
        </v-card>
      </v-flex>
      <v-flex xs12 sm6 md4>
        <v-card>
          <v-card-text class="px-0">
            <v-avatar size="75">
              <img :src="profile.url" alt="avatar" />
            </v-avatar>
            <div class="core-text">
              <div style="text-align: center; margin-left: -50px;">
                <v-rating dense readonly hover half-increments v-model="profile.walk.rating" />
              </div>

              <div class="core-text-inner">
                <div>Name: {{ profile.name }}</div>
                <div>Email: {{ profile.email }}</div>
                <div>Age: {{ profile.age }}</div>
                <div>Completed Walks: {{ profile.walk.completed }}</div>
                <div>Area: {{ area }}</div>
                <div>Distance: {{ distance }}</div>
              </div>

              <div>Price Range: £{{ profile.walk.price.min }} - £{{ profile.walk.price.max }} (/h)</div>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex d-flex xs12 sm8>
        <v-layout row wrap>
          <v-flex d-flex>
            <v-card>
              <v-card-title>Feedback</v-card-title>
              <v-card-text>No Feedback 😓</v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import firebaseWrapper from '@/lib/firebaseWrapper.js';

export default {
  name: 'Profile',
  data: function() {
    return {
      profile: {
        walk: { rating: 0, price: { min: 0, max: 0 } }
      },
      distance: '',
      area: ''
    };
  },

  // on the creation and loading of the profile page, we load the profile and feedback of the given
  // page.
  created: async function() {
    await this.loadProfile();
    await this.loadFeedback();
  },

  methods: {
    // Loads the current profile into the page, this allows us display the related information. This
    // will be used for loading a profile by a given id in the future.
    loadProfile: async function() {
      const user = firebaseWrapper.getCurrentUser();
      const profile = await firebaseWrapper.getProfile();

      this.profile = profile;
      this.profile.url = user.photoURL;

      this.distance = 0;
      this.area = 'Portsmouth';
    },

    // Loads all the feedback for the current authenticated user into the page.
    loadFeedback: async function() {}
  },

  components: {}
};
</script>

<style scoped>
.title-text {
  text-align: left;
  margin-left: 25px;
}

.core-text {
  text-align: left;
  margin-left: 50px;
  margin-top: 10px;
}

.core-text-inner div {
  margin-top: 5px;
}
</style>
