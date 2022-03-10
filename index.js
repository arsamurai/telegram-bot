require("dotenv").config();
const mongoose = require("mongoose");
const Subject = require("./models/Subject");
const TelegramBot = require("node-telegram-bot-api");
// const token = '5143937293:AAE41S8LzEdO_LAayRDm-DOwU_GQqnMqGb4';
const token = "5222945979:AAGs9GShgnXD0P0S5yuPZIscm6QeNsE-OdM";
const {
  gameOptions,
  againOptions,
  unluckyDaysOptions,
  jokesOptions,
} = require("./options");
const { black_humor, stupid_humor_plus, stupid_humor } = require("./jokes");
const { answers, answer_5, answer_6, answer_3, answer_2 } = require("./answers");

const bot = new TelegramBot(token, { polling: true });

const chats = {};

// Jokes
let usedJokes = [];
let usedBlackHumor = [];
let usedStupidHumor = [];
let usedStupidHumorPlus = [];

let isKeyWord = false;

// DB settings for add subject
let isEnterName = false;
let isEnterLink = false;
let isEnterHT = false;

// DB settings for edit subject
let isEnterEditName = false;
let isEnterEditData = false;

let isEditName = false;
let isEditLink = false;
let isEditHT = false;

let enteredName = "";
const subjectsNames = [];

const startGame = async (chatId, name) => {
  await bot.sendMessage(chatId, `${name}, я загадал решку или орла`);
  const rememberNum = Math.floor(1 + Math.random() * 2);
  chats[chatId] = rememberNum;
  await bot.sendMessage(chatId, "Твоя задача угадать...", gameOptions);
};

const getJoke = (usedAlready, jokes) => {
  let numOfJoke = Math.floor(Math.random() * jokes.length);
  if (!usedAlready.includes(jokes[numOfJoke])) {
    usedAlready.push(jokes[numOfJoke]);
    return numOfJoke;
  } else {
    return getJoke(usedAlready, jokes);
  }
};

const textIncludes = (text, chatId, words, message) => {
  for (let i = 0; i < words.length; i++) {
    if (text.includes(words[i])) {
      isKeyWord = true;
      return bot.sendMessage(chatId, `${message}`);
    }
  }
};

