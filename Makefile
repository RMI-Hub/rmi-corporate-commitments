update:
	node ./scripts/companies.js

build:
	mkdir -p public
	npm run static
	npm run build

clean:
	rm -rf public