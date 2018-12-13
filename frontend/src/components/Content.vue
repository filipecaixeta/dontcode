<template>
  <div class="hello">
    <div id="editor" height="100%"></div>
  </div>
</template>

<script>
import 'ace-builds';
import 'ace-builds/webpack-resolver';

export default {
  created() {
    this.room = this.$router.history.current.fullPath
  },
  data () {
    return {
      editor: null,
      joined: false,
      ignoreChange: false,
      room: ''
    }
  },
  mounted() {
    this.editor = ace.edit("editor", {
      // theme: "ace/theme/monokai",
      minLines: 10,
      fontSize: 18,
      height: "100%"
      // autoScrollEditorIntoView: true
    });
		this.editor.$blockScrolling = Infinity;
    this.editor.getSession().setUseWrapMode(true);
    this.editor.getSession().setTabSize(4);
    this.editor.setFontSize(18);
    this.editor.setShowPrintMargin(false);
    this.editor.getSession().setValue("");

    this.editor.session.on('change', this.editorOnChange);
  },
  sockets: {
    connect() {
      this.$socket.emit('room', this.room)
      console.log("Connected to backend")
    },
    get(text) {
      this.editor.getSession().setValue(text);
    },
    disconnect() {
      console.log("Disconnected from backend")
    },
    room(status) {
      if (status === 'joined') {
        this.joined = true
      }
    },
    updateText(text) {
      this.ignoreChange = true
      if (text !== this.editor.getValue()) {
        this.editor.getSession().setValue(text);
      }
      this.ignoreChange = false
    }
  },
  methods: {
    editorOnChange(delta) {
      if (this.joined && !this.ignoreChange) {
        this.$socket.emit('updateText', this.editor.getValue())
      }
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  #editor, .ace_editor {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    position: fixed !important;
  }
</style>
