const {Telegraf, Composer, Scenes, Markup, session} = require('telegraf');
const OpenWeatherMapHelper = require("openweathermap-node");
const WEATHER_TOKEN = process.env.WEATHER_KEY;
const translateText = require("./Translate.js");
const {fetchPostJson, fetchGetJson} = require("./fetch/fetch");
const host = process.env.HOST;
const port = process.env.PORT;

const week = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];

const helper = new OpenWeatherMapHelper(
    {
        APPID: WEATHER_TOKEN,
        units: "metric"
    }
);

const answer = async (inf) => {
    let args = `Привет, сегодня ${week[new Date(inf.updatedAt).getDay()]}, в ${inf.city} `+
     `${await translateText(inf.weather, 'ru')
        .catch(()=>"")}\n`;
    
    // args += await translateText(inf.weather + "", 'ru')
    //     .then(result => result + "\n")
    //     .catch(() => inf.weather);
    
    args += `Температура ${inf.temperature}°C\n`;
    
    if (Math.abs(inf.temperature - inf.fill_temperature) >= 1) {
        args += `Ощущается на ${inf.fill_temperature}°C\n`;
    }
    
    return args + `Влажность ${inf.humidity}%`;
};

const getWeather = async (city) => {
    return await new Promise(async (res, rej) => {
        
        await helper.getCurrentWeatherByCityName(city,
            async (err, currentWeather) => {
                if (err) {
                    return null;
                }
                return res({
                    id: currentWeather["id"],
                    city: currentWeather["name"],
                    updatedAt: new Date(),
                    createdAt: new Date(),
                    weather: currentWeather["weather"][0]["main"],
                    temperature: currentWeather["main"]["temp"],
                    fill_temperature: currentWeather["main"]["feels_like"],
                    humidity: currentWeather["main"]["humidity"],
                });
                
            });
    });
    
};


//---Запускаем Wizard Scene---
//
const firstScene = new Composer();
firstScene.on('text', async ctx => {
    await ctx.reply("Отправь мне название своего города, а я тебе погоду в нем:");
    return ctx.wizard.next();
});


const lastScene = new Composer();

const getWeatherFromDB = async (city) => {
    const information = await fetchGetJson(`http://${host}:${port}/api/city/${city}`)
        .catch(error => console.log(error));
    try {
        return  JSON.parse(information);
    } catch (e) {
        return  null;
    }
}

lastScene.on('text', async (ctx) => {
    let city = ctx.message.text;
    
    if (!(/[a-z]+/i.test(city))) { // если город не на английском
        city = await translateText(city, 'en');
        console.log(city);
    }
    
    let res = await getWeatherFromDB(city);
    
    if (!res) { // если нет в БД
        res = await getWeather(city);
        if (!res) {
            await ctx.scene.reenter();
        }
        console.log(await fetchPostJson(`http://${host}:${port}/api/city`, res)
            .catch(e => e));
        // ложим в бд
    }
    
    ctx.reply(await answer(res));
    
    return ctx.scene.leave();
});

module.exports = {weatherFS: firstScene, weatherLS: lastScene};