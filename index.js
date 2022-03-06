const TelegramBot = require("node-telegram-bot-api");
const token = "5222945979:AAGs9GShgnXD0P0S5yuPZIscm6QeNsE-OdM";
const { gameOptions, againOptions, unluckyDaysOptions, jokesOptions } = require("./options");
const { black_humor, stupid_humor_plus, stupid_humor } = require("./jokes");

const bot = new TelegramBot(token, { polling: true });

const chats = {};

let usedJokes = [];
let usedBlackHumor = [];
let usedStupidHumor = [];
let usedStupidHumorPlus = [];

const startGame = async (chatId, name) => {
  await bot.sendMessage(chatId, `${name}, я загадал решку или орла`);
  const rememberNum = Math.floor( 1 + Math.random() * 2);
  chats[chatId] = rememberNum;
  await bot.sendMessage(chatId, "Твоя задача угадать...", gameOptions);
};

const getJoke = (usedAlready, jokes) => {
	let numOfJoke = Math.floor(Math.random() * jokes.length);
	if(!usedAlready.includes(jokes[numOfJoke])) {
		usedAlready.push(jokes[numOfJoke]);
		return numOfJoke;
	} else {
		return getJoke(usedAlready, jokes);
	}
}

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/help", description: "Инфа о методах" },
    { command: "/game", description: "Check your lucky" },
    {
      command: "/unluckydays",
      description: "Count unlucky days in some year",
    },
		{ command: "/jokes", description: "Best humor in the world" },
  ]);

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();
    const name = msg.from.first_name;

		if (text.includes("шутк")) {
			const jokes = [...black_humor, ...stupid_humor, ...stupid_humor_plus];
			if(usedJokes.length > 24) {
				usedJokes = [];
				await bot.sendMessage(chatId, "Упс, шутки закончились, буду повторять, неугомонний, бля)");
			} else await bot.sendMessage(chatId, `Хтось хоче шутку?`);
			const joke = jokes[getJoke(usedJokes, jokes)];
			return bot.sendMessage(chatId, joke);
    }
		if (text.includes('ах') ||
				text.includes('хa') ||
				text.includes('пх')) {
      return bot.sendMessage(chatId, `Ага, сам чуть не впісявся`);
    }
		if (text.includes("слава україні")) {
      return bot.sendMessage(chatId, `Героям Слава!`);
    }
		if (text === "cпасибо" || text === "дякую") {
      return bot.sendMessage(chatId, `Та йди нахер)`);
    }
    if (text === "/start") {
      return bot.sendMessage(chatId, `${name}, здарова`);
    }
    if (text === "/help") {
      return bot.sendMessage(chatId, `${name}, сорі, але тут 0 інфи`);
    }
    if (text === "/game") {
      return startGame(chatId, name);
    }
    if (text === "/unluckydays") {
      return bot.sendMessage(chatId, "Вибери рік...", unluckyDaysOptions);
    }
    if (text === "/jokes") {
      return bot.sendMessage(chatId, "Захотелось поугарать?...", jokesOptions);
    }

    return bot.sendMessage(chatId, "Я хз, шо ти хочеш(");
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const name = msg.from.first_name;

    if(data === "/again") {
      return startGame(chatId, name);
    }
		if(data === "black-humor") {
			if(usedBlackHumor.length > 8) {
				usedBlackHumor = [];
				await bot.sendMessage(chatId, "Упс, шутки закончились, на повтор!");
			}
			const joke = black_humor[getJoke(usedBlackHumor, black_humor)];
			return bot.sendMessage(chatId, joke);
		}
		if(data === "stupid-humor") {
			if(usedStupidHumor.length > 10) {
				usedStupidHumor = [];
				await bot.sendMessage(chatId, "Упс, шутки закончились, на повтор!");
			}
			const joke = stupid_humor[getJoke(usedStupidHumor, stupid_humor)];
			return bot.sendMessage(chatId, joke);
		}
		if(data === "stupid-humor-plus") {
			if(usedStupidHumorPlus.length > 4) {
				usedStupidHumorPlus = [];
				await bot.sendMessage(chatId, "Упс, шутки закончились, на повтор!");
			}
			const joke = stupid_humor_plus[getJoke(usedStupidHumorPlus, stupid_humor_plus)];
			return bot.sendMessage(chatId, joke);
		}
		if(data.length === 4) {
      let count = 0;
      let date = new Date(data, 0, 1);

      let maxCountDays = date.getFullYear() % 4 === 0 ? 366 : 365;

      for (let i = 1; i <= maxCountDays; i++) {
        date.setDate(date.getDate() + 1);
        if (date.getDate() === 13 && date.getDay() === 5) count++;
      }
      return bot.sendMessage(chatId, `В ${data}'ом пятниц 13го - ${count}`);
    }
    if(data == chats[chatId]) {
      return bot.sendMessage(
        chatId,
        `Поздравляю, ти угадав ${chats[chatId] === 1 ? 'орла' : 'решку'}, йди набухайся!`,
        againOptions
      );
    } else {
      return bot.sendMessage(
        chatId,
        `Сорі, ти проэбався( Я загадав ${chats[chatId] === 1 ? 'орла' : 'решку'}`,
        againOptions
      );
    }
  });
};

start();
