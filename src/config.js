const SECONDARY_COLOR = '#00dca5';
function hexToRGB(hex) {
    var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return [r,g,b]
}

export const cswBaseUrl = "https://nationaalgeoregister.nl/geonetwork/srv/dut/csw"
// cswBaseUrl=https://ngr.acceptatie.nationaalgeoregister.nl/geonetwork/srv/dut/csw
export const cachedConfig = {url: "https://nationaalgeoregister.nl/geonetwork/srv/dut/csw", owner: "Beheer PDOK"};
export const serviceOwner = "Beheer PDOK"
export const serviceTypes = ["OGC:WMS", "OGC:WFS", "INSPIRE Atom", "OGC:WMTS"];


export default { 
    cswBaseUrl: cswBaseUrl,
    serviceOwner: serviceOwner,
    serviceTypes: serviceTypes,
    cachedConfig: cachedConfig,
    logo: 'logo.png',
    primaryColor: '#2f4858',
    secondaryColor: SECONDARY_COLOR,
    secondaryColorR: hexToRGB(SECONDARY_COLOR)[0],
    secondaryColorG: hexToRGB(SECONDARY_COLOR)[1],
    secondaryColorB: hexToRGB(SECONDARY_COLOR)[2]
} 



