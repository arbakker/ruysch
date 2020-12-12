import { Stroke, Style, Fill, Circle } from "ol/style";

const white = [255, 255, 255, 1]
const blue = [0, 153, 255, 1]
const width = 2

const linestringStyle = [new Style({
    stroke: new Stroke({
        color: white,
        width: width + 2,
    }),
}),
new Style({
    stroke: new Stroke({
        color: blue,
        width: width,
    }),
}),
];
const polygonStyle = [
    new Style({
        fill: new Fill({ color: [255, 255, 255, 0.5] }),
    }),
    new Style({
        stroke: new Stroke({
            color: white,
            width: 3.5,
        }),
    }),
    new Style({
        stroke: new Stroke({
            color: blue,
            width: 2.5,
        }),
    }),
];

const pointStyle = [
    new Style({
        image: new Circle({
            radius: width * 2,
            fill: new Fill({ color: blue }),
            stroke: new Stroke({
                color: white,
                width: width / 2,
            }),
        }),
    })
];


export default { pointStyle, linestringStyle, polygonStyle }
