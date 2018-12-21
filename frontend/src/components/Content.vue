<template>
  <div class="hello">
    <!-- <sl-vue-tree v-model="nodes">

      <template slot="toggle" slot-scope="{ node }">
          <span v-if="!node.isLeaf">
            <icon name="caret-right" v-if="!node.isExpanded"></icon>
            <icon name="caret-down"  v-if="node.isExpanded"></icon>
          </span>
      </template>

      <template slot="title" slot-scope="{ node }">
          <icon name="file" v-if="node.isLeaf"></icon> {{ node.title }} </template>

      <template slot="sidebar" slot-scope="{ node }">
          <icon name="circle" v-if="node.data.isModified"></icon>
      </template>
    </sl-vue-tree> -->
    <codemirror id="editor" v-model="text" :options="cmOptions" @input="editorOnChange"></codemirror>
  </div>
</template>

<script>
import slVueTree from 'sl-vue-tree'

var nodes = [
    {title: 'Item1', isLeaf: true},
    {title: 'Item2', isLeaf: true, data: { visible: false }},
    {title: 'Folder1'},
    {
      title: 'Folder2', isExpanded: true, children: [
        {title: 'Item3', isLeaf: true},
        {title: 'Item4', isLeaf: true, data: { isModified: true }}
      ]
    }
];

export default {
  component: {
    slVueTree,
  },
  created() {
    this.room = this.$router.history.current.fullPath.replace(/\/$/,'')
  },
  computed: {
    codemirror() {
      return this.$refs.myCm.codemirror
    }
  },
  data () {
    return {
      nodes: nodes,
      editor: null,
      joined: false,
      room: null,
      id: null,
      text: '',
      cmOptions: {
        tabSize: 4,
        styleActiveLine: false,
        lineNumbers: true,
        styleSelectedText: false,
        line: true,
        showCursorWhenSelecting: true,
        theme: "monokai"
      }
    }
  },
  mounted() {
  },
  sockets: {
    connect() {
      this.id = this.$socket.id
      this.room = this.$router.history.current.fullPath.replace(/\/$/,'')
      this.$socket.emit('room', this.room)
      console.log("Connected to "+this.room)
    },
    get(text) {
      this.text = text
    },
    disconnect() {
      console.log("Disconnected from "+this.room)
      this.id = null
      this.room = null
    },
    room(status) {
      if (status === 'joined') {
        this.joined = true
      }
    },
    updateText(data) {
      if (data.id !== this.id && this.id && this.room) {
        this.text = data.text
      }
    }
  },
  methods: {
    editorOnChange(text) {
      if (this.joined && !this.ignoreChange) {
        this.ignoreChange = true
        this.$socket.emit('updateText', {
          'text': this.text,
          'id': this.id
        })
        this.ignoreChange = false
      }
    }
  },
}
</script>

<style>

  #editor {
    top: 0;
    left: 100px;
    right: 0;
    bottom: 0;
    position: fixed !important;
    overflow: hidden;
  }
  .CodeMirror {
    border: 1px solid #eee;
    height: 100%;
  }

  sl-vue-tree {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100px;
    bottom: 0;
  }
</style>
