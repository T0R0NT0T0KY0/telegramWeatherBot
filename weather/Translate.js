const {Translate} = require('@google-cloud/translate').v2;
require('dotenv').config();

const CREDENTIALS = JSON.parse(process.env.CREDETIALS);

const translate = new Translate({
	credentials: CREDENTIALS,
	projectId: CREDENTIALS.project_id
});

const translateText = async (text, language) => {
	try {
		let [response] = await translate.translate(text, language);
		return response;
	} catch (e) {
		return "";
	}
};

module.exports = translateText;

