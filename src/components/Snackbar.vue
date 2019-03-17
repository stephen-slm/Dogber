<template>
  <v-snackbar :left="true" :auto-height="true" :bottom="true" v-model="showSnack" :timeout="timeout">
    <span :style="{ color: displayColor }">{{ text }}</span>
    <v-btn dark flat color="pink" @click="showSnack = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
export default {
  name: 'Snackbar',

  props: {
    color: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    error: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      default: false
    }
  },

  data: function() {
    return {
      timeout: 6000,
      showSnack: this.show,
      displayColor: this.color
    };
  },

  created: function() {},

  methods: {},

  watch: {
    show: function(value) {
      // we do this so that the timeout gets reset back, we don't want the user loosing out on
      // information. Doing this prevents that loss.
      if (value && this.showSnack) this.showSnack = false;

      this.showSnack = value;
    },

    color: function(value) {
      this.displayColor = value;
    },

    error: function() {
      if (this.error) {
        this.displayColor = '#ff5252';
        this.timeout *= 2;
      }

      if (!this.error) {
        this.displayColor = null;
        this.timeout /= 2;
      }
    },

    showSnack: function(value) {
      if (!value) {
        this.$emit('snackbar-end');
      }
    }
  }
};
</script>
