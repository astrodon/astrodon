
const { createApp } = Vue
import App from './App.js'
import router from './router.js'

const app = createApp(App)

app.use(router)
app.mount('#app')