<template>
  <div>walks</div>
</template>

<script>
import firebaseWrapper from '@/lib/firebaseWrapper';

export default {
  name: 'Walks',
  created: async function() {
    
    // get the currenlty authenticated user.
    const profile = await firebaseWrapper.getProfile();

    // If the profile is new redirect to introduction
    if(profile.new){
      this.$router.push({ name:'introduction' })
    }
  }
};
</script>
