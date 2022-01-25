const { createRouter, createWebHashHistory } = VueRouter;
import Home from "./views/Home.js";
import About from "./views/About.js";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/about",
    name: "about",
    component: About,
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
