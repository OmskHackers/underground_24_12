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
      cookieExists: false, // Add this line
      username: '',        // You might want to set a default value or fetch it from somewhere
    };
  },
  created() {
    // Проверяем наличие куки
    const cookie = useCookie('username');

    // Если куки установлены, устанавливаем cookieExists в true и сохраняем имя пользователя
    if (cookie.value) {
      this.cookieExists = true;
      this.username = cookie.value;
    } else {
      // Если куки не установлены, перенаправляем на страницу register
      this.$router.push('/register');
    }
  },
}
</script>

<style scoped>
/* Ваши стили компонента */
</style>
