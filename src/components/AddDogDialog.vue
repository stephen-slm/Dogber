<template>
  <v-layout>
    <v-btn v-if="canAdd" @click="addingDog = true" flat color="primary">Add</v-btn>
    <v-dialog v-model="addingDog" max-width="290">
      <v-card>
        <v-card-title class="headline">Adding a new dog?</v-card-title>
        <v-card-text>
          <v-container>
            <v-layout wrap>
              <v-flex>
                <v-text-field label="Name" required></v-text-field>
              </v-flex>
              <v-flex>
                <v-text-field label="Age" required></v-text-field>
              </v-flex>
              <v-flex>
                <v-text-field label="Race" required></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn flat="flat" @click="addingDog = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click="addNewDog()">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
// import firebaseWrapper from '../lib/firebaseWrapper';

export default {
  props: {
    // triggered when the external requiring object is looking to display the feedback panel.
    showAddingDog: {
      type: Boolean,
      default: false
    }
  },

  // datas related to the current dog profile, focusing around if actions can be performed on the dog.
  //   e.g if it can be add a new dog (displaying the button).
  data: function() {
    return {
      canAdd: false,
      addingDog: false
    };
  },

  created: async function() {
    this.canAdd = this.showAddingDog;
  },

  methods: {
    // adds the new dog from the current authenticated user. This is used when the adding
    // button is pressed.
    addNewDog: async function() {}
  },

  watch: {
    showAddingDog: function(newValue) {
      this.canAdd = newValue;
    }
  }
};
</script>

<style scoped></style>
