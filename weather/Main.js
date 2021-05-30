const {BOT_TOKEN} = process.env.BOT_TOKEN;
const {Telegraf, Composer, Scenes, Markup, session} = require('telegraf');
const nodeFetch = require("node-fetch");
const {startWizard, titleStep} = require("./Weather");

const bot = new Telegraf(BOT_TOKEN);




const menuScene = new Scenes.WizardScene('sceneWizard', startWizard, titleStep);

//---Stage---
//
const stage = new Scenes.Stage([menuScene]);
bot.use(session());
bot.use(stage.middleware());
//------
bot.command('weather', ctx => ctx.scene.enter('sceneWizard'));

bot.start(ctx => ctx.reply(`Привет ${ctx.message.from.username}, я бот,
						который находит для тебя погоду в городе`));


bot.help(ctx => ctx.reply("Отправь мне название своего города, а я тебе погоду в нем"));


bot.on("message", async ctx =>
	await ctx.reply("no command"));

bot.launch();