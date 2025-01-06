const { selectTemplateApi } = require('../db/templateApi')
const redis = require('../redis')

module.exports = {
    selectTemplateApi: async (idTemplate) => {
        let data = await redis.get("TEMPLATE", idTemplate)
        if (!data) {
            data = (await selectTemplateApi(idTemplate)).rows
            if (data.length)
                await redis.set("TEMPLATE", idTemplate, data)
        }
        return data;
    }
}
