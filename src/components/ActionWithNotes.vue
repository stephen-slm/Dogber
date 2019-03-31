<template>
  <div>
    <v-dialog v-model="showPanel" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ title }}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex>
                <slot></slot>
                <v-flex>
                  <v-text-field
                    v-model="notes"
                    clearable
                    maxlength="100"
                    counter
                    label="Notes"
                  ></v-text-field>
                </v-flex>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn id="feedcancel" color="blue darken-1" flat @click="showPanel = false">Close</v-btn>
          <v-btn id="feedsubmit" color="blue darken-1" flat @click="submitLocal()">{{ buttonText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn :disabled="disabled" flat @click="showPanel = true">{{ buttonText }}</v-btn>
  </div>
</template>

<script>
export default {
  props: {
    // triggered when the external requiring object is looking to display the panel.
    show: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
    },
    // the function that will be called with the resulting notes, this can be then used.
    submit: {
      type: Function,
      default: () => null
    }
  },

  data: function() {
    return {
      // the message that is bound + being submitted to the submitting function
      notes: '',
      // local value to seee if the screen should be displaying or not.
      showPanel: this.show || false
    };
  },

  methods: {
    // submit local will start the submission process while cleaning up behind, allowing for a
    // cleaner process. The external requiring process does not need to worry about clearning up
    // the text fields.
    submitLocal: async function() {
      const submittedFeedback = await this.submit(this.notes.trim());

      if (submittedFeedback) {
        this.showPanel = false;
        this.notes = '';
      }
    },

    // Sets the loading value of the data prop loading. adjusting this will adjust if the loading
    // panel is showing or not.
    setLoading: function(value) {
      this.loading = value;
    }
  },

  watch: {
    // props should not be updated directly, in this case we will use a local value that can be
    // changed to reflect the displaying status, in this case we can update local but not break
    // vues properties.
    show: function(newValue) {
      this.showPanel = newValue;
    }
  }
};
</script>
