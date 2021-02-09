// import csw from "../lib/csw.mjs";
const fetch = require('node-fetch');
const fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
const CSW_NS_URI = "http://www.opengis.net/cat/csw/2.0.2";
const DC_NS_URL = "http://purl.org/dc/elements/1.1/"
const DCT_NS_URL = "http://purl.org/dc/terms/"
const OUTPUT_FILE = "pdok-services.json";

var getRequests = async (cswEndpoint, cqlQuery, maxRecords = 0)=>{
  let url = `${cswEndpoint}?request=GetRecords&Service=CSW&Version=2.0.2&typeNames=gmd:MD_Metadata&resultType=hits&constraint=${cqlQuery}&constraintLanguage=CQL_TEXT&constraint_language_version=1.1.0`
  console.log(url)
  let res = await fetch(url)
  if(!res.ok) return
  let data = await res.text()
  let parser = new DOMParser()
  let xmlDoc = parser.parseFromString(data, "text/xml")
  let recordsNodes =  xmlDoc.getElementsByTagNameNS(CSW_NS_URI, "SearchResults")
  let totalNumberRecords = parseInt(recordsNodes[0].getAttribute('numberOfRecordsMatched'))
  let pageSize = 50;
  if (maxRecords < 50 && maxRecords > 0){
      pageSize =  maxRecords
  }
  let startPosition = 1;
  let promises = []
  // eslint-disable-next-line no-constant-condition
  while (true){
      let url = `${cswEndpoint}?request=GetRecords&Service=CSW&Version=2.0.2&typeNames=gmd:MD_Metadata&resultType=results&constraint=${cqlQuery}&constraintLanguage=CQL_TEXT&constraint_language_version=1.1.0&startPosition=${startPosition}&maxRecords=${pageSize}`
      let prom = fetch(url)
      console.log(url)
      promises.push(prom)
      startPosition+= pageSize
      if (startPosition > totalNumberRecords) break
  }
  return promises
}

var getCSWRecords = async (cswEndpoint, cqlQuery, maxRecords = 0) => {
  let records = [];
  let promises = getRequests(cswEndpoint, cqlQuery, maxRecords);
  const responses = await promises;
  const responseBodies = await Promise.all(responses).then((bodies) => {
      return Promise.all(bodies.map((body) => {return body.text()})).then((data)=>{
         return data
      }).catch(
        // console.error
        );
  }).catch(
    // console.error
  );
  responseBodies.forEach((body)=>{
      let parser = new DOMParser()
      let xmlDoc = parser.parseFromString(body, "text/xml")
      let recordsNodes =  xmlDoc.getElementsByTagNameNS(CSW_NS_URI, "SummaryRecord")
      for (let i = 0; i < recordsNodes.length; ++i) {
          let recordNode = recordsNodes[i];
          let mdId = recordNode.getElementsByTagNameNS(DC_NS_URL, "identifier")[0].textContent
          let mdTitle = recordNode.getElementsByTagNameNS(DC_NS_URL, "title")[0].textContent
          let abstract = recordNode.getElementsByTagNameNS(DCT_NS_URL, "abstract")[0].textContent
          // let modified = recordNode.querySelectorAll("modified")[0].textContent
          let kws = []    

          let subjects = recordNode.getElementsByTagNameNS(DC_NS_URL, "subject");
          for(let i = 0; i < subjects.length;i++){
            kws.push(subjects[i].textContent)
          }
          let record = {}
          record.title = mdTitle
          record.id = mdId
          record.abstract = abstract
          record.keywords = kws
          // record.modified = modified
          records.push(record)
      }
  })
  return records;
}


function getServiceUrl(xmlDoc){
  let onlineResNode =  xmlDoc.querySelectorAll("connectPoint CI_OnlineResource linkage URL")
  if (onlineResNode && onlineResNode.length > 0){
      return onlineResNode[0].textContent
  }
  return ""
}

function getServiceProtocol(xmlDoc){
  let protNode =  xmlDoc.querySelectorAll("onLine CI_OnlineResource protocol Anchor")
  if (protNode && protNode.length === 0){
      protNode =  xmlDoc.querySelectorAll("onLine CI_OnlineResource protocol CharacterString")
  }
  if (protNode && protNode.length > 0){
      return protNode[0].textContent
  }
  return ""
}

// var getCSWRecord = async (cswEndpoint, mdIdentifier) => {
//   let url = `${cswEndpoint}?service=CSW&request=GetRecordById&version=2.0.2&outputSchema=http://www.isotc211.org/2005/gmd&elementSetName=full&id=${mdIdentifier}#MD_DataIdentification`
//   let res = await fetch(url)
//   if(!res.ok) return ""
//   let data = await res.text()
//   let parser = new DOMParser()
//   let xmlDoc = parser.parseFromString(data, "text/xml")
//   let serviceUrl = getServiceUrl(xmlDoc)
//   // try with https immediately, since http wont work
//   serviceUrl = serviceUrl.replace('http://', 'https://')
//   let protocol = getServiceProtocol(xmlDoc)
//   return {
//       id: mdIdentifier,
//       url: serviceUrl,
//       protocol: protocol
//   }
// }

// var getCSWRecordsWithUrl = async (cswEndpoint, cqlQuery, maxRecords = 0) => {
//   let records = await getCSWRecords(cswEndpoint, cqlQuery, maxRecords)
//   for (let i = 0; i < records.length; ++i) {
//       let record = records[i]
//       let idPromise = getCSWRecord(cswEndpoint, record.id)
//       idPromise.then(function(data){
//           record.url = data
//       })
//   }
//   return records
// }


function getCQLQuery(serviceOwner, protocol) {
    return `type=%27service%27%20AND%20organisationName=%27${serviceOwner.replace(
      " ",
      "%20"
    )}%27%20AND%20protocol=%27${protocol.replace(" ", "%20")}%27`;
  }

function compare(a, b) {
    if (a.title < b.title) {
      return -1;
    }
    if (a.title > b.title) {
      return 1;
    }
    return 0;
  }
let queries = [];
const serviceTypes = ["OGC:WMS", "OGC:WFS", "INSPIRE Atom", "OGC:WMTS"];
// const serviceTypes = ["OGC:WMS"];
const serviceOwner = "Beheer PDOK"
const cswBaseUrl = "https://nationaalgeoregister.nl/geonetwork/srv/dut/csw"

for (let i = 0; i < serviceTypes.length; i++) {
  queries.push(getCQLQuery(serviceOwner, serviceTypes[i]));
}
let promises = [];
queries.forEach((query) => {
  promises.push(getCSWRecords(cswBaseUrl, query));
});

Promise.all(promises).then((values) => {
  let newValues = [];
  for (let i = 0; i < values.length; i++) {
    newValues.push(
      values[i].map((obj) => ({ ...obj, serviceType: serviceTypes[i] }))
    );
  }
    let result = [].concat.apply([], newValues);
    result.sort(compare);
    fs.writeFile(OUTPUT_FILE, JSON.stringify(result), function (err) {
      if (err) 
          return console.log(err);
      console.log(`Wrote service config in file ${OUTPUT_FILE}`);
  });
}).catch(
  // console.error
  );
