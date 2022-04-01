exports.GETgeneric = (table, req) => {
    const Model = require(`../models/${table}`)
    const existingKeys = Object.keys(Model[0])
    const queryKeys = Object.keys(req.query)
    const queryValues = Object.values(req.query)
    const notSupportedKeys = []

    if(queryKeys.length > existingKeys.length){
        return ('You used too many search parameters')
    }

    for (let i = 0; i < queryKeys.length; i++) {
        const key = queryKeys[i]
        if(!existingKeys.includes(key))
            notSupportedKeys.push(key)
    }

    if(notSupportedKeys.length > 0){
        return `The parameters "${(notSupportedKeys).toString().replaceAll(',', ', ')}" does not exist in the database. \nSupported query parameters: "${(existingKeys).filter(e=>e!='id').toString().replaceAll(',', ', ')}".`
    }

    if(queryKeys.includes('id')){
        return `You are passing the ID through query parameters, if you wish to get a specific ID you should use the :id option within the URI`
    }

    const id = req?.params?.id
    const withoutId = !id
    const response = []


    if(!id && queryKeys.length < 1){
        return Model
    }

    if(id && queryKeys.length < 1){
        return Model[id-1]
        return
    }

    for (let i = 0; i < Object.keys(Model).length; i++) {
        const model = Model[i]
        let isTrueMatch = false

        for (let k = 0; k < queryKeys.length; k++) {
            if((model[queryKeys[k]] == queryValues[k] || queryValues[k].includes(model[queryKeys[k]].toString())) && (model.id == id || withoutId))
                isTrueMatch = true
            else
                isTrueMatch = false; continue
        }

        if(isTrueMatch)
            response.push(model)
    }

    return response
}