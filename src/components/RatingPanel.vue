<template>
  <v-card>
    <v-layout row wrap class="wrapper">
      <v-flex class="top-text">
        <div :style="topColor">
          <v-rating small dense readonly hover half-increments v-model="rating"/>
        </div>
        <div class="grey--text lighten-2">{{ bottomText }}</div>
      </v-flex>
      <v-flex d-flex md3 class="text-right">
        <div>
          <slot></slot>
        </div>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  props: {
    rating: {
      type: [String, Number],
      default: 0
    },
    topTextColor: {
      type: [String, Number],
      default: ''
    },
    bottomText: {
      type: [String, Number],
      default: ''
    },
    bottomTextColor: {
      type: [String, Number],
      default: ''
    }
  },

  data: function() {
    return {
      topColor: `color: ${this.topTextColor}`
    };
  }
};
</script>

<style>
.top-text {
  text-align: left;
  margin-left: 20px;
  padding: 150px;
}

.text-right {
  text-align: right;
  margin: auto 5px auto auto;
}

.wrapper {
  padding: 5px;
}

@media only screen and (min-width: 960px) {
  .container {
    max-width: 1100px;
  }
}
</style>
