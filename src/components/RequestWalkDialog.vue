<template>
  <v-layout class="request-walk">
    <v-btn v-if="canRequest" @click="requestingWalk = true" flat>Request Walk</v-btn>
    <v-dialog v-model="requestingWalk" max-width="350">
      <v-card>
        <v-card-title class="headline text-sm-center"
          >Walk request to {{ walker.name || walker.email }}</v-card-title
        >
        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-layout wrap>
                <v-flex>
                  <v-text-field
                    label="Walker Name (them)"
                    v-model="walker.name"
                    disabled
                    readonly
                  ></v-text-field>
                </v-flex>
                <v-flex>
                  <v-text-field
                    label="Owner Name (you)"
                    v-model="owner.name"
                    disabled
                    readonly
                  ></v-text-field>
                </v-flex>
                <v-flex>
                  <v-menu v-model="models.startDate" :close-on-content-click="false" full-width>
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        :value="computedStartDate"
                        clearable
                        label="Walk Date"
                        readonly
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="walk.startDate"
                      @change="models.startDate = false"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>
                <v-flex>
                  <v-menu
                    ref="startTimeMenu"
                    :return-value.sync="walk.startTime"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    v-model="models.startTime"
                    :nudge-right="40"
                    full-width
                    offset-y
                    lazy
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        clearable
                        v-model="walk.startTime"
                        label="Start Time"
                        readonly
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="models.startTime"
                      v-model="walk.startTime"
                      @click:minute="$refs.startTimeMenu.save(walk.startTime)"
                    ></v-time-picker>
                  </v-menu>
                </v-flex>
                <v-flex>
                  <v-menu
                    ref="endTimeMenu"
                    :return-value.sync="walk.endTime"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    v-model="models.endTime"
                    :nudge-right="40"
                    full-width
                    offset-y
                    lazy
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        clearable
                        v-model="walk.endTime"
                        label="End Time"
                        readonly
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="models.endTime"
                      v-model="walk.endTime"
                      @click:minute="$refs.endTimeMenu.save(walk.endTime)"
                    ></v-time-picker>
                  </v-menu>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat="flat" @click="requestingWalk = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click="addNewDog()">Request</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import moment from 'moment';
import firebaseWrapper from '../lib/firebaseWrapper';

export default {
  props: {
    // Used to let us know if we are going to show the request object on creation, additionally this
    // is what is going to be listened to when it has been created, changes to these will be
    // reflected to the underlining screen.
    showFormButton: {
      type: Boolean,
      default: false
    },
    // The walker id, this is the person who will be getting the request. This id will be used for
    // gathering that persons prifle, assigning them the walk and all related walk activities.
    walkerId: {
      type: String,
      default: ''
    },
    // The owner id, this is the person who will be requesting the request. This id will be used for
    // gathering that persons prifle, assigning them the walk and all related walk activities.
    ownerId: {
      type: String,
      default: ''
    }
  },

  data: function() {
    return {
      // The walkers profile object, this is the person who will be walking the dog. This object is
      // going to be reflecting the persons profile, used for displaying reasons.
      walker: {
        name: 'test'
      },
      // The owners profile object, this is the person who will be owning the dog. This object is
      // going to be reflecting the persons profile, used for displaying reasons.
      owner: {},
      // if the given person can be requesting walks, generally related around if they are the
      // current person on the profile or not, as you cannot request a walk for yourself. This
      // reflects if the button to show the form should be displayed.
      canRequest: false,
      // if the requsting walk form should be displayed or not. Generally updated through a input
      // trigger to the object or the click of the given form button.
      requestingWalk: false,
      // if the form is vaid.
      valid: true,
      // rules to be applied to the input fields to validate that they are ready to be used. E.g is
      // a number.
      rules: {},
      // The walk creation object, these are all the values that have been bound to the walk
      // creation process. All these values are bound directly to the form.
      walk: {
        startTime: null,
        startDate: null,
        endTime: null,
        endDate: null,
        location: ''
      },
      // panel based models, these models are used to show and hide the different kinds of inputs,
      // including date/time inputs. dropdowns and any releated popups.
      models: {
        startDate: false,
        startTime: false
      }
    };
  },

  created: async function() {
    this.canRequest = this.showFormButton;

    // lets gather the related profiles for the given owner id and the given walker id, these will
    // be the values that are getting displayed on the screen.
    this.walker = await firebaseWrapper.getProfile(this.walkerId);
    this.owner = await firebaseWrapper.getProfile(this.ownerId);
  },

  methods: {
    // if the given walk request form is validated correctly, and all the information is filled we
    // will attempt to request the walk within the firebase wrapper, creating the walk for all
    // users. Making sure to reset the form and close it after completing.
    addWalkRequest: async function() {
      if (this.$refs.form.validate()) {
        await firebaseWrapper.createWalkRequest(this.walkerId, this.ownerId, [], new Date(), new Date(), '');

        this.$refs.form.reset();
        this.requestingWalk = false;
      }
    }
  },

  computed: {
    computedStartDate() {
      return this.walk.startDate ? moment(this.walk.startDate).format('dddd, MMMM Do YYYY') : '';
    }
  },

  watch: {
    // watching the prop value that can be given within the creation process, its bad practice to
    // change a prop, so instead a local value is changed but if the system adjusted the passed in
    // props then we will reflect this to the underlining local variable. Keeping them in sync is
    // important.
    showFormButton: function(newValue) {
      this.canRequest = newValue;
    }
  }
};
</script>

<style scoped>
.request-walk {
  float: right;
}
</style>
