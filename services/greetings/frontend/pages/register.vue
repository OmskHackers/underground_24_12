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
    async registerUser() {
      const requestBody = {
        username: this.username,
        password: this.password,
      };
      const { data, error } = await useFetch('http://localhost:8081/api/auth/register', {
        initialCache: false,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      console.log(data.value);
    },
  },
};
</script>

<style scoped>
</style>
