import Header from "./components/Header.js";

export default {
  template: `
    <div class="w-full h-full flex flex-col">
      <Header/>
      <div class="flex-1">
        <router-view/>
      </div>
    </div>
  `,
  components: {
    Header,
  },
};
