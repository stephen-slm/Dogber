<template>
  <div id="404"></div>
</template>

<script>
export default {
  name: 'FourOFour',

  created: function() {
    this.$router.push({ name: 'home' });
  }
};
</script>
