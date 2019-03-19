<template>
  <v-stepper v-model="e1">
    <v-stepper-header>
      <v-stepper-step :complete="e1 > 1" step="1">About you</v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step :complete="e1 > 2" step="2">Service</v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step :complete="e1 > 3" step="3">About your Dogs</v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step :complete="e1 > 4" step="4">Terms of use</v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1">
        <v-card class="mb-5" height="auto">
          <p style="text-align:center">
            Welcome to Dogber! Thank you for joining our platform, to complete your application we require
            extra information. This will help us to create your profile
          </p>
          <v-layout justify-center>
            <v-flex xs12 sm6 md3>
              <v-text-field ref="name" v-model="name" label="Full Name" disabled="true"></v-text-field>
              <v-text-field ref="email" v-model="email" label="E-Mail" disabled="true"></v-text-field>
              <v-text-field
                ref="address"
                v-model="address"
                :rules="[
                  () => !!address || 'This field is required',
                  () => (!!address && address.length <= 25) || 'Address must be less than 25 characters',
                  addressCheck
                ]"
                label="Address Line"
                placeholder="22 Cliverton Road"
                counter="25"
                required
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

        <v-btn color="primary" @click="submit1">Continue</v-btn>
        <v-btn color="warning" @click="resetForm_1()">Reset</v-btn>
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
              <v-select
                ref="price"
                v-model="price"
                :rules="[() => !!price || 'This field is required']"
                :items="priceRange"
                label="Price range"
                placeholder="Select..."
                required
              ></v-select>
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

        <v-btn color="primary" @click="submit2">Continue</v-btn>
        <v-btn outline color="indigo" @click="e1 = 1">Back</v-btn>
        <v-btn color="warning" @click="resetForm_2()">Reset</v-btn>
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
                    <v-flex xs6>
                      <v-card>
                        <v-card-text class="px-0">Information about your Dogs</v-card-text>
                        <v-layout justify-center>
                          <v-flex xs12 sm10 md8 lg6>
                            <v-card ref="formDog">
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
                                  <v-tooltip v-if="formHasErrors" left></v-tooltip>
                                </v-slide-x-reverse-transition>
                                <v-btn color="primary" flat @click="add">Add</v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-flex>
                        </v-layout>
                      </v-card>
                    </v-flex>
                    <v-flex xs6>
                      <v-card>
                        <v-card-text>Your Dogs added</v-card-text>
                        <v-container grid-list-md text-xs-center>
                          <v-layout row wrap>
                            <v-flex xs6 v-for="dog in dogInformation" :key="dog">
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
                                        <div class="headline">{{ dog.dogName }}</div>
                                        <div>Age: {{ dog.dogAge }}</div>
                                        <div>Race: {{ dog.dogRace }}</div>
                                      </div>
                                    </v-card-title>
                                  </v-flex>
                                </v-layout>
                                <v-divider light></v-divider>
                                <v-card-actions class="pa-2">Toy:
                                  <v-spacer></v-spacer>
                                  <p>{{ dog.dogFavoriteToy }}</p>
                                </v-card-actions>
                                <v-card-actions class="pa-2">Food:
                                  <v-spacer></v-spacer>
                                  <p>{{ dog.dogFavoriteFood }}</p>
                                </v-card-actions>
                              </v-card>
                            </v-flex>
                          </v-layout>
                        </v-container>
                        <v-divider class="mt-5"></v-divider>
                        <div style="margin-top: 3px">
                          <v-btn color="warning" flat @click="resetDogList">Reset List</v-btn>
                        </div>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card>

        <v-btn color="primary" @click="e1 = 4">Continue</v-btn>
        <v-btn outline color="indigo" @click="e1 = 2">Back</v-btn>
      </v-stepper-content>
      <v-stepper-content step="4">
        <v-card class="mb-5" height="auto">
          <v-layout justify-center>
            <v-flex xs6>
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
        <v-btn color="primary" @click="updateProfile">Accept & Finish</v-btn>
        <v-btn outline color="indigo" @click="e1 = 3">Back</v-btn>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import firebaseWrapper from '@/lib/firebaseWrapper';
