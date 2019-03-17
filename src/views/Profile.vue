<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-text class="subheading text-sm-left gray lighten-1"
            >Dog Walker Profile: {{ profile.name }}</v-card-text
          >
        </v-card>
      </v-flex>
      <v-flex xs12 sm6 md4>
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
              <v-card-text grid-list-xl>
                <div v-if="feedback.length === 0">No Feedback 😓</div>
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
                    <div class="feedback-time text-sm-right">
                      {{ new Date(item.timestamp).toLocaleDateString() }}
                    </div>
                  </v-flex>
                </v-layout>
              </v-card-text>

              <v-card-actions v-if="canGiveFeedback">
                <v-dialog v-model="showFeedbackBox" max-width="600px">
                  <v-card>
                    <v-card-title>
                      <span class="headline">Feedback</span>
                    </v-card-title>
                    <v-card-text>
                      <v-container grid-list-md>
                        <v-layout wrap>
                          <v-flex>
                            <v-text-field
                              v-model="feedbackMessage"
                              :rules="[rules.required, rules.counter]"
                              clearable
                              maxlength="100"
                              counter
                              label="Message*"
                              required
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="blue darken-1" flat @click="showFeedbackBox = false">Close</v-btn>
                      <v-btn color="blue darken-1" flat @click="saveFeedback()">Save</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-btn flat color="primary" @click="showFeedbackBox = true">Give Feedback</v-btn>
              </v-card-actions>
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
      localUserId: this.$route.params.id || '',
      profile: {
        walk: { rating: 0, price: { min: 0, max: 0 } }
      },
      distance: '',
      area: '',
      feedback: [],
      canGiveFeedback: false,
      showFeedbackBox: false,
      feedbackMessage: '',
      rules: {
        required: (value) => !!value || 'Required.',
        counter: (value) =>
          (value.length <= 100 && value.length > 10) || 'Max 100 characters && Greater than 10'
      }
    };
  },

  // on the creation and loading of the profile page, we load the profile and feedback of the given
  // page.
  created: async function() {
    // if no id was given via the param of the url then we will just fall to setting it as the id of
    // the current authenticated user, this will lead to always having somethigng being displayed.
    if (_.isNil(this.localUserId) || this.localUserId === 'me') {
      this.localUserId = firebaseWrapper.getUid();
    }

    // the user should only be able to give feedback to a person who is not themselves
    if (this.localUserId !== firebaseWrapper.getUid()) {
      this.canGiveFeedback = true;
    }

    await this.loadProfile();
    await this.loadFeedback();
  },

  methods: {
    // Loads the current profile into the page, this allows us display the related information. This
    // will be used for loading a profile by a given id in the future.
    loadProfile: async function() {
      let profile = await firebaseWrapper.getProfile(this.localUserId);

      // if for whatever reason we did not get back a valid profile, most likly due to the id that
      // was given via the url was not a valid url. Then we are going to just get the data for the
      // current authenticated user.
      if (_.isNil(profile)) profile = await firebaseWrapper.getProfile();

      // If the account is new redirect to introduction page
      if(profile.new){
        this.$router.push({ name:'introduction' })
      }
      this.profile = profile;

      this.distance = 0;
      this.area = 'Portsmouth';
    },

    // Loads all the feedback for the current authenticated user into the page.
    loadFeedback: async function() {
      const feedback = await firebaseWrapper.getFeedback();

      if (!_.isNil(feedback)) this.feedback = feedback;

      // setup a feedback reference for live updating feedback as the feedback is added.
      const feedbackReference = await firebaseWrapper.getFeedbackReference(this.localUserId);
      feedbackReference.on('value', (snapshot) => {
        const feedback = snapshot.val();
        if (!_.isNil(feedback)) this.feedback = feedback;
      });
    },

    // saves the feedback for the given user with the given input on the pop up form, this gives a
    // point for users to give feedback to them from there profile directly. Noted that feedback is
    // not related to there rating (which can only be given after a walk)
    saveFeedback: async function() {
      // make sure not to accept empty or too large
      if (this.feedbackMessage.length > 100 || this.feedbackMessage.length < 10) {
        return;
      }

      await firebaseWrapper.addFeedback(undefined, this.localUserId, this.feedbackMessage);

      // make sure to hide the feedback after the changes have been made.
      this.showFeedbackBox = false;
      this.feedbackMessage = '';
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
