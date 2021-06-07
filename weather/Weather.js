const {Telegraf, Composer, Scenes, Markup, session} = require('telegraf');
const OpenWeatherMapHelper = require("openweathermap-node");
require('dotenv').config();
const translateText = require("./Translate");
const WEATHER_TOKEN = process.env.WEATHER_KEY;



const helper = new OpenWeatherMapHelper(
	{
		APPID: WEATHER_TOKEN,
		units: "metric"
	}
);

//---Запускаем Wizard Scene---
//
const startWizard = new Composer();
startWizard.on('text', async ctx => {
	await ctx.reply("Отправь мне название своего города, а я тебе погоду в нем:");
	return ctx.wizard.next();
});


const titleStep = new Composer();
titleStep.on('text', async (ctx) => {
	const currCity = ctx.message.text
	
	if (currCity === "exit"){
		await ctx.scene.leave()
	}
	//todo parse information
	translateText(currCity, 'en')
			.then(result => helper.getCurrentWeatherByCityName(result,
				async (err, currentWeather) => {
					if (err) {
						await ctx.reply("нет информации о таком городе, попробуйте другой");
						await ctx.scene.reenter();
					} else {
						await ctx.reply(currentWeather);
					}
				}))
			.catch(error => error.message);
	return ctx.scene.leave();
});

module.exports = {startWizard, titleStep}