// https://v3.nuxtjs.org/api/configuration/nuxt.config

export default defineNuxtConfig({
  build: {
    babel: {
      plugins: [['@babel/plugin-proposal-private-methods', { loose: true }]],
    },
  },
  modules: [
  ],
});
