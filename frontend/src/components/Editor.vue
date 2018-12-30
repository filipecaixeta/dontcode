<template>
  <div>
    <sl-vue-tree v-model="nodes"
                id="filesTree"
                isDraggable="false"
                @nodeclick="onFileClick">

      <template slot="title" slot-scope="{ node }">
          <span class="item-icon">
            <i class="fa fa-file" v-if="node.isLeaf"></i>
            <i class="fa fa-folder" v-if="!node.isLeaf"></i>
          </span>

          {{ node.title }}
        </template>

        <template slot="toggle" slot-scope="{ node }">
          <span v-if="!node.isLeaf">
            <i v-if="node.isExpanded" class="fa fa-chevron-down"></i>
            <i v-if="!node.isExpanded" class="fa fa-chevron-right"></i>
          </span>
        </template>

        <template slot="draginfo">

        </template>
    </sl-vue-tree>
    <codemirror id="editor" v-model="text" :options="cmOptions" @input="editorOnChange"></codemirror>
  </div>
</template>

<script>
import slVueTree from 'sl-vue-tree'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/theme/monokai.css'

function filesTree(root, files) {
  if (files.length==0) {
    return
  }
  else {
    let file = files.shift()
    root[file] = root[file] || {}
    filesTree(root[file], files)
  }
}

function filesTree2List(tree) {
  let files = Object.keys(tree)
  let ret = []
  for (let file of files) {
    if (Object.keys(tree[file]).length===0) {
      ret.push({title: file, isLeaf: true, isDraggable: false})
    }
    else {
      let children = []
      for (let x of Object.keys(tree[file])) {
        if (Object.keys(tree[file][x]).length===0) {
          children.push({title: x, isLeaf: true, isDraggable: false})
        }
        else {
          children.push({title: x, isLeaf: false, isDraggable: false, children: filesTree2List(tree[file][x])})
        }
      }
      ret.push({title: file, isLeaf: false, isDraggable: false, children: children, data: {'teste': 'lol'}})
    }
  }
  return ret
}

function getPath(nodes, pos) {
  let path = ""
  for (let p of pos) {
    if (nodes.constructor === Array) {
      nodes = nodes[p]
    }
    else if (!nodes.isLeaf) {
      nodes = nodes.children[p]
    }
    path += nodes.title+'/'
  }
  return path.substring(0, path.length-1)
}

export default {
  props: {
    msg: String
  },
  components: {
    codemirror,
    slVueTree
  },
    created() {

  },
  computed: {
    codemirror() {
      return this.$refs.myCm.codemirror
    },
    room() {
      if (!this.id || !this.joined) {
        return null
      }
      return this.roomName
    },
    roomName() {
      return window.location.pathname.replace(/\/$/,'').slice(1)
    }
  },
  data () {
    return {
      nodes: [],
      editor: null,
      joined: false,
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
      this.$socket.emit('room', this.roomName)
    },
    get(text) {
      this.text = text
    },
    disconnect() {
      console.log("Disconnected from "+this.room)
      this.id = null
      this.joined = null
    },
    room(status) {
      if (status === 'joined') {
        this.joined = true
        console.log("Connected to "+this.room)
      }
    },
    filesList(files) {
      let root = {}
      for (let file of files) {
        filesTree(root, file.split('/'))
      }
      this.nodes = filesTree2List(root)
    },
    updateText(data) {
      if (data.id !== this.id && this.joined) {
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
    },
    onFileClick(ev) {
      console.log("Click")
      let path = getPath(this.nodes, ev.path)
      if (path!==this.room) {
        window.location = '/'+path
      }
    }
  },
}
</script>

<style>
@import '../../node_modules/sl-vue-tree/dist/sl-vue-tree-minimal.css';
@import '../../node_modules/sl-vue-tree/dist/sl-vue-tree-dark.css';
@import 'https://use.fontawesome.com/releases/v5.0.8/css/all.css';

  #editor {
    top: 0;
    left: 200px;
    right: 0;
    bottom: 0;
    position: fixed !important;
    overflow: hidden;
  }
  .CodeMirror {
    border: 1px solid #eee;
    height: 100%;
    font-size: 1.5em;
  }
  #filesTree{
    position: fixed !important;
    top: 0;
    left: 0;
    width: 200px;
    bottom: 0;
    background-color: #272822;
  }
</style>