const start = async () => {
  //Set mongoDB
  try {
    mongoose.connect(process.env.DB_URL);
		const subjects = await Subject.find();
    for (let i = 0; i < subjects.length; i++) {
      subjectsNames.push(subjects[i].name);
    }
  } catch (e) {
    console.log(e);
  }

	//Bot commands
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/help", description: "Инфа о методах" },
    { command: "/game", description: "Check your lucky" },
    {
      command: "/unluckydays",
      description: "Count unlucky days in some year",
    },
    { command: "/jokes", description: "Best humor in the world" },
    { command: "/add_subject", description: "Add one more subject" },
    { command: "/get_subjects", description: "Get all subject" },
    { command: "/edit_subject", description: "Edit one subject" },
  ]);

	//Reaction on message
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg && msg.text?.toLowerCase();
    const textForUkraine = msg && msg.text && msg.text;
    const sticker = msg && msg.sticker && msg.sticker;
    const animation = msg && msg.animation && msg.animation;
    const photo = msg && msg.photo && msg.photo;
    const document = msg && msg.document && msg.document;
    const name = msg.from.first_name;
    isKeyWord = false;

    //console.log(msg);

    if (sticker || animation) {
      return bot.sendMessage(chatId, "Заебок");
    }
    if (photo) {
      return bot.sendMessage(chatId, answers(answer_6));
    }
    if (document) {
      return bot.sendMessage(chatId, "Заебок");
    }

    // Add new subject
		if (text === "/add_subject") {
			isEnterName = true;
			return bot.sendMessage(chatId, "Впиши назву предмета");
    }

		if (isEnterName) {
      const candidate = await Subject.findOne({ name: text });
      if (candidate) {
        return bot.sendMessage(chatId,  "Такий предмет уже інсує! Спробуй знову..." );
      }
      const subject = new Subject({ name: text, link: "-", hometask: "-" });
      await subject.save();
			enteredName = text;
			isEnterName = false;
			isEnterLink = true;
			return bot.sendMessage(chatId, "Впиши посилання на предмет");
    }
    if (isEnterLink) {
      await Subject.findOneAndUpdate({ name: enteredName }, { link: text });
      isEnterLink = false;
      isEnterHT = true;
      return bot.sendMessage(chatId, "Впиши д/з на предмета");
    }
    if (isEnterHT) {
      await Subject.findOneAndUpdate({ name: enteredName }, { hometask: text });
			subjectsNames.push(enteredName);
			enteredName = '';
      isEnterHT = false;
      return bot.sendMessage(chatId, "Предмет додано");
    }

    // Get subjects
    if (text === "/get_subjects") {
      let result = "";
      const subjects = await Subject.find();
      for (let i = 0; i < subjects.length; i++) {
        //subjectsNames.push(subjects[i].name);
        result += `
					Name: *${subjects[i].name}*
					Link: __${subjects[i].link}__
					H/t: _${subjects[i].hometask}_
					------------------------------
				`;
      }
      return bot.sendMessage(chatId, `Тримай: ${result}`, {
        parse_mode: "Markdown",
      });
    }

    // Get one subject
		for(let i=0; i<subjectsNames.length; i++) {
			if (!isEnterEditName && text === subjectsNames[i]) {
				let result = "";
				const subject = await Subject.findOne({ name: text });
				result += `
						Name: *${subject.name}*
						Link: __${subject.link}__
						H/t: _${subject.hometask}_
					`;
				return bot.sendMessage(chatId, `Тримай: ${result}`, {
					parse_mode: "Markdown",
				});
			}
		}

		// Edit one subject
		if (text === "/edit_subject") {
			isEnterEditName = true;
      return bot.sendMessage(chatId, "Впиши назву предмета");
    }

		if(isEnterEditName) {
      enteredName = text;
			isEnterEditName = false;
      isEnterEditData = true;
      return bot.sendMessage(chatId, "Що хочеш змінити?");
		}

		if (isEnterEditData && text === 'name') {
      isEditName = true;
      return bot.sendMessage(chatId, "Введи текст для изменения...");
    }
		if (isEnterEditData && text === 'link') {
      isEditLink = true;
      return bot.sendMessage(chatId, "Введи текст для изменения...");
    }
		if (isEnterEditData && text === 'h/t') {
      isEditHT = true;
      return bot.sendMessage(chatId, "Введи текст для изменения...");
    }

		if(isEditName) {
			await Subject.findOneAndUpdate({ name: enteredName }, { name: text });
			subjectsNames.push(text);
			enteredName = '';
			isEnterEditData = false;
			isEditName = false;
      return bot.sendMessage(chatId, "Назву изменено!");
		}
		if(isEditLink) {
			await Subject.findOneAndUpdate({ name: enteredName }, { link: text });
			enteredName = '';
			isEnterEditData = false;
			isEditLink = false;
      return bot.sendMessage(chatId, "Посилання змінено!");
		}

		if(isEditHT) {
			await Subject.findOneAndUpdate({ name: enteredName }, { hometask: text });
			enteredName = '';
			isEnterEditData = false;
			isEditHT = false;
      return bot.sendMessage(chatId, "Д/з змінено!");
		}



    if (text.includes("шутк")) {
      const jokes = [...black_humor, ...stupid_humor, ...stupid_humor_plus];
      if (usedJokes.length > 24) {
        usedJokes = [];
        await bot.sendMessage(
          chatId,
          "Упс, шутки закончились, буду повторять, неугомонний, бля)"
        );
      } else await bot.sendMessage(chatId, `Хтось хоче шутку?`);
      const joke = jokes[getJoke(usedJokes, jokes)];
      return bot.sendMessage(chatId, joke);
    }

    textIncludes(text, chatId, ["привет", "хальоу", "алоха"], answers(answer_2));
    textIncludes(text, chatId, ["аха", "хaх", "пхп", "ахп"], answers(answer_5));
    textIncludes(
      text,
      chatId,
      ["дякую", "спасибо", "благодарю "],
      answers(answer_3)
    );

    if (text.includes("слава") && textForUkraine.includes("Україні")) {
      return bot.sendMessage(chatId, "Героям Слава!");
    } else if (textForUkraine.includes("україн")) {
      return bot.sendMessage(chatId, "Україна з великою пишеться, придурок!");
    } else if (textForUkraine.includes("Україна"))
      return bot.sendMessage(chatId, "Понад усе!");
    if (text.includes("слава нації")) {
      return bot.sendMessage(chatId, "Смерть ворогам!");
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

    !isKeyWord && bot.sendMessage(chatId, "Я хз, шо ти хочеш(");
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const name = msg.from.first_name;

    console.log(msg);

    if (data === "/again") {
      return startGame(chatId, name);
    }

		//Jokes
    if (data === "black-humor") {
      if (usedBlackHumor.length > 8) {
        usedBlackHumor = [];
        await bot.sendMessage(chatId, "Упс, шутки закончились, на повтор!");
      }
      const joke = black_humor[getJoke(usedBlackHumor, black_humor)];
      return bot.sendMessage(chatId, joke);
    }
    if (data === "stupid-humor") {
      if (usedStupidHumor.length > 10) {
        usedStupidHumor = [];
        await bot.sendMessage(chatId, "Упс, шутки закончились, на повтор!");
      }
      const joke = stupid_humor[getJoke(usedStupidHumor, stupid_humor)];
      return bot.sendMessage(chatId, joke);
    }
    if (data === "stupid-humor-plus") {
      if (usedStupidHumorPlus.length > 4) {
        usedStupidHumorPlus = [];
        await bot.sendMessage(chatId, "Упс, шутки закончились, на повтор!");
      }
      const joke =
        stupid_humor_plus[getJoke(usedStupidHumorPlus, stupid_humor_plus)];
      return bot.sendMessage(chatId, joke);
    }

		// Get count of Friday 13
    if (data.length === 4) {
      let count = 0;
      let date = new Date(data, 0, 1);

      let maxCountDays = date.getFullYear() % 4 === 0 ? 366 : 365;

      for (let i = 1; i <= maxCountDays; i++) {
        date.setDate(date.getDate() + 1);
        if (date.getDate() === 13 && date.getDay() === 5) count++;
      }
      return bot.sendMessage(chatId, `В ${data}'ом пятниц 13го - ${count}`);
    }

		// Eagle or tail
    if (data == chats[chatId]) {
      return bot.sendMessage(
        chatId,
        `Поздравляю, ти угадав ${
          chats[chatId] === 1 ? "орла" : "решку"
        }, йди набухайся!`,
        againOptions
      );
    } else {
      return bot.sendMessage(
        chatId,
        `Сорі, ти проэбався( Я загадав ${
          chats[chatId] === 1 ? "орла" : "решку"
        }`,
        againOptions
      );
    }
  });
};

start();
