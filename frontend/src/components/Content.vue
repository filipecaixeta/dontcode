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
    <div id="editor" height="100%"></div>
  </div>
</template>

<script>
import CodeFlask from 'codeflask'
import slVueTree from 'sl-vue-tree'
// import 'ace-builds';
// import 'ace-builds/webpack-resolver';

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
    slVueTree
  },
  created() {
    this.room = this.$router.history.current.fullPath.replace(/\/$/,'')
  },
  data () {
    return {
      nodes: nodes,
      editor: null,
      joined: false,
      ignoreChange: false,
      room: null,
      id: null,
      text: ''
    }
  },
  mounted() {
    this.editor = new CodeFlask('#editor', {
      lineNumbers: true
    })
    console.log(this.editor)
    // this.editor = ace.edit("editor", {
    //   // theme: "ace/theme/monokai",
    //   minLines: 10,
    //   fontSize: 18,
    //   height: "100%"
    //   // autoScrollEditorIntoView: true
    // });
		// this.editor.$blockScrolling = Infinity;
    // this.editor.getSession().setUseWrapMode(true);
    // this.editor.getSession().setTabSize(4);
    // this.editor.setFontSize(18);
    // this.editor.setShowPrintMargin(false);
    // this.editor.getSession().setValue(this.text);

    // this.editor.session.on('change', this.editorOnChange);
    this.editor.onUpdate(this.editorOnChange)
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
      this.ignoreChange = true
      this.editor.updateCode(this.text)
      this.editor.createLineNumbers()
      this.editor.updateLineNumbersCount()
      this.ignoreChange = false
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
      // console.log(data)
      this.ignoreChange = true
      if (data.id !== this.id && this.id && this.room) {
        if (data.text !== this.editor.getCode()) {
          this.text = data.text
          // let cursor = this.editor.getSession().selection.getCursor()
          this.editor.updateCode(this.text)
          this.editor.createLineNumbers()
          this.editor.updateLineNumbersCount()
          // this.editor.moveCursorToPosition(cursor)
        }
      }
      this.ignoreChange = false
    }
  },
  methods: {
    editorOnChange(delta) {
      if (this.joined && !this.ignoreChange) {
        this.$socket.emit('updateText', {
          'text': this.editor.getCode(),
          'id': this.id
        })
      }
    }
  },
}
</script>

<style>
  #editor, .ace_editor {
    top: 0;
    left: 100px;
    right: 0;
    bottom: 0;
    position: fixed !important;
  }
  sl-vue-tree {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100px;
    bottom: 0;
  }
</style>
