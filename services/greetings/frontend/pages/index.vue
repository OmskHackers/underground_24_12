<template>
  <div class="bg-img">
    <div class="center-container">
      <template v-if="cookieExists">
        <p>Привет, {{ username }}! Теперь ты можешь отправить праздничную открытку!</p>
        <div>
          <button @click="logout">Logout</button>
          <button @click="sendCard">Send a Card</button>
        </div>
      </template>
      <p v-else>Loading...</p>
    </div>
  </div>
</template>

<script >
export default {
  data() {
    return {
      cookieExists: false,
      username: '',
    };
  },
  async mounted() {
    const cookie = useCookie('session');
    if (cookie.value) {
      const { data, error } = await useFetch('/api/user/profile', {
      });
      if (!error.value) {
        this.username = data.value.message.user.username;
        this.cookieExists = true
      } else {
        this.$router.push({
        name: 'login',
        });
      }
    } else {
      this.$router.push({
        name: 'register',
        });
    }
  },
  methods: {
    logout() {
      const cookie = useCookie('session');
      cookie.value = null;
      this.cookieExists = false,
      this.username = ''
      this.$router.push({
        name: 'login',
        });
    },
    sendCard() {
      this.$router.push({
        name: 'sendcard',
        });
    },
  },
};
</script>

<style scoped>
.bg-img {
  background-image: url('/static/background.jpg');
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-container {
  text-align: center;
  color: white;
}

.center-container button {
  margin: 10px;
  padding: 8px 16px;
  font-size: 16px;
  background-color: #ff6347;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

p {
  color: black;
  font-size: 22px;
}

.center-container button:hover {
  background-color: #d32f2f;
}
</style>
