
function getServiceInfoWMS(obj){
    let val = {
        title: obj.Title,
        abstract: obj.Abstract,
        keywords: obj.KeywordList,
        fees: obj.Fees,
        contactOrganization: obj.ContactInformation.ContactPersonPrimary.ContactOrganization,
        contactName: obj.ContactInformation.ContactPersonPrimary.ContactPerson,
        contactEmail: obj.ContactInformation.ContactElectronicMailAddress
    }
    return val
}


function getServiceInfoWMTS(obj){
    let val = {
        title: obj.value.serviceIdentification.title[0].value,
        abstract: '',
        keywords: '',
        fees: '',
        contactOrganization: '',
        contactName: '',
        contactEmail: ''
    }
    return val
}


function getServiceInfoWFS(obj){
    if (!('keywords' in obj.serviceIdentification)){
        obj.serviceIdentification.keywords = []
    }
    let val = {
        title: obj.serviceIdentification.title[0].value,
        abstract: obj.serviceIdentification._abstract[0].value,
        keywords: obj.serviceIdentification.keywords.map(obj=> (obj.keyword[0].value)),
        fees: obj.serviceIdentification.fees,
        accessConstraints: obj.serviceIdentification.accessConstraints[0],
        contactOrganization: obj.serviceProvider.providerName,
        contactName: obj.serviceProvider.serviceContact.individualName,
        contactEmail: obj.serviceProvider.serviceContact.contactInfo.address.electronicMailAddress[0],
    }
    return val
}

export default {getServiceInfoWMS, getServiceInfoWFS, getServiceInfoWMTS}