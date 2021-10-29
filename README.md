![Build and Deploy](https://github.com/arbakker/pdok-services/workflows/Build%20and%20Deploy/badge.svg)

# Ruysch

Ruysch is a [CSW](https://en.wikipedia.org/wiki/Catalogue_Service_for_the_Web) web-client specifically for exploring ([OGC](https://en.wikipedia.org/wiki/Open_Geospatial_Consortium)) webservices. The deployment running at [arbakker.github.io/ruysch](arbakker.github.io/ruysch) is configured to expose all services hosted by [PDOK](https://www.pdok.nl/) registered in the [nationaalgeoregister.nl](https://nationaalgeoregister.nl/).

The key feature of this app is to enable quick exploration of webservices published by a organization in a CSW instance.

The following service-types are supported:

- WMS
- WFS
- WMTS
- INSPIRE Atom

Application can be customized (colors, cswEndpoint en serviceOwner) trough [`config.js`](https://github.com/arbakker/ruysch/blob/main/src/config.js) but also though the url:

- change the CSW endpoint: [`http://arbakker.github.io/ruysch/#/home?cswBaseUrl=https%3A%2F%2Fngr.acceptatie.nationaalgeoregister.nl%2Fgeonetwork%2Fsrv%2Fdut%2Fcsw`](http://arbakker.github.io/ruysch/#/home?cswBaseUrl=https%3A%2F%2Fngr.acceptatie.nationaalgeoregister.nl%2Fgeonetwork%2Fsrv%2Fdut%2Fcsw)
- change the service owner: [`http://arbakker.github.io/ruysch/#/home?serviceOwner=Rijkswaterstaat`](http://arbakker.github.io/ruysch/#/home?serviceOwner=Rijkswaterstaat)

Named after [Johannes Ruysch](https://en.wikipedia.org/wiki/Johannes_Ruysch), a Dutch cartographer. 

## Project setup

```bash
npm install
```

### Compiles and hot-reloads for development

```bash
npm run serve
```

### Compiles and minifies for production

```bash
npm run build
```

### Lints and fixes files

```bash
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Other

Font logo is _Rubik_.
