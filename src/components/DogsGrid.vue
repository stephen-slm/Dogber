<template>
  <v-flex>
    <v-card elevation="0" color="transparent">
      <v-card-title class="subheading text-sm-left">
        {{ profile.name }}'s Dogs
        <AddDogDialog :show-adding-dog="canAdd" />
      </v-card-title>
      <v-card-text>
        <div v-if="dogs == null">No Dogs 😓</div>
        <v-layout text-xs-center row wrap style="float: left;">
          <v-flex v-for="(item, index) in dogs" :key="item.timestamp">
            <DogProfile class="dogs-item" :owner-id="ownerId" :id="index" :dog="item" />
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
import firebaseWrapper from '../lib/firebaseWrapper.js';
import DogProfile from '@/components/DogProfile.vue';
import AddDogDialog from '@/components/AddDogDialog.vue';

export default {
  props: {
    // the dogs that is going to be dipslayed.
    dogs: {
      type: Object,
      default: () => {}
    },
    // The profile of the owner being viewed.
    profile: {
      type: Object,
      default: () => {}
    },
    // the given id of the owner of the dogs.
    ownerId: {
      type: String,
      default: ''
    }
  },

  // datas related to the current dog profile, focusing around if actions can be performed on the dog.
  //   e.g if it can be add a new dog (displaying the button).
  data: function() {
    return {
      canAdd: false
    };
  },

  // when the dog profile is first created, we can just go gather the current authenticated user and
  // validate the the current user is who the owner is, this means that they have the right to
  // perform the adding.
  created: async function() {
    const currentProfileId = firebaseWrapper.getUid();

    // if it is the current owner,then lets allow deleting.
    if (this.ownerId === currentProfileId) this.canAdd = true;
  },

  methods: {},

  components: {
    DogProfile,
    AddDogDialog
  }
};
</script>

<style scoped></style>
