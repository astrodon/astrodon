import ButtonQ from "./Button.js";

export default {
  template: `
    <div class="w-full py-16 px-20 flex">
      <h1 class="text-3xl font-bold text-indigo-500">Astrodon and Vue Demo</h1>
      <div class="ml-auto flex">
        <button-q to="/"> Home </button-q>
        <button-q to="/about"> About </button-q>
      </div>
    </div>
  `,
  components: {
    ButtonQ,
  },
};
