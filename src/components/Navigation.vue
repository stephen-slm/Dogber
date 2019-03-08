<template>
  <div>
    <v-navigation-drawer app v-model="drawer">
      <v-list>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <img class="avatar" alt="Peoples Image" :src="imageUrl">
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ name }}</v-list-tile-title>
            <v-list-tile-sub-title class="caption">{{ email }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider dark></v-divider>
        <v-list-tile :to="'/'">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text">Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="'/me'">
          <v-list-tile-action>
            <v-icon>person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text">My Profile</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="'/me/walks'">
          <v-list-tile-action>
            <v-icon>directions_walk</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text">My Walks</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="'/walks'">
          <v-list-tile-action>
            <v-icon>location_on</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text">Walk Finder</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="'/settings'">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text">Settings</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider dark></v-divider>
        <v-list-tile :to="'/signout'">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text">Sign Out</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app>
      <v-toolbar-title>
        <v-toolbar-side-icon v-if="$vuetify.breakpoint.mdAndDown" @click.stop="drawer = !drawer"/>
        <span class="subheading">{{ getWelcome }}</span>
      </v-toolbar-title>
      <v-spacer/>

      <v-btn icon>
        <v-badge overlap>
          <span v-if="notificationCount > 0" slot="badge" small>{{ notificationCount }}</span>
          <v-icon color="rgba(41, 41, 41, 0.54)">notifications</v-icon>
        </v-badge>
      </v-btn>
      <v-btn icon large>
        <v-avatar size="32px" tile>
          <img src="../assets/logo.png" alt="Dogber">
        </v-avatar>
      </v-btn>
    </v-toolbar>
  </div>
</template>

<script>
import * as _ from 'lodash';
import firebaseWrapper from '../lib/firebaseWrapper.js';

export default {
  name: 'ToolBarNavigation',

  props: {
    // show is passed through by the application, this is determined if we are authenticated or not,
    // which results in displaying the navigation ui.
    show: Boolean
  },

  data: function() {
    return {
      // The notification count that will be displayed above the navigation icon within the nav bar.
      notificationCount: 0,
      drawer: null,
      welcomeMessage: '',
      imageUrl: '',
      name: '',
      email: '../assets/placeholder.jpg'
    };
  },

  created: function() {
    const user = firebaseWrapper.getCurrentUser();

    // validate that we are authenticated before we attempt to get the notifications
    if (!_.isNil(user)) {
      this.name = user.displayName || '../assets/placeholder.jpg';
      this.imageUrl = user.photoURL || '';
      this.email = user.email || '';

      const notificationReference = firebaseWrapper.getNotificationReference();

      // If we are authenticated, then when a new notification is added we will automatically update
      // the ui to display the new notification count.
      notificationReference.on('value', (snapshot) => {
        this.notificationCount = _.size(snapshot.val());
      });
    }
  },

  computed: {
    getWelcome: function() {
      const currentHour = new Date().getHours();
      const name = this.name.split(' ')[0];

      if (currentHour < 12) return `Morning, ${name}`;
      if (currentHour < 18) return `Afternoon, ${name}`;
      return `Evening, ${name}`;
    }
  },

  methods: {}
};
</script>

<style scoped>
.avatar {
  vertical-align: middle;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
</style>
