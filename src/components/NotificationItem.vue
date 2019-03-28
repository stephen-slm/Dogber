<template>
  <div>
    <v-list-tile :key="notification.title">
      <v-list-tile-content>
        <v-list-tile-title class="notification-title">{{ notification.title }}</v-list-tile-title>
        <v-list-tile-sub-title class="notification-message">{{ notification.message }}</v-list-tile-sub-title>
      </v-list-tile-content>

      <v-list-tile-action>
        <v-list-tile-action-text>{{ getTimeSince() }}</v-list-tile-action-text>
        <div>
          <v-btn
            href
            flat
            icon
            class="navigation-action action-navigation"
            active-class="v-btn--active remove-background-stick"
            v-if="notification.actionType === 'navigation'"
            :to="notification.actionLink"
          >
            <v-badge>
              <v-icon color="blue lighten-2">arrow_forward</v-icon>
            </v-badge>
          </v-btn>
          <v-btn icon flat>
            <v-badge>
              <v-icon color="lighten" @click="dismissNotification">clear</v-icon>
            </v-badge>
          </v-btn>
        </div>
      </v-list-tile-action>
    </v-list-tile>
    <v-divider v-if="insertDivider" :key="index"></v-divider>
  </div>
</template>

<script>
import moment from 'moment';
import firebaseWrapper from '../lib/firebaseWrapper.js';

export default {
  props: {
    notification: {
      type: Object,
      default: null
    },
    index: {
      type: String,
      default: ''
    },
    insertDivider: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    /**
     * Gets the notification style time since, this will go for minutes, then days and then months.
     * Allows the user to always know when a notification occured on the system.
     * @param {number} timestamp unix time stamp of when it was added.
     */
    getTimeSince: function(timestemp = this.notification.timestamp) {
      return moment(timestemp).fromNow();
    },

    /**
     * Dismisses the current notification, removing it from the ui interface and the firebase
     * section for the current authenticated user.
     */
    dismissNotification: async function() {
      await firebaseWrapper.removeNotification(this.index);
    }
  }
};
</script>

<style scoped>
.notification-message {
  white-space: normal;
}

.navigation-action {
  margin-right: 1px;
}

.remove-background-stick:before {
  background-color: inherit;
}
</style>
