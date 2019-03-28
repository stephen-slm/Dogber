<template>
  <v-layout class="request-walk">
    <v-btn v-if="canRequest" @click="requestingWalk = true" flat>Request Walk</v-btn>
    <v-dialog v-model="requestingWalk" max-width="450" :fullscreen="isMobile">
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
                        required
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
                        required
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
                        required
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
                <v-flex>
                  <v-select
                    ref="dogs"
                    v-model="walk.dogs"
                    :items="ownerDogs"
                    label="Dog Selection"
                    placeholder="Select a Dog"
                    required
                    auto-select-first
                    item-text="name"
                    item-value="id"
                    multiple
                  ></v-select>
                </v-flex>
                <v-flex>
                  <v-card-text>Drag the pointer to the location of the walk.</v-card-text>
                  <GmapMap
                    ref="mapRef"
                    :center="location"
                    :zoom="14"
                    :options="googleMapsSettings"
                    class="maps-style"
                  >
                    <GmapMarker ref="mapMarkerRef" :position="location" :clickable="true" :draggable="true" />
                  </GmapMap>
                </v-flex>
                <v-flex style="margin-top: 25px">
                  <v-text-field label="Notes" v-model="walk.notes"></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat="flat" @click="requestingWalk = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click="addWalkRequest()">Request</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import _ from 'lodash';
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
      walker: {},
      // The owners profile object, this is the person who will be owning the dog. This object is
      // going to be reflecting the persons profile, used for displaying reasons.
      owner: {},
      // the list of all the owner dogs, this is due to the current user selecting what dog or dogs
      // they want walked during the requesting process.
      ownerDogs: [],
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
        location: { lat: 1, lng: 1 },
        notes: '',
        dogs: null
      },
      // panel based models, these models are used to show and hide the different kinds of inputs,
      // including date/time inputs. dropdowns and any releated popups.
      models: {
        startDate: false,
        startTime: false
      },
      // This will be set as the current loading location of the given user. Allows for quickly
      // jumping to the users location to help with finding a walking location (as generally it will
      // be related around the user).
      location: { lat: 1, lng: 1 },
      // Cleans up the google maps controls to better allow for selecting a location for the user.
      googleMapsSettings: {
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: false,
        disableDefaultUi: true
      }
    };
  },

  created: async function() {
    this.canRequest = this.showFormButton;

    // lets gather the related profiles for the given owner id and the given walker id, these will
    // be the values that are getting displayed on the screen.
    this.walker = await firebaseWrapper.getProfile(this.walkerId);
    this.owner = await firebaseWrapper.getProfile(this.ownerId);

    // create / generate the dog array. Used in the selection process.
    this.ownerDogs = _.map(await firebaseWrapper.getAllDogs(this.ownerId), (dog, index) => {
      dog.id = index;
      return dog;
    });

    console.log(this.ownerDogs);

    // load in the current location for the user
    this.currentLocation();
  },

  mounted: function() {
    this.$refs.mapRef.$mapPromise.then((map) => {
      map.panTo(this.location);
    });
  },

  methods: {
    // if the given walk request form is validated correctly, and all the information is filled we
    // will attempt to request the walk within the firebase wrapper, creating the walk for all
    // users. Making sure to reset the form and close it after completing.
    addWalkRequest: async function() {
      // update the marker location for the given walk before attempting to validate it.
      const marker = await this.$refs.mapMarkerRef.$markerPromise;
      this.walk.location = { lat: marker.position.lat(), lng: marker.position.lng() };

      if (this.$refs.form.validate()) {
        const { location, notes, dogs } = this.walk;

        const startDate = new Date(this.walk.startDate);
        startDate.setHours(this.walk.startTime.split(':')[0], this.walk.startTime.split(':')[1]);

        const endDate = new Date(this.walk.startDate);
        endDate.setHours(this.walk.endTime.split(':')[0], this.walk.endTime.split(':')[1]);

        await firebaseWrapper.createWalkRequest(
          this.walkerId,
          this.ownerId,
          dogs,
          startDate,
          endDate,
          location,
          notes.trim() === '' ? undefined : notes
        );

        this.$refs.form.reset();
        this.requestingWalk = false;
      }
    },
    // sets the current location for the current user based on the geolocation of the device. Used
    // for helping to select the correc position for the given user on the map.
    currentLocation: function() {
      navigator.geolocation.getCurrentPosition((position) => {
        this.location.lat = position.coords.latitude;
        this.location.lng = position.coords.longitude;
        this.walk.location = this.location;
      });
    }
  },

  computed: {
    computedStartDate() {
      return this.walk.startDate ? moment(this.walk.startDate).format('dddd, MMMM Do YYYY') : '';
    },
    // returns true if and only if the display is a mobile device.
    isMobile: function() {
      return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
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

.maps-style {
  max-width: 450px;
  min-width: 250px;
  min-height: 250px;
}
</style>
