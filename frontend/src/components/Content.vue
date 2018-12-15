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
      room: null,
      id: null,
      text: ''
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
    this.editor.getSession().setValue(this.text);

    this.editor.session.on('change', this.editorOnChange);
  },
  sockets: {
    connect() {
      this.id = this.$socket.id
      this.$socket.emit('room', this.room)
      console.log("Connected to "+this.room)
    },
    get(text) {
      this.text = text
      this.editor.getSession().setValue(this.text);
    },
    disconnect() {
      this.id = null
      this.room = null
      console.log("Disconnected from "+this.room)
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
        if (data.text !== this.editor.getValue()) {
          this.text = data.text
          let cursor = this.editor.getSession().selection.getCursor()
          this.editor.getSession().setValue(this.text)
          this.editor.moveCursorToPosition(cursor)
        }
      }
      this.ignoreChange = false
    }
  },
  methods: {
    editorOnChange(delta) {
      if (this.joined && !this.ignoreChange) {
        this.$socket.emit('updateText', {
          'text': this.editor.getValue(),
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
    left: 0;
    right: 0;
    bottom: 0;
    position: fixed !important;
  }
</style>
