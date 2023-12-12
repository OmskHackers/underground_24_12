<template>
  <div>
    <h2>Register Page</h2>
    <form @submit.prevent="registerUser">
      <label for="username">Username:</label>
      <input type="text" id="username" v-model="username" required>

      <label for="password">Password:</label>
      <input type="password" id="password" v-model="password" required>

      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    registerUser() {
      const cookie = useCookie('username');
      cookie.value = this.username;

      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
</style>
