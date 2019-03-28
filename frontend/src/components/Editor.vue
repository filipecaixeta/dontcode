<template>
  <div class="grid-container">
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
    <codemirror ref="mycm" id="editor" v-model="text" :options="cmOptions" 
      @changes="editorOnChanges"></codemirror>
    <div class="statusbar">
      <div class="element">
        <select @change="onModeChange($event)">
          <option v-for="m of modes" :selected="m==mode">{{m}}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
  import slVueTree from 'sl-vue-tree'
  import { codemirror } from 'vue-codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/addon/search/search.js'
  import 'codemirror/addon/search/jump-to-line.js'
  import 'codemirror/addon/search/searchcursor.js'
  import 'codemirror/addon/dialog/dialog.js'

  // import 'codemirror/mode/javascript/javascript.js'
  // import 'codemirror/mode/markdown/markdown.js'
  // import 'codemirror/mode/vue/vue.js'
  // import 'codemirror/mode/dockerfile/dockerfile.js'
  // import 'codemirror/mode/python/python'

  import 'codemirror/theme/monokai.css'
  import 'codemirror/addon/dialog/dialog.css'

  import { setTimeout } from 'timers';

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
        return this.$refs.mycm.codemirror
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
        mode: "markdown",
        modes: ["clojure", "cmake", "css", "django", "dockerfile", "go", "html", "javascript", "jsx", 
          "julia", "lua", "markdown", "nginx", "octave", "pascal", "perl", "php", "powershell",
          "pug", "python", "r", "ruby", "rust", "sass", "shell", "sparql", "sql", "stylus", "swift", 
          "vb", "vbscript", "vue", "xml", "yaml"
        ],
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
      this.setMode(this.mode)
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
        this.ignoreChange = true
        if (data.id !== this.id && this.joined) {
          this.text = data.text
        }
        this.ignoreChange = false
      }
    },
    methods: {
      editorOnChanges(instance, changes) {
        for (let change of changes) {
          if (change.origin !== 'setValue') {
            return this.editorOnChange(this.text)
          }
        }
      },
      setMode(mode) {
        mode = mode.replace('html','htmlmixed')
        import('codemirror/mode/'+mode+'/'+mode+'.js').then(()=>{
          this.codemirror.setOption("mode", mode)
        })
      },
      onModeChange(event) {
        var mode = event.target.value.toLowerCase()
        this.setMode(mode)
      },
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


  .grid-container {
    position: fixed !important;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    overflow: hidden;
    display: grid; 
    grid-column-gap: 0;
    grid-template-areas:
      "filestree editor"
      "statusbar statusbar";
    grid-template-columns: 250px auto;
    grid-template-rows: auto 25px;
  }
  #editor {
    grid-area: editor;
    overflow: hidden;
  }
  .statusbar {
    grid-area: statusbar;
    overflow: hidden;
    background: #007acc;
    padding: 0 20px;
  }
  .statusbar .element {
    float: right;
    color: rgb(255, 255, 255);
    cursor: pointer;
    display: inline-block;
    font-family: "Ubuntu", "Droid Sans", sans-serif;
    font-size: 14px;
    line-height: 22px;
    margin-left: 5px;
    padding-bottom: 0px;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 0px;
    overflow:hidden;
    outline: 0;
  }
  .statusbar .element select {
    border: 0;
    background: #007acc;
    font-family:Arial, Helvetica, sans-serif; /* Fonte do Select */
    font-size:18px; /* Tamanho da Fonte */
    color:#fff; /* Cor da Fonte */
    text-indent: 0.01px; /* Remove seta padrão do FireFox */
    text-overflow: "";  /* Remove seta padrão do FireFox */     
    -webkit-appearance: none;
    -moz-appearance: none;
    outline: 0;
  }
  .CodeMirror {
    border: 1px solid #eee;
    height: 100%;
    font-size: 1.5em;
  }
  #filesTree{
    grid-area: filestree;
    background-color: #272822;
  }
</style>
