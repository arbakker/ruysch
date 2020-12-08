var getCSWRecords = async (cswEndpoint, cqlQuery, maxRecords = 0) => {
    let pageSize = 50;
    let startPosition = 1;
    let records = []
    // eslint-disable-next-line no-constant-condition
    while (true){
        let url = `${cswEndpoint}?request=GetRecords&Service=CSW&Version=2.0.2&typeNames=gmd:MD_Metadata&resultType=results&constraint=${cqlQuery}&constraintLanguage=CQL_TEXT&constraint_language_version=1.1.0&startPosition=${startPosition}&maxRecords=${pageSize}`
        let nextRecord = 0
        let res = await fetch(url)
        if(!res.ok) break
        let data = await res.text()
        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(data, "text/xml")
        let recordsNodes =  xmlDoc.querySelectorAll("SummaryRecord")
        for (let i = 0; i < recordsNodes.length; ++i) {
            let recordNode = recordsNodes[i];
            let mdId = recordNode.querySelectorAll("identifier")[0].textContent
            let mdTitle = recordNode.querySelectorAll("title")[0].textContent
            let record = {}
            record.title = mdTitle
            record.id = mdId
            records.push(record)
        }
        let searchResults = xmlDoc.querySelectorAll("SearchResults")[0]
        nextRecord = searchResults.getAttribute("nextRecord")
        if (nextRecord == 0){
            break
        }else if (maxRecords > 0 && nextRecord >= maxRecords){
            break
        }
        startPosition+=pageSize
    }
    return records
}

var getCSWRecord = async (cswEndpoint, mdIdentifier) => {
    let url = `${cswEndpoint}?service=CSW&request=GetRecordById&version=2.0.2&outputSchema=http://www.isotc211.org/2005/gmd&elementSetName=full&id=${mdIdentifier}#MD_DataIdentification`
    let res = await fetch(url)
    if(!res.ok) return ""
    let data = await res.text()
    let parser = new DOMParser()
    let xmlDoc = parser.parseFromString(data, "text/xml")
    let onlineResNode =  xmlDoc.querySelectorAll("connectPoint CI_OnlineResource linkage URL")

    if (onlineResNode && onlineResNode.length > 0){
        return onlineResNode[0].textContent
    }
    return ""
}

var getCSWRecordsWithUrl = async (cswEndpoint, cqlQuery, maxRecords = 0) => {
    let records = await getCSWRecords(cswEndpoint, cqlQuery, maxRecords)
    for (let i = 0; i < records.length; ++i) {
        let record = records[i]
        let idPromise = getCSWRecord(cswEndpoint, record.id)
        idPromise.then(function(data){
            record.url = data
        })
    }
    return records
}


  
export default getCSWRecordsWithUrl