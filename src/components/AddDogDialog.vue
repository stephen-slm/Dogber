<template>
  <v-layout>
    <v-btn v-if="canAdd" @click="addingDog = true" flat color="primary">Add</v-btn>
    <v-dialog v-model="addingDog" max-width="290">
      <v-card>
        <v-card-title class="headline">Adding a new dog?</v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-layout wrap>
                <v-flex>
                  <v-text-field ref="name" :rules="requiredRules" label="Name" required></v-text-field>
                </v-flex>
                <v-flex>
                  <v-text-field ref="age" :rules="numberRules" label="Age" required></v-text-field>
                </v-flex>
                <v-flex>
                  <v-text-field ref="race" :rules="requiredRules" label="Race" required></v-text-field>
                </v-flex>
                <v-flex>
                  <v-text-field ref="toy" :rules="requiredRules" label="Favorite Toy" required></v-text-field>
                </v-flex>
                <v-flex>
                  <v-text-field
                    ref="food"
                    :rules="requiredRules"
                    label="Favorite Food"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
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
import _ from 'lodash';
import firebaseWrapper from '../lib/firebaseWrapper.js';

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
      addingDog: false,
      valid: true,
      requiredRules: [(v) => !!v || 'Field is required'],
      numberRules: [
        (v) => !!v || 'Field is required',
        (v) => !_.isNaN(Number(v)) || 'Field must be a number.'
      ]
    };
  },

  created: async function() {
    this.canAdd = this.showAddingDog;
  },

  methods: {
    // adds the new dog from the current authenticated user. This is used when the adding
    // button is pressed.
    addNewDog: async function() {
      if (this.$refs.form.validate()) {
        await firebaseWrapper.addDog(
          this.$refs.name.lazyValue.trim(),
          Number(this.$refs.age.lazyValue.trim()),
          this.$refs.race.lazyValue.trim(),
          this.$refs.toy.lazyValue.trim(),
          this.$refs.food.lazyValue.trim()
        );

        this.$refs.form.reset();
        this.addingDog = false;
      }
    }
  },

  watch: {
    // if the props change, we must update the local value to refresh the props (its bad pratice to
    // do it directly).
    showAddingDog: function(newValue) {
      this.canAdd = newValue;
    }
  }
};
</script>

<style scoped></style>
