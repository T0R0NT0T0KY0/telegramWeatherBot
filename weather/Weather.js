const {Telegraf, Composer, Scenes, Markup, session} = require('telegraf');
const OpenWeatherMapHelper = require("openweathermap-node");
const WEATHER_TOKEN = process.env.WEATHER_KEY;


const helper = new OpenWeatherMapHelper(
	{
		APPID: WEATHER_TOKEN,
		units: "imperial"
	}
);

//---Запускаем Wizard Scene---
//
const startWizard = new Composer();
startWizard.on('text', async (ctx) => {
	await ctx.reply("Отправь мне название своего города, а я тебе погоду в нем:");
	return ctx.wizard.next();
});


const titleStep = new Composer();
titleStep.on('text', async (ctx) => {
	const currCity = ctx.message.text
	if (currCity === "exit"){
		await ctx.scene.leave()
	}
	helper.getCurrentWeatherByCityName(currCity, async (err, currentWeather) => {
		if (err) {
			await ctx.reply(err);
		} else {
			await ctx.reply(currentWeather);
		}
	})
	return ctx.scene.leave();
});

module.exports = {startWizard, titleStep}