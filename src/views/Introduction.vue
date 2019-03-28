<template>
  <v-stepper v-model="currentPosition">
    <v-stepper-header>
      <v-stepper-step :complete="currentPosition > 1" step="1">About you</v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step :complete="currentPosition > 2" step="2">Service</v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step :complete="currentPosition > 3" step="3">About your Dogs</v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step :complete="currentPosition > 4" step="4">Terms of use</v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1">
        <v-card class="mb-5" height="auto">
          <p style="text-align:center">
            Welcome to Dogber! Thank you for joining our platform, to complete your application we require
            extra information. This will help us to create your profile
          </p>
          <v-layout justify-center style="margin-bottom: 13px">
            <v-flex xs12 sm6 md3>
              <v-text-field ref="name" v-model="name" label="Full Name" disabled></v-text-field>
              <v-text-field ref="email" v-model="email" label="E-Mail" disabled></v-text-field>
              <v-text-field
                ref="address"
                v-model="address"
                :rules="[
                  () => !!address || 'This field is required']"
                label="Address Line"
                placeholder="22 Cliverton Roadss"
                required
                counter
                maxlength="25"
              ></v-text-field>
              <v-text-field
                ref="city"
                v-model="city"
                :rules="[() => !!city || 'This field is required', addressCheck]"
                label="City"
                placeholder="Portsmouth"
                required
              ></v-text-field>
              <v-text-field
                ref="state"
                v-model="state"
                :rules="[() => !!state || 'This field is required']"
                label="State/Province/Region"
                required
                placeholder="Hampshire"
              ></v-text-field>
              <v-text-field
                ref="zip"
                v-model="zip"
                :rules="[() => !!zip || 'This field is required']"
                label="ZIP / Postal Code"
                required
                placeholder="PO12 6TY"
              ></v-text-field>
              <v-autocomplete
                ref="country"
                v-model="country"
                :rules="[() => !!country || 'This field is required']"
                :items="countries"
                label="Country"
                placeholder="Select..."
                required
              ></v-autocomplete>
              <v-text-field
                ref="contactNumber"
                v-model="contactNumber"
                :rules="[() => !!contactNumber || 'This field is required']"
                label="Contact Number"
                required
                placeholder="+34 7721775589"
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-card>

        <v-btn color="primary" @click="completeFormOne">Continue</v-btn>
        <v-btn color="warning" @click="resetFormOne()">Reset</v-btn>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-card class="mb-5" height="auto">
          <v-layout justify-center>
            <v-flex xs12 sm6 md3>
              <p style="text-align:center">Information about how would like to use the application</p>
              <v-select
                ref="status"
                v-model="status"
                :rules="[() => !!status || 'This field is required']"
                :items="statusTypes"
                label="Dog owner or Dog Walker?"
                placeholder="Select..."
                required
              ></v-select>
              <v-text-field
                ref="price"
                v-model="price"
                :rules="[() => !!price || 'This field is required']"
                label="Price required for services"
                placeholder="7.50"
                prefix="£"
                required
              ></v-text-field>
              <v-select
                ref="payment"
                v-model="payment"
                :items="paymentMethods"
                :rules="[() => !!payment || 'This field is required']"
                label="Payment Methods"
                placeholder="Select..."
                required
              ></v-select>
            </v-flex>
          </v-layout>
        </v-card>

        <v-btn color="primary" @click="completeFormTwo">Continue</v-btn>
        <v-btn outline color="indigo" @click="currentPosition = 1">Back</v-btn>
        <v-btn color="warning" @click="resetFormTwo()">Reset</v-btn>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-card class="mb-5" height="auto">
          <v-expansion-panel>
            <v-expansion-panel-content>
              <template v-slot:header>
                <div>Add Dogs (optional)</div>
              </template>
              <v-card>
                <p
                  style="text-align:center"
                >This part is optional, if you have any dogs and would like to add them in your profile</p>
                <v-container grid-list-md text-xs-center>
                  <v-layout row wrap>
                    <v-flex sm6 md3>
                    <v-flex xs12>
                      <v-card>
                        <v-card-text class="px-0">Information about your Dogs</v-card-text>
                        <v-layout justify-center>
                          <v-flex xs12 sm10 md8 lg6>
                            <v-card ref="getFormDogResult">
                              <v-card-text>
                                <v-text-field
                                  ref="dogName"
                                  v-model="dogName"
                                  :rules="[() => !!dogName || 'This field is required']"
                                  :error-messages="errorMessages"
                                  label="Dog Name"
                                  placeholder="Charlie"
                                  required
                                  counter
                                  maxlength="15"
                                ></v-text-field>
                                <v-text-field
                                  ref="dogAge"
                                  v-model="dogAge"
                                  :rules="[() => !!dogAge || 'This field is required']"
                                  :error-messages="errorMessages"
                                  label="Dog Age"
                                  placeholder="3"
                                  required
                                  counter
                                  maxlength="2"
                                ></v-text-field>
                                <v-text-field
                                  ref="dogRace"
                                  v-model="dogRace"
                                  :rules="[() => !!dogRace || 'This field is required']"
                                  :error-messages="errorMessages"
                                  label="Dog Race"
                                  placeholder="Doberman"
                                  required
                                  counter
                                  maxlength="10"
                                ></v-text-field>
                                <v-text-field
                                  ref="dogFavoriteToy"
                                  v-model="dogFavoriteToy"
                                  :rules="[() => !!dogFavoriteToy || 'This field is required']"
                                  label="Favorite toy"
                                  placeholder="Ball"
                                  counter
                                  maxlength="15"
                                ></v-text-field>
                                <v-text-field
                                  ref="dogFavoriteFood"
                                  v-model="dogFavoriteFood"
                                  :rules="[() => !!dogFavoriteFood || 'This field is required']"
                                  label="Favorite food"
                                  placeholder="Pizza"
                                  counter
                                  maxlength="15"
                                ></v-text-field>
                              </v-card-text>
                              <v-divider class="mt-5"></v-divider>
                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-slide-x-reverse-transition>
                                  <!-- <v-tooltip v-if="formHasErrors" left></v-tooltip> -->
                                </v-slide-x-reverse-transition>
                                <v-btn color="primary" flat @click="addOptionalDog">Add</v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-flex>
                        </v-layout>
                      </v-card>
                    </v-flex>
                    <v-flex xs12>
                      <v-card>
                        <v-card-text>Your Dogs added</v-card-text>
                        <v-container grid-list-md text-xs-center>
                          <v-layout row wrap>
                            <v-flex xs12 v-for="(dog, index) in dogInformation" :key="index">
                              <v-card color="cyan darken-2" class="white--text">
                                <v-layout>
                                  <v-flex xs4>
                                    <v-img
                                      src="https://dogber.co.uk/img/logo.001118af.png"
                                      height="125px"
                                      contain
                                    ></v-img>
                                  </v-flex>
                                  <v-flex xs7>
                                    <v-card-title primary-title>
                                      <div>
                                        <div class="headline">{{ dog.name }}</div>
                                        <div>Age: {{ dog.age }}</div>
                                        <div>Race: {{ dog.race }}</div>
                                      </div>
                                    </v-card-title>
                                  </v-flex>
                                </v-layout>
                                <v-divider light></v-divider>
                                <v-card-actions class="pa-2">Toy:
                                  <v-spacer></v-spacer>
                                  <p>{{ dog.favoriteToy }}</p>
                                </v-card-actions>
                                <v-card-actions class="pa-2">Food:
                                  <v-spacer></v-spacer>
                                  <p>{{ dog.favoriteFood }}</p>
                                </v-card-actions>
                              </v-card>
                            </v-flex>
                          </v-layout>
                        </v-container>
                        <v-divider class="mt-5"></v-divider>
                        <div style="margin-top: 3px">
                          <v-btn color="warning" flat @click="clearDogsList">Reset List</v-btn>
                        </div>
                      </v-card>
                    </v-flex>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card>

        <v-btn color="primary" @click="currentPosition = 4">Continue</v-btn>
        <v-btn outline color="indigo" @click="currentPosition = 2">Back</v-btn>
      </v-stepper-content>
      <v-stepper-content step="4">
        <v-card class="mb-5" height="auto">
          <v-layout justify-center>
            <v-flex xs12>
              <p>
                You are expressly and emphatically restricted from all of the following: publishing any
                Website material in any media; selling, sublicensing and/or otherwise commercializing any
                Website material; publicly performing and/or showing any Website material; using this Website
                in any way that is, or may be, damaging to this Website; using this Website in any way that
                impacts user access to this Website; using this Website contrary to applicable laws and
                regulations, or in a way that causes, or may cause, harm to the Website, or to any person or
                business entity; engaging in any data mining, data harvesting, data extracting or any other
                similar activity in relation to this Website, or while using this Website; using this Website
                to engage in any advertising or marketing; Certain areas of this Website are restricted from
                access by you and DOGBER may further restrict access by you to any areas of this Website, at
                any time, in its sole and absolute discretion. Any user ID and password you may have for this
                Website are confidential and you must maintain confidentiality of such information.
              </p>
            </v-flex>
          </v-layout>
        </v-card>
        <v-btn color="primary" @click="markUserNotNew">Accept & Finish</v-btn>
        <v-btn outline color="indigo" @click="currentPosition = 3">Back</v-btn>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import _ from 'lodash';
