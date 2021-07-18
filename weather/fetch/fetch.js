const fetch = require('node-fetch');

const fetchGetJson = async url => {
    return await fetch(url)
        .then(res => res.json())
        .catch(() => null)
};

const fetchPostJson = async (url, json) => {
    return await new Promise(async (resolve, reject) => {
        await fetch(url, {
            method: `POST`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json),
        }).then((res) => resolve(res))
            .catch(err => reject(err.message));
    });
};

const fetchUpdate = async  (url, json) => {
    return await new Promise(async (resolve, reject) => {
        await fetch(url, {
            method: `PUT`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json),
        }).then((res) => resolve(res))
            .catch(err => reject(err.message));
    });
};

module.exports = {fetchPostJson, fetchGetJson, fetchUpdate};