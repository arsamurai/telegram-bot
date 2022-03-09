const TelegramBot = require('node-telegram-bot-api');
// const token = '5143937293:AAE41S8LzEdO_LAayRDm-DOwU_GQqnMqGb4';
const token = '5222945979:AAGs9GShgnXD0P0S5yuPZIscm6QeNsE-OdM';
const { gameOptions, againOptions, unluckyDaysOptions, jokesOptions } = require('./options');
const { black_humor, stupid_humor_plus, stupid_humor } = require('./jokes');
const { answers, answer_5, answer_6 } = require('./answers');

const bot = new TelegramBot(token, { polling: true });

const chats = {};

let usedJokes = [];
let usedBlackHumor = [];
let usedStupidHumor = [];
let usedStupidHumorPlus = [];

let isKeyWord = false;

const startGame = async (chatId, name) => {
  await bot.sendMessage(chatId, `${name}, я загадал решку или орла`);
  const rememberNum = Math.floor(1 + Math.random() * 2);
  chats[chatId] = rememberNum;
  await bot.sendMessage(chatId, 'Твоя задача угадать...', gameOptions);
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

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветствие' },
    { command: '/help', description: 'Инфа о методах' },
    { command: '/game', description: 'Check your lucky' },
    {
      command: '/unluckydays',
      description: 'Count unlucky days in some year',
    },
    { command: '/jokes', description: 'Best humor in the world' },
  ]);

  bot.on('message', async (msg) => {
    console.log(msg);
    const chatId = msg.chat.id;
    const text = msg && msg.text?.toLowerCase();
    const sticker = msg && msg.sticker && msg.sticker;
    const animation = msg && msg.animation && msg.animation;
    const photo = msg && msg.photo && msg.photo;
    const document = msg && msg.document && msg.document;
    const name = msg.from.first_name;
    isKeyWord = false;

    if (sticker || animation) {
      return bot.sendMessage(chatId, 'Заебок');
    }
    if (photo) {
      return bot.sendMessage(chatId, answers(answer_6));
    }
    if (document) {
      return bot.sendMessage(chatId, 'Заебок');
    }

    if (text.includes('шутк')) {
      const jokes = [...black_humor, ...stupid_humor, ...stupid_humor_plus];
      if (usedJokes.length > 24) {
        usedJokes = [];
        await bot.sendMessage(chatId, 'Упс, шутки закончились, буду повторять, неугомонний, бля)');
      } else await bot.sendMessage(chatId, `Хтось хоче шутку?`);
      const joke = jokes[getJoke(usedJokes, jokes)];
      return bot.sendMessage(chatId, joke);
    }

    textIncludes(text, chatId, ['аха', 'хaх', 'пхп', 'ахп'], answers(answer_5));
    textIncludes(text, chatId, ['дякую'], 'Та йди нахер)');
    textIncludes(text, chatId, ['слава україні'], 'Героям Слава!');
    textIncludes(text, chatId, ['дякую'], 'Та йди нахер)');

    if (text.includes('слава') && textForUkraine.includes('Україні')) {
      return bot.sendMessage(chatId, 'Героям Слава!');
    } else if (textForUkraine.includes('україн')) {
      return bot.sendMessage(chatId, 'Україна з великою пишеться, придурок!');
    } else if (textForUkraine.includes('Україна')) return bot.sendMessage(chatId, 'Понад усе!');
    if (text.includes('слава нації')) {
      return bot.sendMessage(chatId, 'Смерть ворогам!');
    }

    if (text === '/start') {
      return bot.sendMessage(chatId, `${name}, здарова`);
    }
    if (text === '/help') {
      return bot.sendMessage(chatId, `${name}, сорі, але тут 0 інфи`);
    }
    if (text === '/game') {
      return startGame(chatId, name);
    }
    if (text === '/unluckydays') {
      return bot.sendMessage(chatId, 'Вибери рік...', unluckyDaysOptions);
    }
    if (text === '/jokes') {
      return bot.sendMessage(chatId, 'Захотелось поугарать?...', jokesOptions);
    }

    !isKeyWord && bot.sendMessage(chatId, 'Я хз, шо ти хочеш(');
  });

  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const name = msg.from.first_name;

    if (data === '/again') {
      return startGame(chatId, name);
    }
    if (data === 'black-humor') {
      if (usedBlackHumor.length > 8) {
        usedBlackHumor = [];
        await bot.sendMessage(chatId, 'Упс, шутки закончились, на повтор!');
      }
      const joke = black_humor[getJoke(usedBlackHumor, black_humor)];
      return bot.sendMessage(chatId, joke);
    }
    if (data === 'stupid-humor') {
      if (usedStupidHumor.length > 10) {
        usedStupidHumor = [];
        await bot.sendMessage(chatId, 'Упс, шутки закончились, на повтор!');
      }
      const joke = stupid_humor[getJoke(usedStupidHumor, stupid_humor)];
      return bot.sendMessage(chatId, joke);
    }
    if (data === 'stupid-humor-plus') {
      if (usedStupidHumorPlus.length > 4) {
        usedStupidHumorPlus = [];
        await bot.sendMessage(chatId, 'Упс, шутки закончились, на повтор!');
      }
      const joke = stupid_humor_plus[getJoke(usedStupidHumorPlus, stupid_humor_plus)];
      return bot.sendMessage(chatId, joke);
    }
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
    if (data == chats[chatId]) {
      return bot.sendMessage(
        chatId,
        `Поздравляю, ти угадав ${chats[chatId] === 1 ? 'орла' : 'решку'}, йди набухайся!`,
        againOptions,
      );
    } else {
      return bot.sendMessage(
        chatId,
        `Сорі, ти проэбався( Я загадав ${chats[chatId] === 1 ? 'орла' : 'решку'}`,
        againOptions,
      );
    }
  });
};

start();
