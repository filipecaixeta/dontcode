<script>
import Editor from './components/Editor.vue'
import Index from './components/Index.vue'

export default {
  name: 'app',
  components: {
    Editor
  },
  data () {
    return {
      currentRoute: window.location.pathname
    }
  },
  computed: {
    ViewComponent () {
      if (this.currentRoute == '/') {
        return Index
      }
      return Editor
    }
  },
  render (h) {
    return h(this.ViewComponent)
  }
}
</script>

<style>
body {
  background-color: #272822;
	display: flex;
  align-items: center;
  justify-content: center
}
</style>