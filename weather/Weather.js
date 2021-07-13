const {Telegraf, Composer, Scenes, Markup, session} = require('telegraf');
const OpenWeatherMapHelper = require("openweathermap-node");
const WEATHER_TOKEN = process.env.WEATHER_KEY;
const translateText = require("./Translate.js");
const {fetchPostJson, fetchGetJson} = require("./fetch/fetch");
const host = process.env.HOST;
const port = process.env.PORT;

const helper = new OpenWeatherMapHelper(
    {
        APPID: WEATHER_TOKEN,
        units: "metric"
    }
);
const answer = async (inf) => {
    let args = `Привет, сейчас [ ${inf.updatedAt.toString()} ] за бортом твоего дома `;
    
    args += await translateText(inf.weather + "", 'ru')
        .then(result => result+"\n")
        .catch(() => inf.weather);
    
    args += `Температура ${inf.temperature}°C\n`;
    if (inf.temperature !== inf.fill_temperature) {
        args += `Ощущается на ${inf.fill_temperature}°C\n`;
    }
    
    return args + `Влажность ${inf.humidity}%`;

    
};

const resolve = async (result) => {
    return await new Promise(async (res, rej) => {
        
        await helper.getCurrentWeatherByCityName(result,
            async (err, currentWeather) => {
                if (err) {
                    return res = {
                        err: true,
                        err_text: "нет информации о таком городе, попробуй другой"
                    };
                } else {
                    return res = {
                        id: currentWeather["id"],
                        city: currentWeather["name"],
                        updatedAt: Date.now(),
                        createdAt: Date.now(),
                        weather: currentWeather["weather"][0]["main"],
                        temperature: currentWeather["main"]["temp"],
                        fill_temperature: currentWeather["main"]["feels_like"],
                        humidity: currentWeather["main"]["humidity"],
                        err: false
                    };
                }
            });
    })
    
};


//---Запускаем Wizard Scene---
//
const firstScene = new Composer();
firstScene.on('text', async ctx => {
    await ctx.reply("Отправь мне название своего города, а я тебе погоду в нем:");
    return ctx.wizard.next();
});


const lastScene = new Composer();

lastScene.on('text', async (ctx) => {
    const currCity = ctx.message.text;
    
    let rez = await fetchGetJson(`${host}:${port}/api/city/:${currCity}`);
    
    if (rez && rez.updatedAt + 600000 <= Date.now()) {
        return ctx.scene.leave();
    } else if (/[a-z]+/i.test(currCity)) {
        rez = await resolve(currCity).catch(e => ctx.resolve(e));
    } else {
        rez = await translateText(currCity, 'en')
            .then(async result => await resolve(result))
            .catch(error => error.message);
    }
    await answer(rez);
    
    await fetchPostJson(`${host}:${port}/api/city`, rez);
    
    return ctx.scene.leave();
});

module.exports = {weatherFS: firstScene, weatherLS: lastScene};