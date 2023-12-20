<template>
  <div class="login-container">
    <h2>Login Page</h2>
    <form @submit.prevent="loginUser" class="login-form">
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>

      <button type="submit">Login</button>
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
    </form>
    <div class="register-link">
      <p>No account? <router-link to="/register">Register</router-link></p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      successMessage: '',
      errorMessage: '',
    };
  },
  methods: {
    async loginUser() {
      const requestBody = {
        username: this.username,
        password: this.password,
      };
      const { data, pending, error, refresh } = await useFetch('/api/auth/login', {
        initialCache: false,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!error.value) {
        const cookie = useCookie('session');
        cookie.value = data.value.message.user.session_value
        this.$router.push({
        name: 'index',
        });
      } else {
        if (String(error.value).includes('409')) {
          this.errorMessage = 'This username already exists';
        } else if (String(error.value).includes('400')) {
          this.errorMessage = 'Invalid login or password';
        } else { 
          this.errorMessage = 'Error with connection the server';
        }
      }
    },
  },
  mounted() {
    this.successMessage = this.$route.query.successMessage || '';
    this.$router.replace({ query: [] });
  },
};
</script>

<style scoped>

.bg-img, .login-container {
  background-image: url('/static/background.jpg');
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}
 
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.login-form {
  width: 300px;
  padding: 20px;
  margin: 20px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 2px solid #4caf50;
  height: auto;
}

.success-message {
  color: #008000;
  font-size: 16px;
  margin-top: 10px;
}

.form-group {
  margin-bottom: 15px;
}

h2 {
  font-size: 34px;
}

p {
  font-size: 20px;
}

label {
  margin-top: 5px;
  display: block;
}

input {
  width: 100%;
  box-sizing: border-box;
  margin-top: 5px;
}

button {
  padding: 10px;
  background-color: #4caf50;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

button:hover {
  background-color: #45a049;
}

.error-message {
  color: #ff0000;
  font-size: 14px;
  margin-top: 10px;
}
</style>
