
export default {
  name: 'Home',
  template: `
    <div class="w-full h-full flex flex-col items-center justify-center">
      <h1 class="text-6xl -mt-20">Home Page</h1>
      <p class="mt-10">This site is running on vue</p>
      <h1>{{ count }}</h1>
      <button @click="sum" class="rounded bg-transparent border border-indigo-500 text-indigo-500 px-5 py-2 mt-5">Add</button>
    </div>
  `,
  data () {
    return {
      count: 0
    }
  },
  methods: {
    sum() {
      this.count++
    }
  }
}