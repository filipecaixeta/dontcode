<template>
  <div class="home">
		<h1>DONTCODE</h1>
    <div id="pathToGo">
			<form onsubmit="return go()" class="urlComplete" :action="urlAction">
				<label class="urlLabel">dontcode.ml/</label>
				<input type="text"
							 class="urlInput"
							 id="search"
							 :placeholder="placeholder"
							 v-model='search'
							 autocapitalize="off"
							 autocorrect="off"/>
				<button type="submit" class="urlButton">
					<i class="fa fa-search"></i>
				</button>
			</form>
		</div>
  </div>
</template>

<script>
export default {
	data () {
		return {
			search: '',
			phrase: 'writeWhateverYouWant',
			placeholder: '',
			phCount: 0
		}
	},
	methods: {
		randDelay (min, max) {
			return Math.floor(Math.random() * (max-min+1)+min);
		},
		startTyping () {
			let startText = this.phrase
			this.typeWrite(startText)
		},
		typeWrite (string) {
			let splitted = string.split('')
			let current = this.placeholder
			let original = string
			this.placeholder = current + splitted[this.phCount]
			if (this.phCount < splitted.length - 1) {
				setTimeout (() => {
						this.phCount++
						this.typeWrite(original)
				}, this.randDelay(100, 300))
			} else {
				setTimeout (() => {
					this.eraseWrite(original)
				}, 1000)
			}
		},
		eraseWrite (string) {
			let current = this.placeholder
			let original = string
			this.placeholder = current.slice(0, -1)
			if (this.phCount > 0) {
				setTimeout (() => {
						this.phCount--
						this.eraseWrite(original)
					
				}, this.randDelay(50, 100))
			} else {
				setTimeout (() => {
					this.typeWrite(original)
				}, 2000)
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