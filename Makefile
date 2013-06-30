
build: components index.js
	@component build --dev

test: components
	@test -d build || mkdir build
	@echo open http://localhost:3000/ in your browser
	@node test/server.js

components: component.json
	@component install --dev

clean:
	rm -fr build components

.PHONY: test clean
