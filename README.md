![Build and Deploy](https://github.com/arbakker/pdok-services/workflows/Build%20and%20Deploy/badge.svg)

# Ruysch

CSW web-client specifically for exploring webservices. The deployment running at arbakker.github.io/ruysch is configured to expose all services hosted by [PDOK](https://www.pdok.nl/) registered in the [nationaalgeoregister.nl](https://nationaalgeoregister.nl/).

Key feature is the quick exploration of the webservices published by one organization in CSW instance.

The following service-types are supported:

- WMS
- WFS
- WMTS
- INSPIRE Atom

Application can be customized trough [`config.js`](https://github.com/arbakker/ruysch/blob/main/src/config.js). 

Named after [Johannes Ruysch](https://en.wikipedia.org/wiki/Johannes_Ruysch), a Dutch cartographer. 

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
