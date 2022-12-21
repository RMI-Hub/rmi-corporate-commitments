data:
	mkdir -p public/data
	node ./scripts/data.js

build:
	mkdir -p public
	npm run static
	npm run build

clean:
	rm -rf public

test:
	npm run test