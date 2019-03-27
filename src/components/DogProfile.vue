<template>
  <v-card width="200" height="200" class="dog-profile-card">
    <v-card-title class="dog-profile-title">
      <v-img width="50" height="50" src="https://dogber.co.uk/img/logo.001118af.png" contain />
    </v-card-title>
    <v-card-text class="dog-profile-text">
      <div>
        <div>{{ dog.name }}, {{ dog.age }}</div>
        <div class="caption grey--text">{{ dog.race }}</div>

        <div class="caption">
          {{ dog.name }} loves to play with his {{ dog.favoriteToy }} and then rest eating
          {{ dog.favoriteFood }}
        </div>
      </div>
    </v-card-text>
    <v-card-actions class="dog-profile-actions">
      <v-btn v-if="canDelete" @click="deleteCurrentDog" flat color="primary">Delete</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import firebaseWrapper from '../lib/firebaseWrapper';

export default {
  props: {
    // the dog that is going to be dipslayed.
    dog: {
      type: Object,
      default: () => {}
    },
    // the id of the related dog, this will be used to display the related options for deleting the
    // given dog.
    id: {
      type: String,
      default: ''
    },
    // the id of the owner of the dog, required for the deletion process of the dog.
    ownerId: {
      type: String,
      default: ''
    }
  },

  // datas related to the current dog profile, focusing around if actions can be performed on the
  // dog. e.g if it can be deleted (displaying the button).
  data: function() {
    return {
      canDelete: false
    };
  },

  // when the dog profile is first created, we can just go gather the current authenticated user and
  // validate the the current user is who the owner is, this means that they have the right to
  // perform the deleting.
  created: async function() {
    const currentProfileId = firebaseWrapper.getUid();

    // if it is the current owner,then lets allow deleting.
    if (this.ownerId === currentProfileId) this.canDelete = true;
  },

  methods: {
    // deletes the current dog from the current authenticated user. This is used when the delete
    // button is pressed, all ui elements will reflect this remove.
    deleteCurrentDog: async function() {
      await firebaseWrapper.removeDog(this.ownerId, this.id);
    }
  }
};
</script>

<style scoped>
.dog-profile-text {
  padding-top: 0px;
  padding-bottom: 0px;
}

.dog-profile-title {
  padding-top: 5px;
  padding-bottom: 0px;
}

.dog-profile-actions {
  justify-content: center;
  text-align: right;
  align-content: right;
  align-items: right;
}

.dog-profile-card {
  margin: 0 auto;
}
</style>
