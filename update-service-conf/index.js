import fetch from 'node-fetch'
import fs from 'fs'
import yargs from 'yargs'
import {DOMParser} from 'xmldom'
import { cswBaseUrl } from './config.js'
import { serviceOwner } from './config.js'
import { serviceTypes } from './config.js'

const CSW_NS_URI = "http://www.opengis.net/cat/csw/2.0.2";
const DC_NS_URL = "http://purl.org/dc/elements/1.1/"
const DCT_NS_URL = "http://purl.org/dc/terms/"
const GMD_NS_URL = "http://www.isotc211.org/2005/gmd"
const OUTPUT_DIR = "../src/assets"
const OUTPUT_FILE = `${OUTPUT_DIR}/pdok-services.json`;

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

var getRequests = async (cswEndpoint, cqlQuery, maxRecords = 0) => {
  let url = `${cswEndpoint}?request=GetRecords&Service=CSW&Version=2.0.2&typeNames=gmd:MD_Metadata&resultType=hits&constraint=${cqlQuery}&constraintLanguage=CQL_TEXT&constraint_language_version=1.1.0`
  let res = await fetch(url)
  if (!res.ok) return
  let data = await res.text()
  let parser = new DOMParser()
  let xmlDoc = parser.parseFromString(data, "text/xml")
  let recordsNodes = xmlDoc.getElementsByTagNameNS(CSW_NS_URI, "SearchResults")
  let totalNumberRecords = parseInt(recordsNodes[0].getAttribute('numberOfRecordsMatched'))
  let pageSize = 50;
  if (maxRecords < 50 && maxRecords > 0) {
    pageSize = maxRecords
  }
  let startPosition = 1;
  let promises = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let url = `${cswEndpoint}?request=GetRecords&Service=CSW&Version=2.0.2&typeNames=gmd:MD_Metadata&resultType=results&constraint=${cqlQuery}&constraintLanguage=CQL_TEXT&constraint_language_version=1.1.0&startPosition=${startPosition}&maxRecords=${pageSize}`
    let prom = fetch(url)
    promises.push(prom)
    startPosition += pageSize
    if (startPosition > totalNumberRecords) break
  }
  return promises
}

var getCSWRecords = async (cswEndpoint, cqlQuery, includeServiceUrls, maxRecords = 0) => {
  let records = [];
  let promises = getRequests(cswEndpoint, cqlQuery, maxRecords);
  const responses = await promises;
  const responseBodies = await Promise.all(responses).then((bodies) => {
    return Promise.all(bodies.map((body) => { return body.text() })).then((data) => {
      return data
    }).catch(
      error => {
        throw(error);
    }
    );
  }).catch(
    error => {
      throw(error);
  }
  );
  for (const body of responseBodies) {
    let parser = new DOMParser()
    let xmlDoc = parser.parseFromString(body, "text/xml")
    let recordsNodes = xmlDoc.getElementsByTagNameNS(CSW_NS_URI, "SummaryRecord")
    for (let i = 0; i < recordsNodes.length; ++i) {
      let recordNode = recordsNodes[i];
      let mdId = recordNode.getElementsByTagNameNS(DC_NS_URL, "identifier")[0].textContent
      let mdTitle = recordNode.getElementsByTagNameNS(DC_NS_URL, "title")[0].textContent
      let abstract = recordNode.getElementsByTagNameNS(DCT_NS_URL, "abstract")[0].textContent
      // let modified = recordNode.querySelectorAll("modified")[0].textContent
      let kws = []
      let subjects = recordNode.getElementsByTagNameNS(DC_NS_URL, "subject");
      for (let i = 0; i < subjects.length; i++) {
        kws.push(subjects[i].textContent)
      }
      let record = {}
      record.title = mdTitle
      record.id = mdId
      record.abstract = abstract
      record.keywords = kws
      if (includeServiceUrls){
        let serviceUrl = await fetch(`${cswEndpoint}?request=GetRecordById&Service=CSW&Version=2.0.2&typeNames=gmd:MD_Metadata&id=${mdId}&outputSchema=http://www.isotc211.org/2005/gmd&elementSetName=full`).
        then(response=>response.text())
        .then(responseBody=>{
           const parser = new DOMParser()
           const xmlDoc = parser.parseFromString(responseBody, "text/xml")
           const distInfoNode = xmlDoc.getElementsByTagNameNS(GMD_NS_URL, "distributionInfo")[0]
           const olResourceNode = distInfoNode.getElementsByTagNameNS(GMD_NS_URL, "CI_OnlineResource")[0]
           const urlText = olResourceNode.getElementsByTagNameNS(GMD_NS_URL, "URL")[0].textContent
           return urlText
        }).catch(error => {
          throw(error);
      }
        );
        record.serviceUrl = serviceUrl
      }
      // record.modified = modified
      records.push(record)
    }
  }
  return records;
}

function main(includeServiceUrls) {
  try {
    fs.unlinkSync(OUTPUT_FILE)
    //file removed
  } catch(err) {
    console.error(err)
  }

  for (let i = 0; i < serviceTypes.length; i++) {
    queries.push(getCQLQuery(serviceOwner, serviceTypes[i]));
  }
  let promises = [];
  queries.forEach((query) => {
    promises.push(getCSWRecords(cswBaseUrl, query, includeServiceUrls));
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

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }
    fs.writeFile(OUTPUT_FILE, JSON.stringify(result), function (err) {
      if (err)
        return console.log(err);
      console.log(`Wrote service config in file ${OUTPUT_FILE}`);
    });
  }).catch(
    error => {
      throw(error);
  }
  );
}

var argv = yargs(process.argv.slice(2)).argv;
const includeServiceUrls = argv.i || argv.inclServiceUrl ? true: false
console.log(`includeServiceUrls: ${includeServiceUrls}`)
main(includeServiceUrls)
