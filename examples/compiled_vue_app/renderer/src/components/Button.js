export default {
  template: `
    <div>
      <router-link class="ml-4 hover:text-indigo-500 py-3 px-4" :to="to"> <slot> </slot> </router-link>
    </div>
  `,
  props: ["to"],
};
