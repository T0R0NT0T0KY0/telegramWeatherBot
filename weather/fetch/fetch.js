const fetch = require('node-fetch');

const fetchGetJson = async url => {
    return await fetch(url)
        .then(res => res.json())
        .catch(() => null)
};

const fetchPostJson = async (url, json) => {
    return await fetch(url, {
        method: `POST`,
        body: JSON.stringify(json),
    }).then(res => res.json())
        .catch(err => err.message)
};

module.exports = {fetchPostJson, fetchGetJson};