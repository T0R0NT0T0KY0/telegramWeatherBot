const {Composer} = require('telegraf');
const {getWeather} = require("../resources/Weather");
const translateText = require("../resources/Translate.js");
const {fetchPostJson, fetchGetJson, fetchUpdate} = require("../fetch/fetch");
const host = process.env.HOST;
const port = process.env.PORT;

const week = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];

const answer = async (inf) => {
    let args = `Привет, сегодня ${week[new Date(inf.updatedAt).getDay()]}, в ${inf.city} ` +
        `${await translateText(inf.weather, 'ru')
            .catch(() => "")}\n`;
    
    args += `Температура ${inf.temperature}°C\n`;
    
    if (Math.abs(inf.temperature - inf.fill_temperature) >= 1) {
        args += `Ощущается на ${inf.fill_temperature}°C\n`;
    }
    
    return args + `Влажность ${inf.humidity}%`;
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
    const text = await fetchGetJson(`http://${host}:${port}/api/city/${city}`);
    return text ? JSON.parse(text) : null;
}


function isFresh (res) {
    return new Date().valueOf() - new Date(res.updatedAt).valueOf() <= 500000;
}

lastScene.on('text', async (ctx) => {
    let city = ctx.message.text;
    
    if (!(/[a-z]+/i.test(city))) { // если город не на английском
        city = await translateText(city, 'en');
    }
    
    let res = await getWeatherFromDB(city);
    
    const b = !isFresh(res);
    if (res && b) {
        res = await getWeather(city);
        await fetchUpdate(`http://${host}:${port}/api/city`, res)
            .catch(e => console.log(e));
    }
    if (!res) { // если нет в БД
        res = await getWeather(city);
        if (!res) {
            ctx.reply("Нет информации о существовании такого города");
            await ctx.scene.reenter();
        }
        
        await fetchPostJson(`http://${host}:${port}/api/city`, res)
            .catch(e => e);
        // ложим в бд
    }
    
    ctx.reply(await answer(res));
    
    return ctx.scene.leave();
});

module.exports = {weatherFS: firstScene, weatherLS: lastScene};