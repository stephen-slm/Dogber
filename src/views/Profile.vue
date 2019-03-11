<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-text class="px-0 title-text gray lighten-1">Dog Walker Profile: {{ profile.name }}</v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 sm6 md4>
        <v-card>
          <v-card-text class="px-0">
            <v-avatar size="75">
              <img :src="profile.url" alt="avatar">
            </v-avatar>
            <div class="core-text">
              <div>Name: {{ profile.name }}</div>
              <div>Email: {{ profile.email }}</div>
              <div>Age: {{ profile.age }}</div>
              <div>Completed Walks: {{ profile.walk.completed }}</div>
              <div>Area: {{ area }}</div>
              <div>Distance: {{ distance }}</div>
              <div>
                <v-rating dense readonly hover half-increments v-model="profile.walk.rating"/>
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
              <v-card-text>Feedback</v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import _ from 'lodash';
import firebaseWrapper from '@/lib/firebaseWrapper.js';

export default {
  name: 'Profile',
  data: function() {
    return {
      profile: {}
    };
  },

  created: async function() {
    const user = firebaseWrapper.getCurrentUser();
    const profile = await firebaseWrapper.getProfile();

    if (!_.isNil(profile)) {
      this.profile = profile;
      this.profile.url = user.photoURL;
    }
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
}
</style>
