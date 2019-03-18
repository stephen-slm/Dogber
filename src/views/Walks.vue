<template>
  <div>walks</div>
</template>

<script>
import firebaseWrapper from '@/lib/firebaseWrapper';

export default {
  name: 'Walks',
  created: async function() {
    // If the profile is new redirect to introduction
    const profile = await firebaseWrapper.getProfile();
    if (profile.new) this.$router.push({ name: 'introduction' });
  }
};
</script>
