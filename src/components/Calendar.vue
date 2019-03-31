<template>
  <v-layout wrap>
    <v-flex xs12 class="mb-3">
      <v-sheet height="500">
        <v-calendar ref="calendar" v-model="start" type="month" :end="end">
          <template v-slot:day="{ date }">
            <template v-for="event in eventsMap[date]">
              <v-menu :key="event.id" v-model="event.open" full-width offset-x>
                <template v-slot:activator="{ on }">
                  <div v-if="!event.time" v-ripple class="my-event" v-on="on" v-html="event.title"></div>
                </template>
                <v-card color="grey lighten-4" min-width="350px" flat>
                  <v-toolbar color="primary" dark>
                    <v-toolbar-title v-html="event.title"></v-toolbar-title>
                    <v-spacer></v-spacer>
                  </v-toolbar>
                  <v-card-text>
                    <div>{{ event.details }}</div>
                    <div>
                      Status:
                      <span :style="{ color: getStatusColor(event.status) }">{{
                        getStatus(event.status)
                      }}</span>
                    </div>
                    <div>
                      {{ new Date(event.start).toLocaleString() }} -
                      {{ new Date(event.end).toLocaleString() }}
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn flat color="secondary" @click="event.open = false">Close</v-btn>
                    <v-btn flat color="primary" :to="`/walks/${event.walkId}`">View</v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </template>
          </template>
        </v-calendar>
      </v-sheet>
    </v-flex>

    <v-flex sm4 xs12 class="text-sm-left text-xs-center">
      <v-btn @click="$refs.calendar.prev()"> <v-icon dark left>keyboard_arrow_left</v-icon>Prev </v-btn>
    </v-flex>
    <v-flex sm4 xs12 class="text-xs-center"></v-flex>
    <v-flex sm4 xs12 class="text-sm-right text-xs-center">
      <v-btn @click="$refs.calendar.next()">
        Next
        <v-icon right dark>keyboard_arrow_right</v-icon>
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
import * as _ from 'lodash';

import * as firebaseConstants from '../constants/firebaseConstants.js';
import firebaseWrapper from '../lib/firebaseWrapper.js';

export default {
  data: function() {
    return {
      type: 'month',
      start: new Date().toDateString(),
      end: '',
      walks: {}
    };
  },

  created: async function() {
    this.walks = await firebaseWrapper.getAllWalks();

    for (const walkid of Object.keys(this.walks)) {
      const walk = this.walks[walkid];

      this.walks[walkid].walkId = this.walks[walkid].id;
      this.walks[walkid].id = walkid;

      const isOwner = firebaseWrapper.getUid() === walk.owner;

      const walker = await firebaseWrapper.getProfile(walk.walker);
      const owner = await firebaseWrapper.getProfile(walk.owner);

      this.walks[walkid].title = 'Walk Request 🏃‍♂️';

      if (owner) {
        this.walks[walkid].details = `Walk with ${walker.name || walker.email}`;
      } else {
        this.walks[walkid].details = `Walk with ${owner.name || owner.email}`;
      }
    }
  },

  computed: {
    // convert the list of events into a map of lists keyed by date
    eventsMap() {
      const map = {};

      _.forEach(this.walks, (walk) => {
        const startDate = walk.start.split('T')[0];
        (map[startDate] = map[startDate] || []).push(walk);
      });

      return map;
    }
  },

  methods: {
    open(event) {
      alert(event.title);
    },
    // gets the display related text for a given walk message, this is what the user is going to see
    // as the text for a given status. This has to be clean and easy to read.
    getStatus: function(status) {
      switch (status) {
        case firebaseConstants.WALK_STATUS.ACTIVE:
          return 'Active';
        case firebaseConstants.WALK_STATUS.PENDING:
          return 'Pending';
        case firebaseConstants.WALK_STATUS.CANCELLED:
          return 'Cancelled';
        case firebaseConstants.WALK_STATUS.COMPLETE:
          return 'Complete';
        case firebaseConstants.WALK_STATUS.REJECTED:
          return 'Rejected';
        default:
          return 'N/A';
      }
    },
    // gets the display related text color for a given walk message, this is what the user is going to see
    // as the text for a given status. This has to be clean and easy to read.
    getStatusColor: function(status) {
      switch (status) {
        case firebaseConstants.WALK_STATUS.ACTIVE:
        case firebaseConstants.WALK_STATUS.COMPLETE:
          return 'green';
        case firebaseConstants.WALK_STATUS.PENDING:
        case firebaseConstants.WALK_STATUS.CANCELLED:
          return 'orange';
        case firebaseConstants.WALK_STATUS.REJECTED:
          return 'red';
        default:
          return 'black';
      }
    }
  }
};
</script>

<style scoped></style>
