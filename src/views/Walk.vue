<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title primary class="subheading text-sm-left">Walk Request</v-card-title>
        </v-card>
      </v-flex>

      <v-flex md6 xs12>
        <v-card>
          <v-card-title>
            <div class="text-xs-center" style="margin: auto">
              <v-avatar size="50">
                <img :src="owner.photo" alt="avatar">
              </v-avatar>
              <div style="margin-top: 5px; margin-bottom: -25px;">
                Owner
                <span v-if="isOwner">(You)</span>
                <span v-else>(them)</span>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="core-text-inner">
              <div>Name: {{ owner.name }}</div>
              <div>Email: {{ owner.email }}</div>
              <div>Age: {{ owner.age }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex md6 xs12>
        <v-card>
          <v-card-title>
            <div class="text-xs-center" style="margin: auto">
              <v-avatar size="50">
                <img :src="walker.photo" alt="avatar">
              </v-avatar>
              <div style="margin-top: 5px; margin-bottom: -25px;">
                Walker
                <span v-if="!isOwner">(You)</span>
                <span v-else>(them)</span>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="core-text-inner">
              <div>Name: {{ walker.name }}</div>
              <div>Email: {{ walker.email }}</div>
              <div>Age: {{ walker.age }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs12>
        <v-card>
          <v-card-text class="px-0">12</v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <GmapMap
            ref="mapRef"
            :center="this.walkLocation"
            :zoom="14"
            :options="googleMapsSettings"
            class="maps-style"
          >
            <GmapMarker ref="mapMarkerRef" :position="this.walk.location"/>
          </GmapMap>
        </v-card>
      </v-flex>
      <v-flex md6 xs12>
        <v-card elevation="0" style="background: none">
          <v-card-title>Notes</v-card-title>
          <v-card-text dense>
            <ul class="text-xs-left">
              <li color="gray lighten-3" :key="index" v-for="(item, index) in walk.notes">{{ item }}</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex md6 xs12>
        <v-card elevation="0" style="background: none">
          <v-card-title>History</v-card-title>
          <v-card-text>
            <v-timeline dense>
              <v-timeline-item
                color="primary lighten-3"
                small
                v-for="(item, index) in walk.history"
                :key="index"
              >
                <v-layout>
                  <v-flex class="text-sm-left">{{ item }}</v-flex>
                </v-layout>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-flex>
      <DogsGrid :profile="this.owner" :dogs="this.dogs" :owner-id="this.walk.owner"/>
    </v-layout>
  </v-container>
</template>

<script>
import firebaseWrapper from '../lib/firebaseWrapper.js';
import DogsGrid from '@/components/DogsGrid.vue';

export default {
  data: function() {
    return {
      // the walker of the dogs.
      walker: {},
      // the owner of the dogs.
      owner: {},
      // the walk object.
      walk: {},
      // the dogs on the walk.
      dogs: {},
      // the walk location, this will be updated once we have actually got the walk location.
      walkLocation: { lat: 1, lng: 1 },
      // the local walk id, used / passed through the url path, this includes the use of gathering
      // walk related data and the people on the walks.
      localWalkId: '',
      // if the user is the current owner, this will be used for displaying the related accepting,
      // rejceting or completing the walk. Including the displaying of related information.
      isOwner: false,
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

  /**
   * When the single walk is first created, we will just have a single id related to the walk, with
   * this walk id will result in gathering all the related information about a given walk and two
   * ids, these ids will be used to gather the profiles for the given walker and owner. Both
   * required to display the related information.
   *
   * Depending on what kind of person the current viewer is (walker, owner), will depend on how we
   * display and adjust the page.
   */
  created: async function() {
    // the local walk id, this is the id that is used to reference the id, this will be used to
    // gather the walk and the people related to the walk (e.g walker and owner).
    this.localWalkId = this.$route.params.id || '';

    // gather the related walker and owners profile including the walker.
    this.walk = await firebaseWrapper.getWalkByKey(this.localWalkId);
    this.owner = await firebaseWrapper.getProfile(this.walk.owner);
    this.walker = await firebaseWrapper.getProfile(this.walk.walker);

    // determine if the current authenticated user is the walker or the owner so we can do simple
    // little displays indercating who is who.
    this.isOwner = firebaseWrapper.getUid() === this.walk.owner;
    this.walkLocation = this.walk.location;

    // lets revserse the history logs so that the related history object is in order when displaying
    // it for the given user. This will correctly format it for a timeline.
    this.walk.history = this.walk.history.reverse();

    // lets build up the dogs object for settings.
    const dogs = {};

    // iterate and perform the requests for gathering the dogs, for of to allow the syncing of the
    // request process. Then set the dogs onto the object.
    for (const dog of this.walk.dogs) {
      dogs[dog] = await firebaseWrapper.getSingleDog(this.walk.owner, dog);
    }

    // update the current set walks.
    this.dogs = dogs;

    // setup all related listeners, including the walk (owner and walker).
    await this.setupWalkListener();
  },

  methods: {
    // if changes occure on the current walk, we want to update the whole object when the changes
    // happen. Keeping all related information live. This will also setup listeners for the owner
    // and the walker, just incase the profiles change at anypoint.
    setupWalkListener: async function() {}
  },

  components: {
    DogsGrid
  }
};
</script>

<style scoped>
.point {
  background: none;
}
.maps-style {
  max-width: 100%;
  min-width: 100%;
  min-height: 250px;
}
</style>
