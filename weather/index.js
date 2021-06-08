const {Telegraf, Composer, Scenes, Markup, session} = require('telegraf');
const nodeFetch = require("node-fetch");
require('dotenv').config();
const {weatherFS, weatherLS} = require("./Weather");
const translateText = require("./Translate");
const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(BOT_TOKEN);


const weatherScene = new Scenes.WizardScene('weatherScene', weatherFS, weatherLS);

//---Stage---
//
const stage = new Scenes.Stage([weatherScene]);
bot.use(session());
bot.use(stage.middleware());
//------

bot.command('weather', ctx => ctx.scene.enter('weatherScene'));


bot.start(ctx => ctx.reply(`Привет ${ctx.message.from.username}, я очень развитый бот, ` +
	`могу много чем помочь. \n` +
	`Пока что нахожусь в разработке[v1]`));


bot.help(ctx => ctx.reply("список комманд:\n" +
	"/weather узнать погоду в городе\n"));


bot.on("message", async ctx =>
	await ctx.reply("такой команды нет, используй /help"));


bot.launch();