<template>
    <div class="bg-img">
      <div class="center-container">
        <div v-if="!cardSent">
          <h2>Выберите картинку и напишите комментарий</h2>
          <input type="file" @change="handleFileChange" accept="image/*" />
          <textarea v-model="cardText" placeholder="Введите текст открытки"></textarea>
          <button @click="sendCard">Отправить открытку</button>
        </div>
        <div v-else>
        <p style="color: green;">Открытка с номером {{serverResponse}} успешно отправлена!</p>
        <button @click="goBack">Вернуться назад</button>
      </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        cardSent: false,
        selectedFile: null,
        cardText: '',
        serverResponse: null,
      };
    },
    methods: {
      handleFileChange(event) {
        const file = event.target.files[0];
  
        const maxSizeInBytes = 100 * 1024;
        if (file.size > maxSizeInBytes) {
          alert('Выбранный файл слишком большой. Максимальный размер: 100KB.');
          event.target.value = null;
          return;
        }
        this.selectedFile = file;
      },
      async sendCard() {
        try {
          if (!this.selectedFile) {
            alert('Пожалуйста, выберите файл.');
            return;
          }

          if (!this.cardText.trim()) {
            alert('Пожалуйста, введите текст открытки.');
            return;
          }

          const image_id = await this.uploadFile(this.selectedFile, this.cardText);
          this.serverResponse = image_id;
          this.cardSent = true;
          this.selectedFile = null;
          this.cardText = '';
        } catch (error) {
          console.error('Error sending card:', error);
        }
      },
      async uploadFile(file, description) {
        const formData = new FormData();
          formData.append('image', file);
          formData.append('description', description);

          const { data, pending, error, refresh } = await useFetch('/api/user/greeting', {
            initialCache: false,
            method: 'POST',
            body: formData,
          });
          if (!error.value) {
            return data.value.message.id;
          } else {
              return "undefined :(";
          }
      },
      goBack() {
        this.$router.push({
        name: 'index',
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
  color: black;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

p {
  color: black;
  font-size: 22px;
}
  
  h2, textarea {
    margin: 10px 0;
    width: 100%;
    color: black;
  }

  input[type="file"] {
  margin-top: 20px;
  margin-left: 160px;
  display: inline-block;
}
  
  button {
    margin-top: 20px;
    color: black
  }
  </style>
  