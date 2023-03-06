install:
	npm ci
	cd functions && npm ci
	
dataFunctions:
	echo "Eventually this will do data stuff"

data:
	mkdir -p public/data
	node ./scripts/data.js
	node ./scripts/overall-chart.js

build:
	mkdir -p public
	npm run static
	npm run build

overall:
	node ./scripts/overall-chart.js

clean:
	rm -rf public

test:
	npm run test