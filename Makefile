nw = /Applications/node-webkit.app/Contents/MacOS/node-webkit

default:
	zip -r app.nw * -x ".git/*"
	@echo "done"
	$(nw) app.nw
