<template>
  <div>
    <h2>Welcome Page</h2>
    <p v-if="cookieExists">Hello, {{ username }}!</p>
    <p v-else>Loading...</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cookieExists: false,
      username: '',
    };
  },
  created() {
    const cookie = useCookie('username');

    if (cookie.value) {
      this.cookieExists = true;
      this.username = cookie.value;
    } else {
      this.$router.push('/register');
    }
  },
}
</script>

<style scoped>
</style>
