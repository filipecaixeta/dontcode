<template lang="pug">
	div.home
		h1 DONTCODE
		div#pathToGo
			form(onsubmit="return go()" :action="urlAction").urlComplete
				label.urlLabel dontcode.ml/
				input(
					type="text"
					id="search"
					:placeholder="placeholder"
					v-model='search'
					autocapitalize="off"
					autocorrect="off"
				).urlInput
				button(type="submit").urlButton
					i.fa.fa-search
</template>

<script>
export default {
	data () {
		return {
			search: '',
			phrases: ['writeWhateverYouWant', 'letsWin', 'todayHave'],
			placeholder: '',
			phraseCount: 0,
			placeholderCount: 0
		}
	},
	methods: {
		randDelay (min, max) {
			return Math.floor(Math.random() * (max-min+1)+min);
		},
		async startTyping () {
			this.typeWrite(this.phrases)
		},
		typeWrite () {
			let phrase = this.phrases[this.phraseCount]
			let splitted = phrase.split('')
			let current = this.placeholder
			let original = phrase
			this.placeholder = current + splitted[this.placeholderCount]
			if (this.placeholderCount < splitted.length - 1) {
				setTimeout (() => {
						this.placeholderCount++
						this.typeWrite()
				}, this.randDelay(100, 300))
			} else {
				setTimeout (() => {
					this.eraseWrite()
				}, 2000)
			}
		},
		eraseWrite () {
			let phrase = this.phrases[this.phraseCount]
			let current = this.placeholder
			let original = phrase
			this.placeholder = current.slice(0, -1)
			if (this.placeholderCount > 0) {
				setTimeout (() => {
						this.placeholderCount--
						this.eraseWrite()
					
				}, this.randDelay(50, 100))
			} else {
				setTimeout (() => {
					this.phraseCount++
					if (this.phraseCount > this.phrases.length - 1) {
						this.phraseCount = 0
					}
					this.typeWrite()
				}, 1000)
			}

		}
	},
	computed: {
		urlAction () {
			return this.search
		}
	},
	mounted(){
    this.startTyping()
  }
}
</script>


<style>
.home {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
  background-color: #272822;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
  color: #00FEDE;
}

.urlComplete {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
  border-radius: 5px;
  font-family: Courier New, Arial, Helvetica, sans-serif;
  border: 3px solid #00FEDE;
	background: #242628;
  color: #00FEDE;
	outline: none;
}

.urlComplete:focus{
  color: #00FEDE;
}

.urlLabel {
	display: flex;
	flex: 1;
	justify-self: flex-start;
	align-self: center;
	margin-left: 10px;
}

.urlInput {
	display: flex;
	flex: 1;
	justify-self: left;
	align-self: center;
  font-size: 18px;
	line-height: 30px;
  border: 0px;
  font-family: Courier New, Arial, Helvetica, sans-serif;
	background: #242628;
  color: #00FEDE;
	outline: none;
}

.urlButton {
	display: flex;
	flex: 1;
	justify-self: flex-end;
	align-self: center;
  text-align: center;
	background: #242628;
  color: #00FEDE;
  cursor: pointer;
  font-size: 20px;
	border: none;
	outline: none;
}

</style>