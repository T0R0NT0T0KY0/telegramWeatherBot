const {Telegraf, Composer, Scenes, Markup, session} = require('telegraf');
const OpenWeatherMapHelper = require("openweathermap-node");
const WEATHER_TOKEN = process.env.WEATHER_KEY;
const translateText = require("./Translate.js");


const helper = new OpenWeatherMapHelper(
	{
		APPID: WEATHER_TOKEN,
		units: "metric"
	}
);

const resolve = async (result, ctx) => {
	helper.getCurrentWeatherByCityName(result,
		async (err, currentWeather) => {
			if (err) {
				await ctx.reply("нет информации о таком городе, попробуйте другой");
				await ctx.scene.reenter();
			} else {
				await ctx.reply(await parseWeatherInformation(currentWeather));
			}
		});
};

//---Запускаем Wizard Scene---
//
const startWizard = new Composer();
startWizard.on('text', async ctx => {
	await ctx.reply("Отправь мне название своего города, а я тебе погоду в нем:");
	return ctx.wizard.next();
});


const titleStep = new Composer();

parseWeatherInformation = async obj => {
	
	let text =
`Привет, сейчас за бортом твоего дома ${obj["weather"][0]["main"]}
Температура: ${obj["main"]["temp"]}℃\n`;
	
	if (Math.abs(obj["main"]["feels_like"] - obj["main"]["temp"]) > 2) {
		text += `Чувствуется на: ${obj["main"]["feels_like"]}\n`
	}
	
	return text + `Влажность: ${obj["main"]["humidity"]} %`;
}

titleStep.on('text', async (ctx) => {
	const currCity = ctx.message.text;
	
	if (currCity === "exit") {
		await ctx.scene.leave();
	}
	
	if(/[a-z]+/i.test(currCity)){
		await resolve(currCity, ctx);
		return ctx.scene.leave();
	}
	
	translateText(currCity, 'en')
		.then(result => resolve(result, ctx))
		.catch(error => error.message);
	return ctx.scene.leave();
});

module.exports = {startWizard, titleStep};