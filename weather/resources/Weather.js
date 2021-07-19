const OpenWeatherMapHelper = require("openweathermap-node");
const WEATHER_TOKEN = process.env.WEATHER_KEY;


const helper = new OpenWeatherMapHelper(
    {
        APPID: WEATHER_TOKEN,
        units: "metric"
    }
);

const getWeather = async (city) => {
    return await new Promise(async (res, rej) => {
        
        await helper.getCurrentWeatherByCityName(city,
            async (err, currentWeather) => {
                if (err) {
                    return res(null);
                }
                const date = new Date();
                return res({
                    id: currentWeather["id"],
                    city: currentWeather["name"],
                    updatedAt: date,
                    createdAt: date,
                    weather: currentWeather["weather"][0]["main"],
                    temperature: currentWeather["main"]["temp"],
                    fill_temperature: currentWeather["main"]["feels_like"],
                    humidity: currentWeather["main"]["humidity"],
                });
            });
    });
    
};

module.exports = {getWeather};