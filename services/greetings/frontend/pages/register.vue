<template>
  <div class="registration-container">
    <h2>Register Page</h2>
    <form @submit.prevent="registerUser" class="registration-form">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>

      <button type="submit">Register</button>
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
    </form>

    <div class="login-link">
      <p>Already have an account? <router-link to="/login">Login</router-link></p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async registerUser() {
      const requestBody = {
        username: this.username,
        password: this.password,
      };
      const { data, error} = await useFetch('/api/auth/register', {
          initialCache: false,
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
      });
      if (!error.value) {
        this.$router.push({
        name: 'login',
        query: { successMessage: 'Successfully registered. Please log in.' },
        });
      } else {
        if (String(error.value).includes('409')) {
          this.errorMessage = 'This username already exists';
        } else if (String(error.value).includes('400')) {
          this.errorMessage = 'Bad params';
        } else { 
          this.errorMessage = 'Error with connection the server';
        }
      }
    },
  },
};
</script>

<style scoped>

.bg-img, .registration-container {
  background-image: url('/static/background.jpg');
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}
 
.registration-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.registration-form {
  width: 300px;
  padding: 20px;
  margin: 20px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 2px solid #4caf50;
  height: auto;
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
