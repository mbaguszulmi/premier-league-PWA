const idbPromised = idb.open('CL_db', 1, upgradedDb=> {
    if (!upgradedDb.objectStoreNames.contains('favorite_team')) {
        upgradedDb.createObjectStore("favorite_team", {keyPath: "id"})
    }
})

const dbGetAllFavoriteTeam = () => {
    return new Promise((resolve, reject) => {
        idbPromised.then(db => {
            const transaction = db.transaction("favorite_team", 'readonly')
            return transaction.objectStore("favorite_team").getAll()
        })
        .then(data => {
            if (data !== undefined) {
                resolve(data)
            }
            else {
                reject(new Error('Team crest data not found'))
            }
        })
    })
}

const dbInsertFavoriteTeam = favoriteTeamData => {
    return new Promise((resolve, reject) => {
        idbPromised.then(db => {
            const transaction = db.transaction("favorite_team", 'readwrite')
            transaction.objectStore("favorite_team").add(favoriteTeamData)
            return transaction
        })
        .then(transaction => {
            if (transaction.complete) {
                resolve(true)
            }
            else {
                reject(new Error(transaction.onerror))
            }
        })
        .catch(error => {
            reject(new Error(error));
        })
    })
}

const dbGetFavoriteTeam = id => {
    return new Promise((resolve, reject) => {
        idbPromised.then(db => {
            const transaction = db.transaction("favorite_team", 'readonly')
            return transaction.objectStore("favorite_team").get(id)
        })
        .then(data => {
            if (data !== undefined) {
                resolve(data);
            }
            else {
                reject(new Error(`Team crest with id ${id} not found`))
            }
        })
    })
}

const dbUpdateFavoriteTeam = (favoriteTeamData, id) => {
    return new Promise((resolve, reject) => {
        idbPromised.then(db => {
            const transaction = db.transaction("favorite_team", 'readwrite')
            transaction.objectStoreNames("favorite_team").put(favoriteTeamData, id)
            return transaction
        })
        .then(transaction => {
            if (transaction.complete) {
                resolve(true)
            }
            else {
                reject(new Error(transaction.onerror))
            }
        })
    })
}

const dbDeleteFavoriteTeam = id => {
    return new Promise((resolve, reject) => {
        idbPromised.then(db => {
            const transaction = db.transaction("favorite_team", 'readwrite')
            transaction.objectStore("favorite_team").delete(id)
            return transaction
        })
        .then(transaction => {
            if (transaction.complete) {
                resolve(true)
            }
            else {
                reject(new Error(transaction.onerror))
            }
        })
    })
}
