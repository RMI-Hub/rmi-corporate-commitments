# Corporate climate commitment explorer

This data-explorer dashboard was built by [MG Strategy + Design](https://mgstrategy.design/) for [RMI](https://rmi.org/). It ingests a propietary dataset and presents it in easy-to-read charts with contextual explanations and the chance for the reader to adjust the input for the prediction model. For each user-selected configuration (generally referred to as "toggles" or "multipliers" through this documentation and codebase), the app displays four charts:

1. The year-by-year predicted emissions of all companies in a given sector or industry.
1. The cumulative emissions for each year.
1. The year-by-year predicted emissions if the company keeps to its climate promises. (This is where most of the toggles come into play)
1. The yearly cumulative predicted emissions if the company keeps to its climate promises.

**The files `./src/config/sectors.json` and `./src/config/companies.json` are _generated_ during the data step and should not be edited directly.**

## Easy command lookup

This app uses a Makefile to collect the critical command-line functions in one, easy-to-use place. They are:

2. `make build`: Creates target directories, generates minified javascript and stylesheet files and copies static assets from `./src/static/` into the public directory.
1. `make data`: Pulls in the gigantic, parent CSV, trims it and slices it into smaller files per industry/sector. Files are deposited in `./public/data/`.
3. `make clean`: For when you want a clean slate in the repo. It deletes all generated content and their directories.
4. `make test`: Runs the complete suite of tests written for this app ... mostly validating the microcopy json files.

Want to start from scratch? Use`make clean data build`.

## Running locally

1. Be sure you have the app cloned (including the large data.csv with `git-lfs`) and fully installed with `make install`. 
1. Generate everything you need with `make clean data build`. This will result in the JS and css bundles as well as an html file all in the `/public/` subdirectory. This also will prep the data for the cloud function.
1. Run the app locally with `npm run dev`. This will expose the app on `localhost:5000`
1. In a new terminal window, run the cloud functions locally with `npm run firebase`. This exposes the function on `localhost:4000`.

## The Data

The data is one giant CSV. It is intended to be processed, sliced and minified by the node script `./scripts/data.js`. The data is split up and written to individual files for each sector and industry. (One sector has multiple industries). Cleanup/processing is pretty minimal, but a few unneeded columns are removed. These CSVs are deployed with the app and intended to be consumed by the client.

**The files `./src/config/sectors.json` and `./src/config/companies.json` are _generated_ during the data step and should not be edited directly.**

The primary data client function is `src/utils/fetch-data.js`. It fetches the data and caches it in memory. Because it is making network calls, the function is throttled to work only four times per second. It takes two inputs (the user-selected sector and toggles) and returns a data blob suitable for each of the four charts on the page.

`fetchData()` uses a utility function — `getEmissionsValues()` — to generate, for each year, the baseline and target emissions values based on the user-selected multipliers. The algorithm is devised by [Jun Ukita Shepard](https://rmi.org/people/jun-ukita-shepard/) of RMI and has been ported to Javascript from its original Python. The year-bt-year data it outputs is transformed to a format suitable for the d3 area charts. That data is then combined into data blobs good for the cumulative bar charts.

The initial view of the app is a preset, found in `./src/config/presets.json`. This is done so the default view is validated against a json schema.

## The app

This dashboard is written in [Svelte.js](https://svelte.dev) and uses [D3](https://d3js.org) for the charting. The overarching command `make build` will process all javascript imports and generate `/public/bundle.js` and `/public/bundle.css`. It also moves the current `./src/static/global.css` into the public folder, too. 

The only required HTML is `<div id="rmi" class="app"></div>`. To generate the bundles, use `make data build` because using `make build` alone will fail. `make data` generates a couple files critical for the app.

_TK: The initial state of the app is pre-rendered using `./scripts/ssr.js`_

### Microcopy and other configuration data

Much of the input data is stored in json files in `./src/config/`. These are imported and bundled as part of the main app. The largest is `microcopy.json` and is home to any stray label, description or other bit of text. Collecting text this way puts all of it in once place, and reduces or eliminates the need for most people to wander around in the codebase just to make text edits. **The file `./src/config/companies.json` is _generated_ during the data step and should not be edited directly.**

The testing command will validate each of these files against their corresponding schema files found in the same subdirectory.

#### Sector and industry descriptions

The display names and descriptions for each sector and industry should be added to `./src/data/sectors.json`. That gets validated and mashed together with the source data during `make data`. 

### Master chart

TK

### SVGs

A few small SVG icons are used in this app, and are written directly into svelte components. Be sure to supply a `title` attribute!

## Deploying

Currently in a development state, this app is served via github pages. Any merge to the `main` branch will trigger the Github Actions workflow `deploy.yml`. This action processes the data, builds the bundles and uploads a Github Pages-compatible artifact. It also can be triggered manually from the [actions tab](https://github.com/ryanbmarx/rmi-corporate-commitments/actions).


## Analytics

Action | Event
---|---
Toggletip (`i` button) opened | tktktk
Chart-based share buttons opened | tktktk
Fullscreen mode clicked | tktktk
Chart data table displayed | tktktk
Preset activated | tktktk
Sector/industry selector opened | tktktk
New sector/industry selected | tktktk
Toggle used | tktktktk
Toggles reset | tktktktk