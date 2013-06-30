
build: components index.js
	@component build --dev

test/index.html: test/index.jade
	@jade test/index.jade

test: test/index.html components build
	@echo open test/index.html in your browser

components: component.json
	@component install --dev

clean:
	rm -fr build components test/index.html

.PHONY: test clean
