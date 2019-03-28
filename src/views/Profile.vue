<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-layout row wrap>
            <v-flex xs6>
              <v-card-title primary class="subheading text-sm-left"
                >Dog Walker Profile: {{ profile.name }}</v-card-title
              >
            </v-flex>
            <v-flex xs6 class="text-sm-right" v-if="!isCurrentUser" style="margin: auto">
              <RequestWalkDialog
                :owner-id="authenticatedUserId"
                :walker-id="localUserId"
                :show-form-button="!isCurrentUser"
              />
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>

      <v-flex xs12 sm6 md4 row wrap>
        <v-card>
          <v-card-text class="px-0">
            <v-avatar size="75">
              <img :src="profile.photo" alt="avatar" />
            </v-avatar>
            <div class="core-text">
              <div style="text-align: center; margin-left: -50px;">
                <v-rating
                  dense
                  readonly
                  hover
                  half-increments
                  :value="profile.walk.rating / profile.walk.completed"
                />
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
      <v-flex d-flex xs12 sm6 md8>
        <v-layout row wrap>
          <v-flex d-flex>
            <v-card>
              <v-card-title>Feedback</v-card-title>
              <v-card-text>
                <div v-if="feedback == null">No Feedback 😓</div>
                <v-layout class="feedback-item" row wrap v-for="item in feedback" :key="item.timestamp">
                  <v-flex shrink>
                    <v-avatar size="32px">
                      <img :src="item.feedbacker.photo" alt="Dogber" />
                    </v-avatar>
                  </v-flex>
                  <v-flex>
                    <div class="text-sm-left">
                      <div class="bold font-weight-bold">{{ item.feedbacker.name }}:</div>
                      <div>{{ item.message }}</div>
                    </div>
                  </v-flex>
                  <v-flex>
                    <div class="feedback-time text-sm-right">{{ getTimeSince(item.timestamp) }}</div>
                  </v-flex>
                </v-layout>
              </v-card-text>

              <v-card-actions class="text-sm-left" v-if="!isCurrentUser">
                <GiveFeedback :submit="saveFeedback.bind(this)" />
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-flex>
      <DogsGrid :profile="profile" :dogs="dogs" :owner-id="localUserId" />
    </v-layout>
  </v-container>
</template>

<script>
import _ from 'lodash';
import * as moment from 'moment';

import firebaseWrapper from '../lib/firebaseWrapper.js';
import GiveFeedback from '@/components/GiveFeedback.vue';
import DogsGrid from '@/components/DogsGrid.vue';
import RequestWalkDialog from '@/components/RequestWalkDialog.vue';

export default {
  name: 'Profile',
  data: function() {
    return {
      localUserId: '',
      authenticatedUserId: '',
      profile: {
        walk: { rating: 0, price: { min: 0, max: 0 } }
      },
      dogs: {},
      distance: '',
      area: '',
      feedback: [],
      isCurrentUser: false
    };
  },

  // on the creation and loading of the profile page, we load the profile and feedback of the given
  // page.
  created: async function() {
    return this.initalizePage();
  },

  watch: {
    // call again the method if the route changes
    $route: 'initalizePage'
  },

  methods: {
    initalizePage: async function() {
      this.localUserId = this.$route.params.id || '';
      this.authenticatedUserId = firebaseWrapper.getUid();

      // if no id was given via the param of the url then we will just fall to setting it as the id of
      // the current authenticated user, this will lead to always having somethigng being displayed.
      if (_.isNil(this.localUserId) || this.localUserId === 'me') {
        this.localUserId = this.authenticatedUserId;
      }

      // the user should only be able to give feedback to a person who is not themselves
      if (this.localUserId === this.authenticatedUserId) {
        this.isCurrentUser = true;
      }

      await this.loadProfile();
      await this.loadFeedback();
      await this.loadProfileDogs();
    },

    // Loads the current profile into the page, this allows us display the related information. This
    // will be used for loading a profile by a given id in the future.
    loadProfile: async function() {
      let profile = await firebaseWrapper.getProfile(this.localUserId);

      // if for whatever reason we did not get back a valid profile, most likly due to the id that
      // was given via the url was not a valid url. Then we are going to just get the data for the
      // current authenticated user.
      if (_.isNil(profile)) profile = await firebaseWrapper.getProfile();

      this.profile = profile;

      this.distance = 0;
      this.area = 'Portsmouth';
    },

    // gets and gathers all the related dogs for the current authenticated user or users profile
    // page which is being gathered, based on the url path (but this will default to the
    // authenticated users dogs).
    loadProfileDogs: async function() {
      const dogs = await firebaseWrapper.getAllDogs(this.localUserId);
      if (_.isNil(dogs)) this.dogs = dogs;

      // gathering the reference to the users dogs will allow us to update the displayings dogs when
      // a new dog is added for the current user.
      const dogsReference = await firebaseWrapper.getDogsReference(this.localUserId);

      // if and when new dogs are added, reflect this one the page.
      dogsReference.on('value', (snapshot) => {
        if (!_.isNil(snapshot)) this.dogs = snapshot.val();
      });
    },

    // Loads all the feedback for the current authenticated user into the page.
    loadFeedback: async function() {
      const feedback = await firebaseWrapper.getFeedback(this.localUserId);

      if (!_.isNil(feedback)) this.feedback = feedback;

      // setup a feedback reference for live updating feedback as the feedback is added.
      const feedbackReference = await firebaseWrapper.getFeedbackReference(this.localUserId);

      feedbackReference.on('value', (snapshot) => {
        if (!_.isNil(snapshot)) this.feedback = snapshot.val();
      });
    },

    // saves the feedback for the given user with the given input on the pop up form, this gives a
    // point for users to give feedback to them from there profile directly. Noted that feedback is
    // not related to there rating (which can only be given after a walk)
    saveFeedback: async function(message) {
      // make sure not to accept empty or too large
      if (message.length > 100 || message.length < 10) {
        return false;
      }

      await firebaseWrapper.addFeedback(undefined, this.localUserId, message);
      return true;
    },

    /**
     * Gets the notification style time since, this will go for minutes, then days and then months.
     * Allows the user to always know when a notification occured on the system.
     * @param {number} timestamp unix time stamp of when it was added.
     */
    getTimeSince: function(timestemp) {
      return moment(timestemp).fromNow();
    }
  },

  components: {
    GiveFeedback,
    DogsGrid,
    RequestWalkDialog
  }
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

.feedback-item {
  margin-left: 50px;
  margin-bottom: 10px;
}

.feedback-time {
  margin-right: 25px;
}
</style>
