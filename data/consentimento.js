const { selectConsent } = require('../db/consentimento')
const redis = require('../redis')

module.exports = {
    selectConsent: async (idConsentimento) => {
        return (await selectConsent(idConsentimento)).rows
    }
}
