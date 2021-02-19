

import proj4 from 'proj4'

const BASE_URL = 'https://www.openbasiskaart.nl/mapcache/?'
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs')
function calcSizeRatio (bbox) {
  const [minx, miny, maxx, maxy] = bbox
  const deltax = maxx - minx
  const deltay = maxy - miny
  return deltay / deltax
}
function getGetMapUrl (width, height, bbox) {
  const bboxString = bbox.join(',')
  const dpi = 70
  return `${BASE_URL}SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=osm-hq&STYLES=&WIDTH=${width}&HEIGHT=${height}&FORMAT=image/png&SRS=EPSG:28992&FORMAT_OPTIONS=dpi:${dpi}&TRANSPARENT=TRUE&BBOX=${bboxString}`// &TILED=true
}
function bufferBbox (bbox, bufferFactor) {
  const deltaXBuffer = ((bbox[2] - bbox[0]) * bufferFactor) / 2
  const deltaYBuffer = ((bbox[3] - bbox[1]) * bufferFactor) / 2
  return [bbox[0] - deltaXBuffer, bbox[1] - deltaYBuffer, bbox[2] + deltaXBuffer, bbox[3] + deltaYBuffer]
}
function transformBbox2ImageCoords (drawBbox, imageBbox, imageSize) {
  const [drawMinX, drawMinY, drawMaxX, drawMaxY] = drawBbox
  const [imageMinX, imageMinY, imageMaxX, imageMaxY] = imageBbox
  const imageDrawMinX = transformSingleCoord2Pixel(imageMinX, imageMaxX, imageSize[0], drawMinX)
  const imageDrawMaxX = transformSingleCoord2Pixel(imageMinX, imageMaxX, imageSize[0], drawMaxX)
  const imageDrawMinY = transformSingleCoord2Pixel(imageMinY, imageMaxY, imageSize[1], drawMinY)
  const imageDrawMaxY = transformSingleCoord2Pixel(imageMinY, imageMaxY, imageSize[1], drawMaxY)
  return [imageDrawMinX, imageDrawMinY, imageDrawMaxX, imageDrawMaxY]
}

function wktPolygon2Bbox (wktString) {
  const polArray = wktString.split(' ')
  return [polArray[1], polArray[0], polArray[5], polArray[4]].map(parseFloat)
}

function transformSingleCoord2Pixel (imageMin, imageMax, imageSize, value) {
  const deltaDraw = value - imageMin
  const deltaImage = imageMax - imageMin
  return parseInt((deltaDraw / deltaImage) * imageSize)
}

function bbox2RD (bbox) {
  const [minx, miny] = proj4('EPSG:28992', [bbox[0], bbox[1]])
  const [maxx, maxy] = proj4('EPSG:28992', [bbox[2], bbox[3]])
  return [minx, miny, maxx, maxy]
}

var addOverviewImageToCanvasEl = function (el, wktString = '', width=200) {
  if (!wktString) {
    wktString = el.getAttribute('georss-polygon')
  }
  console.log(wktString)
  const bbox = wktPolygon2Bbox(wktString)
  console.log(bbox.join(","))
  const bboxRd = bbox2RD(bbox)
  console.log(bboxRd.join(","))
  const bboxImage = bufferBbox(bboxRd, 0.4)
  const ratio = calcSizeRatio(bboxImage)
  const height = parseInt(width * ratio)
  const size = [width, height]
  const wmsImage = new Image()
  wmsImage.src = getGetMapUrl(width, height, bboxImage)
  wmsImage.onload = function () {
    const drawBboxImage = transformBbox2ImageCoords(bboxRd, bboxImage, size)
    let [minx, miny, maxx, maxy] = drawBboxImage
    maxy = height - maxy
    miny = height - miny
    el.width = width
    el.height = height
    const context = el.getContext('2d')
    context.drawImage(wmsImage, 0, 0)
    context.beginPath()
    // canvas y coordinates direction top to bottom
    context.rect(minx, maxy, maxx - minx, miny - maxy)
    context.lineWidth = 1
    context.strokeStyle = 'red'
    context.stroke()
  }
}


export default {addOverviewImageToCanvasEl}