import firebaseWrapper from '@/lib/firebaseWrapper';

export default {
  name: 'Introduction',

  data: function() {
    return {
      currentPosition: 0,
      countries: [],
      errorMessages: '',

      // Data from about you (form 1)
      name: '',
      email: '',
      address: null,
      city: null,
      state: null,
      zip: null,
      country: null,
      contactNumber: null,

      // Data from Service (form 2)
      price: null,
      statusTypes: ['Dog Owner', 'Dog Walker'],
      status: null,
      paymentMethods: ['Bank Transfer', 'Cash', 'Online Payment'],
      payment: null,

      // For checking number 1, 2 and Dogs
      formOneErrored: false,
      formTwoErrored: false,
      formDogsHasErrors: false,

      // information about the Dog/s
      dogInformation: [],
      dogName: null,
      dogAge: null,
      dogRace: null,
      dogFavoriteToy: null,
      dogFavoriteFood: null
    };
  },

  /**
   * Allows to get information from the database:
   * - User profile name and email
   * - List of valid countries: used in form 1
   */
  created: async function() {
    const profile = await firebaseWrapper.getProfile();
    if (!profile.new) this.$router.push({ name: 'home' });

    this.name = profile.name;
    this.email = profile.email;

    // get the object of countries to be used instead of hard coded into the file.
    const countriesReference = await firebaseWrapper.database.ref('/countries').once('value');
    this.countries = _.map(countriesReference.val(), (value) => value);
  },

  computed: {
    /**
     * Gets the results from form 1. This is used for checkings
     */
    getFormOneResults: function() {
      return {
        address: this.address,
        city: this.city,
        state: this.state,
        zip: this.zip,
        country: this.country,
        contactNumber: this.contactNumber
      };
    },

    /**
     * Gets the results from form 2. This is used for checkings
     */
    getFormTwoResults: function() {
      return {
        price: this.price,
        status: this.status,
        payment: this.payment
      };
    },

    /**
     * Gets the results from the optional dog adding form. This is used for checkings
     */
    getFormDogResult: function() {
      return {
        dogName: this.dogName,
        dogAge: this.dogAge,
        dogRace: this.dogRace,
        dogFavoriteToy: this.dogFavoriteToy,
        dogFavoriteFood: this.dogFavoriteFood
      };
    }
  },

  methods: {
    /**
     * Validates that the address and name are being filled, otherwise lets the user know that they
     * are required fields to be completed.
     */
    addressCheck: function() {
      this.errorMessages = this.address && !this.name ? "Hey! I'm required" : '';
    },

    /**
     * Resets all the contents that is currently being used on the first form to null.
     */
    resetFormOne: function() {
      this.address = null;
      this.city = null;
      this.state = null;
      this.zip = null;
      this.country = null;
      this.contactNumber = null;
    },

    /**
     * Resets all the contents that is currently being used on the second form to null.
     */
    resetFormTwo: function() {
      this.status = null;
      this.price = null;
      this.payment = null;
    },

    /**
     * Checks and validates that the form one has completed correctly. Warning the user of all
     * requirement of the fields have not been completed correctly. If completed it will move on
     * with the form, othwerise say in the current location.
     */
    completeFormOne: function() {
      this.formOneErrored = false;

      Object.keys(this.getFormOneResults).forEach((f) => {
        if (_.isNil(this.getFormOneResults[f])) this.formOneErrored = true;
        this.$refs[f].validate(true);
      });

      if (!this.formOneErrored) this.currentPosition = 2;
    },

    /**
     * Checks and validates that the form two has completed correctly. Warning the user of all
     * requirement of the fields have not been completed correctly. If completed it will move on
     * with the form, othwerise say in the current location.
     */
    completeFormTwo: function() {
      this.formTwoErrored = false;

      Object.keys(this.getFormTwoResults).forEach((f) => {
        if (_.isNil(this.getFormTwoResults[f])) this.formTwoErrored = true;
        this.$refs[f].validate(true);
      });

      if (!this.formTwoErrored) this.currentPosition = 3;
    },

    /**
     * Adds a new optional dog related to form 3, this is optional but calling into this will
     * attempt to add the dog, filtering out duplicates if the form field is clicked multiple times.
     */
    addOptionalDog: function() {
      this.formDogsHasErrors = false;

      const dogFormResult = this.getFormDogResult;

      Object.keys(dogFormResult).forEach((f) => {
        if (_.isNil(dogFormResult[f])) this.formDogsHasErrors = true;
        this.$refs[f].validate(true);
      });

      if (!this.formDogsHasErrors) {
        const dogCreation = {
          name: this.dogName,
          age: this.dogAge,
          race: this.dogRace,
          favoriteToy: this.dogFavoriteToy,
          favoriteFood: this.dogFavoriteFood
        };

        // validate that the dog is not a duplicate before attempting to add it.
        if (!this.duplicateDog(dogCreation)) {
          this.dogInformation.push(dogCreation);
          this.dogName = null;
          this.dogAge = null;
          this.dogRace = null;
          this.dogFavoriteToy = null;
          this.dogFavoriteFood = null;
        }
      }
    },

    /**
     * Clears all the curerent dogs in the dogs list, resetting the page layout back to having no
     * dogs. Vuejs will reflect this changes automatically after seeing that the array has changed.
     */
    clearDogsList: function() {
      this.dogInformation = [];
    },

    /**
     * Checks to see if that dog already exists in the dog list, making sure duplicate dogs don't exist.
     * @param {object} dogObject the dog object to check if it already exists.
     */
    duplicateDog: function(dogObject) {
      let duplicateDog = false;

      _.forEach(this.dogInformation, (dog) => {
        if (_.isEqual(dog, dogObject)) duplicateDog = true;
      });

      return duplicateDog;
    },

    /**
     * Marks the current user as no longer new, leading to the user no longer needing to complete
     * the introduction page. If this is not done then the user will always be directed to complete
     * the form again.
    //  */
    markUserNotNew: async function() {
      await firebaseWrapper.updateProfile({ new: false });
    }
  }
};
</script>
