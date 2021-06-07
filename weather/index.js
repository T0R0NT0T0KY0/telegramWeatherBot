Justconst BOT_TOKEN = process.env.BOT_TOKEN;
const {Telegraf, Composer, Scenes, Markup, session} = require('telegraf');
const nodeFetch = require("node-fetch");
const {startWizard, titleStep} = require("./Weather");
const translateText = require("./Translate");

const bot = new Telegraf(BOT_TOKEN);


const menuScene = new Scenes.WizardScene('sceneWizard', startWizard, titleStep);

//---Stage---
//
const stage = new Scenes.Stage([menuScene]);
bot.use(session());
bot.use(stage.middleware());
//------

bot.command('weather', ctx => ctx.scene.enter('sceneWizard'));

bot.command('translatetoen', ctx => (translateText(ctx.message.text, "en")
	.then(res => ctx.reply(res), err => ctx.reply(err))));


bot.start(ctx => ctx.reply(`Привет ${ctx.message.from.username}, я очень развитый бот, ` +
	`могу много чем помочь. \n` +
	`Пока что нахожусь в разработке[v1]`));


bot.help(ctx => ctx.reply("список комманд:" +
	"/weather узнать погоду в городе"));


bot.on("message", async ctx =>
	await ctx.reply("такой команды нет, используй /help"));


bot.launch();
