import 'https://cdn.tailwindcss.com';
const { createApp } = Vue;
import App from "./App.js";
import router from "./router.js";
import './main.css';

const app = createApp(App);

app.use(router);
app.mount("#app");