export default {
  name: 'Introduction',
  data() {
    return {
      e1: 0,
      countries: [
        'Afghanistan',
        'Albania',
        'Algeria',
        'Andorra',
        'Angola',
        'Anguilla',
        'Antigua &amp; Barbuda',
        'Argentina',
        'Armenia',
        'Aruba',
        'Australia',
        'Austria',
        'Azerbaijan',
        'Bahamas',
        'Bahrain',
        'Bangladesh',
        'Barbados',
        'Belarus',
        'Belgium',
        'Belize',
        'Benin',
        'Bermuda',
        'Bhutan',
        'Bolivia',
        'Bosnia &amp; Herzegovina',
        'Botswana',
        'Brazil',
        'British Virgin Islands',
        'Brunei',
        'Bulgaria',
        'Burkina Faso',
        'Burundi',
        'Cambodia',
        'Cameroon',
        'Cape Verde',
        'Cayman Islands',
        'Chad',
        'Chile',
        'China',
        'Colombia',
        'Congo',
        'Cook Islands',
        'Costa Rica',
        'Cote D Ivoire',
        'Croatia',
        'Cruise Ship',
        'Cuba',
        'Cyprus',
        'Czech Republic',
        'Denmark',
        'Djibouti',
        'Dominica',
        'Dominican Republic',
        'Ecuador',
        'Egypt',
        'El Salvador',
        'Equatorial Guinea',
        'Estonia',
        'Ethiopia',
        'Falkland Islands',
        'Faroe Islands',
        'Fiji',
        'Finland',
        'France',
        'French Polynesia',
        'French West Indies',
        'Gabon',
        'Gambia',
        'Georgia',
        'Germany',
        'Ghana',
        'Gibraltar',
        'Greece',
        'Greenland',
        'Grenada',
        'Guam',
        'Guatemala',
        'Guernsey',
        'Guinea',
        'Guinea Bissau',
        'Guyana',
        'Haiti',
        'Honduras',
        'Hong Kong',
        'Hungary',
        'Iceland',
        'India',
        'Indonesia',
        'Iran',
        'Iraq',
        'Ireland',
        'Isle of Man',
        'Israel',
        'Italy',
        'Jamaica',
        'Japan',
        'Jersey',
        'Jordan',
        'Kazakhstan',
        'Kenya',
        'Kuwait',
        'Kyrgyz Republic',
        'Laos',
        'Latvia',
        'Lebanon',
        'Lesotho',
        'Liberia',
        'Libya',
        'Liechtenstein',
        'Lithuania',
        'Luxembourg',
        'Macau',
        'Macedonia',
        'Madagascar',
        'Malawi',
        'Malaysia',
        'Maldives',
        'Mali',
        'Malta',
        'Mauritania',
        'Mauritius',
        'Mexico',
        'Moldova',
        'Monaco',
        'Mongolia',
        'Montenegro',
        'Montserrat',
        'Morocco',
        'Mozambique',
        'Namibia',
        'Nepal',
        'Netherlands',
        'Netherlands Antilles',
        'New Caledonia',
        'New Zealand',
        'Nicaragua',
        'Niger',
        'Nigeria',
        'Norway',
        'Oman',
        'Pakistan',
        'Palestine',
        'Panama',
        'Papua New Guinea',
        'Paraguay',
        'Peru',
        'Philippines',
        'Poland',
        'Portugal',
        'Puerto Rico',
        'Qatar',
        'Reunion',
        'Romania',
        'Russia',
        'Rwanda',
        'Saint Pierre &amp; Miquelon',
        'Samoa',
        'San Marino',
        'Satellite',
        'Saudi Arabia',
        'Senegal',
        'Serbia',
        'Seychelles',
        'Sierra Leone',
        'Singapore',
        'Slovakia',
        'Slovenia',
        'South Africa',
        'South Korea',
        'Spain',
        'Sri Lanka',
        'St Kitts &amp; Nevis',
        'St Lucia',
        'St Vincent',
        'St. Lucia',
        'Sudan',
        'Suriname',
        'Swaziland',
        'Sweden',
        'Switzerland',
        'Syria',
        'Taiwan',
        'Tajikistan',
        'Tanzania',
        'Thailand',
        "Timor L'Este",
        'Togo',
        'Tonga',
        'Trinidad &amp; Tobago',
        'Tunisia',
        'Turkey',
        'Turkmenistan',
        'Turks &amp; Caicos',
        'Uganda',
        'Ukraine',
        'United Arab Emirates',
        'United Kingdom',
        'United States',
        'Uruguay',
        'Uzbekistan',
        'Venezuela',
        'Vietnam',
        'Virgin Islands (US)',
        'Yemen',
        'Zambia',
        'Zimbabwe'
      ],
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
      priceRange: ['0 - 5', '5 - 10', '10 - 20', '20+'],
      price: null,
      statusTypes: ['Dog Owner', 'Dog Walker'],
      status: null,
      paymentMethods: ['Bank Transfer', 'Cash', 'Online Payment'],
      payment: null,

      // For checking number 1, 2 and Dogs
      formHasErrors1: false,
      formHasErrors2: false,
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

  created: async function() {
    // get the currenlty authenticated user.
    const user = firebaseWrapper.getCurrentUser();
    const profile = await firebaseWrapper.getProfile();
    if (!profile.new) {
      this.$router.push({ name: 'home' });
    }
    this.name = profile.name;
    this.email = profile.email;
    this.image = user.photoURL;
  },

  computed: {
    form1() {
      return {
        address: this.address,
        city: this.city,
        state: this.state,
        zip: this.zip,
        country: this.country,
        contactNumber: this.contactNumber
      };
    },
    form2() {
      return {
        price: this.price,
        status: this.status,
        payment: this.payment
      };
    },
    formDog() {
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
    addressCheck() {
      this.errorMessages = this.address && !this.name ? "Hey! I'm required" : '';

      return true;
    },

    // Reset information for Form 1 and 2
    resetForm_1() {
      this.address = null;
      this.city = null;
      this.state = null;
      this.zip = null;
      this.country = null;
      this.contactNumber = null;
    },
    resetForm_2() {
      this.status = null;
      this.price = null;
      this.payment = null;
    },

    // Checking for form number 1
    submit1() {
      this.formHasErrors1 = false;

      Object.keys(this.form1).forEach((f) => {
        if (!this.form1[f]) this.formHasErrors1 = true;

        this.$refs[f].validate(true);
      });
      if (!this.formHasErrors1) {
        this.e1 = 2;
      }
    },

    // Checking for form number 2
    submit2() {
      this.formHasErrors2 = false;

      Object.keys(this.form2).forEach((f) => {
        if (!this.form2[f]) this.formHasErrors2 = true;

        this.$refs[f].validate(true);
      });
      if (!this.formHasErrors2) {
        this.e1 = 3;
      }
    },

    // Form number 3 (optional)
    // This section for dog information form
    add() {
      this.formDogsHasErrors = false;

      Object.keys(this.formDog).forEach((f) => {
        if (!this.formDog[f]) this.formDogsHasErrors = true;

        this.$refs[f].validate(true);
      });
      if (!this.formDogsHasErrors) {
        let dogCreation = {
          dogName: this.dogName,
          dogAge: this.dogAge,
          dogRace: this.dogRace,
          dogFavoriteToy: this.dogFavoriteToy,
          dogFavoriteFood: this.dogFavoriteFood
        };
        this.dogInformation.push(dogCreation);
        (this.dogName = null),
          (this.dogAge = null),
          (this.dogRace = null),
          (this.dogFavoriteToy = null),
          (this.dogFavoriteFood = null);
      }
    },
    resetDogList() {
      this.dogInformation = [];
    },
    updateProfile: async function() {
      await firebaseWrapper.updateProfile({ new: false });
    }
  }
};
</script>
