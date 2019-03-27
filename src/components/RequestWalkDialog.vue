<template>
  <v-layout>
    <v-btn v-if="canRequest" @click="requestingWalk = true" flat>Request Walk</v-btn>
    <v-dialog v-model="requestingWalk" max-width="290">
      <v-card>
        <v-card-title class="headline">Walk request to {{ walker.name || walker.email }}</v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-layout wrap>
                <v-flex>
                  <v-text-field ref="name" label="Name" required></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn flat="flat" @click="requestingWalk = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click="addNewDog()">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
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
      walker: {},
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
      rules: {}
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
        this.$refs.form.reset();
        this.requestingWalk = false;
      }
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

<style scoped></style>
