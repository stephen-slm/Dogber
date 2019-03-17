<template>
  <v-container>
    <snackbar :text="snackMessage" :show="showSnack" @snackbar-end="resetSnack" />
    <v-dialog v-model="showFeedbackLocal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Feedback</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex>
                <v-text-field
                  v-model="feedbackMessage"
                  :rules="[rules.required, rules.counter]"
                  clearable
                  maxlength="100"
                  counter
                  label="Message*"
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn id="feedcancel" color="blue darken-1" flat @click="showFeedbackLocal = false">Close</v-btn>
          <v-btn id="feedsubmit" color="blue darken-1" flat @click="submitLocal()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn flat color="primary" @click="showFeedbackLocal = true">Give Feedback</v-btn>
  </v-container>
</template>

<script>
import Snackbar from '@/components/Snackbar.vue';

export default {
  props: {
    // triggered when the external requiring object is looking to display the feedback panel.
    showFeedback: {
      type: Boolean,
      default: false
    },
    // the function that will be called with the resulting feedback message, this can be then used
    // to send / update the database with the feedback, but its down to the requesting user to make
    // the changes.
    submit: {
      type: Function,
      default: () => null
    }
  },

  data: function() {
    return {
      // the message that is bound + being submitted to the submitting function
      feedbackMessage: '',
      // local value to seee if the screen should be displaying or not.
      showFeedbackLocal: this.showFeedback || false,
      // the rules that are enforced and applies to the input fields.
      rules: {
        required: (value) => !!value || 'Required.',
        counter: (value) =>
          (value.length <= 100 && value.length > 10) || 'Max 100 characters && Greater than 10'
      },
      // the message that will be displayed on the screen.
      snackMessage: '',
      showSnack: false
    };
  },

  methods: {
    // submit local will start the submission process while cleaning up behind, allowing for a
    // cleaner process. The external requiring process does not need to worry about clearning up
    // the text fields.
    submitLocal: async function() {
      const message = this.feedbackMessage;
      const submittedFeedback = await this.submit(message.trim());

      if (submittedFeedback) {
        this.showSnackbar('Thank you for submitting feedback! 🎉🎉🎉');

        this.showFeedbackLocal = false;
        this.feedbackMessage = '';
      } else {
        this.feedbackMessage = this.feedbackMessage.trim();
      }
    },

    /**
     * Sets the loading value of the data prop loading. adjusting this will adjust if the loading
     * panel is showing or not.
     */
    setLoading: function(value) {
      this.loading = value;
    },

    /**
     * Shows the snackbar on the screen with the provided message.
     * @param {string} Message the snackbar message to show.
     */
    showSnackbar: function(message) {
      this.snackMessage = message;
      this.showSnack = true;
    },

    // resets the snackbar back to normal ready to process the following message.
    resetSnack: function() {
      this.authenticationErrored = false;
      this.showSnack = false;
      this.snackMessage = '';
    }
  },

  watch: {
    // props should not be updated directly, in this case we will use a local value that can be
    // changed to reflect the displaying status, in this case we can update local but not break
    // vues properties.
    showFeedback: function(newValue) {
      this.showFeedbackLocal = newValue;
    }
  },

  components: {
    Snackbar
  }
};
</script>

<style scoped></style>
