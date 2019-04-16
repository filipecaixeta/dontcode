<template>
  <div class="home">
		<h1>DONTCODE</h1>
    <div id="pathToGo">
			<form onsubmit="return go()" class="urlComplete" :action="urlAction">
				<label class="urlLabel">dontcode.ml/</label>
				<input type="text"
							 class="urlInput"
							 id="search"
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
			search: ''
		}
	},
	computed: {
		urlAction () {
			return this.search
		}
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
  color: #fff;
}

.urlComplete {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	background: #fff;
  border: 3px solid #00B4CC;
  border-radius: 5px;
  outline: none;
  color: #00B4CC;
}

.urlComplete:focus{
  color: #00B4CC;
}

.urlLabel {
	margin-left: 10px;
}

.urlInput {
	display: flex;
	flex: 1;
  border: 0px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
	line-height: 30px;
	background: #fff;
	outline: none;
}

.urlButton {
	display: flex;
  text-align: center;
  color: #00B4CC;
  cursor: pointer;
  font-size: 20px;
	border: none;
	outline: none;
}

</style>