<template>
  <v-layout wrap>
    <v-flex xs12 class="mb-3">
      <v-sheet height="500">
        <v-calendar ref="calendar" v-model="start" :type="type" :end="end" color="primary"></v-calendar>
      </v-sheet>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data: () => ({
    type: 'month',
    start: new Date().toDateString(),
    end: '',
    typeOptions: [
      { text: 'Day', value: 'day' },
      { text: '4 Day', value: '4day' },
      { text: 'Week', value: 'week' },
      { text: 'Month', value: 'month' },
      { text: 'Custom Daily', value: 'custom-daily' },
      { text: 'Custom Weekly', value: 'custom-weekly' }
    ]
  })
};
</script>

<style scoped></style>
