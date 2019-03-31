<template>
  <v-container class="container">
    <v-card class="settings-container">
      <form>
        <div class="text-sm-left gray lighten-1">Passive</div>
        <v-divider />
        <v-switch v-model="dark" label="Dark Mode"></v-switch>
        <div class="text-sm-left gray lighten-1">Account Related</div>
        <v-divider />
        <v-switch v-model="activeWalker" label="Active Walker"></v-switch>
        <v-divider style="margin-bottom: 18px" />
        <v-expansion-panel>
          <v-expansion-panel-content>
            <template v-slot:header>
              <div>Edit: Personal Information</div>
            </template>
            <v-card>
              <v-layout justify-center style="margin-bottom: 13px">
              <v-flex xs12 sm6 md6>
                <v-text-field ref="name" v-model="name" label="Full Name" disabled></v-text-field>
                <v-text-field ref="email" v-model="email" label="E-Mail" disabled></v-text-field>
                <v-text-field
                  ref="age"
                  v-model="age"
                  :rules="[
                    () => !!age || 'This field is required']"
                  label="Your age"
                  placeholder="23"
                  required
                ></v-text-field>
                <v-text-field
                  ref="contactNumber"
                  v-model="contactNumber"
                  :rules="[
                    () => !!contactNumber || 'This field is required']"
                  label="Contact Number"
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>
            </v-card>
            <v-layout justify-center style="margin-bottom: 15px">
              <v-btn color="primary" @click="completeFormPersonal">Change</v-btn>
            </v-layout>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-divider style="margin-bottom: 18px" />
        <v-expansion-panel>
          <v-expansion-panel-content>
            <template v-slot:header>
              <div>Edit: Service Information</div>
            </template>
            <v-card>
              <v-layout justify-center style="margin-bottom: 13px">
              <v-flex xs12 sm6 md6>
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
                ref="minPrice"
                v-model="minPrice"
                :rules="[() => !!minPrice || 'This field is required']"
                label="Minimum Price required for services"
                placeholder="5.00"
                prefix="£"
                required
              ></v-text-field>
              <v-text-field
                ref="maxPrice"
                v-model="maxPrice"
                :rules="[() => !!maxPrice || 'This field is required']"
                label="Maximum Price required for services"
                placeholder="12.50"
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
            <v-layout justify-center style="margin-bottom: 15px">
              <v-btn color="primary" @click="completeFormService">Change</v-btn>
            </v-layout>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-divider style="margin-bottom: 25px" />
        <DeleteAccountAgreement />
      </form>
    </v-card>
  </v-container>
</template>

<script>
import firebaseWrapper from '../lib/firebaseWrapper.js';
import DeleteAccountAgreement from '@/components/DeleteAccountAgreement.vue';
import _ from 'lodash';

export default {
  name: 'Settings',

  data: function() {
    return {
      countries: [],

      dark: false,
      activeWalker: false,

      // Data from personal information form
      name: '',
      email: '',
      age: '',
      contactNumber: '',

      // Data from service information form
      price: '',
      statusTypes: ['Dog Owner', 'Dog Walker'],
      status: '',
      minPrice: '',
      maxPrice: '',
      paymentMethods: ['Bank Transfer', 'Cash', 'Online Payment'],
      payment: '',

      // Checkings for form one (personal information)
      formOneErrored: false,
      // Checkings for form two (service information)
      formTwoErrored: false,
    };
  },

  // when the page is first loaded, we want to be able to prefill alot of information about the
  // current account, keeping the information relevent and related to whats going on with the
  // account. Letting the user know that changes are meaningful.
  created: async function() {
    const currentProfile = await firebaseWrapper.getProfile();

    // If the profile is new redirect to introduction
    if (currentProfile.new) {
      this.$router.push({ name: 'introduction' });
    }

    // update active state
    this.activeWalker = currentProfile.walk.active;

    // Get the data from database
    this.name = currentProfile.name;
    this.email = currentProfile.email;
    this.age = currentProfile.age;
    this.contactNumber = currentProfile.contact_number;
    this.status = currentProfile.status_type;
    this.minPrice = currentProfile.walk.price.min;
    this.maxPrice = currentProfile.walk.price.max;
    this.payment = currentProfile.payment_method;

    // get the object of countries to be used instead of hard coded into the file.
    const countriesReference = await firebaseWrapper.database.ref('/countries').once('value');
    this.countries = _.map(countriesReference.val(), (value) => value);
  },

  mounted: function() {
    if (localStorage.dark) this.dark = localStorage.dark === 'true' ? true : false;
  },


  computed: {
    /**
     * Gets the results from form 1. This is used for checkings
     */
    getFormPersonalResults: function() {
      return {
        age: this.age,
        contactNumber: this.contactNumber
      };
    },

    /**
     * Gets the results from form 2. This is used for checkings
     */
    getFormServiceResults: function() {
      return {
        status: this.status,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        payment: this.payment
      };
    }
  },

   methods: {
     /**
     * Checks and validates that the form Personal Information has completed correctly. Warning the user of all
     * requirement of the fields have not been completed correctly. If completed it will update the database,
     * othwerise say in the current location.
     */
     completeFormPersonal: async function() {

       // Checking for errors
      this.formOneErrored = false;
      Object.keys(this.getFormPersonalResults).forEach((f) => {
        if (_.isNil(this.getFormPersonalResults[f])) this.formOneErrored = true;
        this.$refs[f].validate(true);
      });

      // If the form has no errors then update the database
      if(!this.formOneErrored){
        await firebaseWrapper.updateAge(_.parseInt(this.age));
        await firebaseWrapper.updateContactNumber(_.parseInt(this.contactNumber));
      }
    },

    /**
     * Checks and validates that the form Service Information has completed correctly. Warning the user of all
     * requirement of the fields have not been completed correctly. If completed it will update the database,
     * othwerise say in the current location.
     */
    completeFormService: async function() {

      //Checking for errors
      this.formTwoErrored = false;
      Object.keys(this.getFormServiceResults).forEach((f) => {
        if (_.isNil(this.getFormServiceResults[f])) this.formTwoErrored = true;
        this.$refs[f].validate(true);
      });

      // If the form has no errors then update the database
      if(!this.formTwoErrored){
        await firebaseWrapper.updateStatusType(this.status);
        await firebaseWrapper.updateWalkCost(_.parseInt(this.minPrice), _.parseInt(this.maxPrice));
        await firebaseWrapper.updatePaymentMethod(this.payment);
      }
    },
   },
  

  watch: {
    // if the user enables dark mode, let the upper listening app trigger dark mode across the
    // application. This cannot just be set and must be emitted.
    dark: function(newValue) {
      this.$emit('set-dark', newValue);
    },

    // if the user updates there active state, reflect those changes on the database profile.
    activeWalker: async function(newValue) {
      await firebaseWrapper.adjustWalkActiveState(newValue);
    }
  },

  components: {
    DeleteAccountAgreement
  }
};
</script>

<style scoped>
.container {
  max-width: 500px;
}

.settings-container {
  padding: 25px;
}
</style>
