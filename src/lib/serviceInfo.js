
function getServiceInfoWMS(obj){
    return {
        title: obj.Title,
        abstract: obj.Abstract,
        keywords: obj.KeywordList,
        fees: obj.Fees,
        contactOrganization: obj.ContactInformation.ContactPersonPrimary.ContactOrganization,
        contactName: obj.ContactInformation.ContactPersonPrimary.ContactPerson,
        contactEmail: obj.ContactInformation.ContactElectronicMailAddress
    }
}

function getServiceInfoWFS(obj){
    let val = {
        title: obj.serviceIdentification.title[0].value,
        abstract:  obj.serviceIdentification._abstract[0].value,
        keywords:  obj.serviceIdentification.keywords.map(obj=> (obj.keyword[0].value)),    
        fees: obj.serviceIdentification.fees,
        accessConstraints: obj.serviceIdentification.accessConstraints[0],
        contactOrganization: obj.serviceProvider.providerName,
        contactName: obj.serviceProvider.serviceContact.individualName,
        contactEmail: obj.serviceProvider.serviceContact.contactInfo.address.electronicMailAddress[0    ],
    }
    return val
}

export default {getServiceInfoWMS, getServiceInfoWFS}