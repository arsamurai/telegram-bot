require("dotenv").config();
const mongoose = require("mongoose");
// const token = '5143937293:AAE41S8LzEdO_LAayRDm-DOwU_GQqnMqGb4';
const token = "5222945979:AAGs9GShgnXD0P0S5yuPZIscm6QeNsE-OdM";
const TelegramBot = require("node-telegram-bot-api");
const {
  gameOptions,
  againGameOptions,
  jokesOptions,
  lessonOptions,
  dayOptions,
  subjectChangeOptions,
  hometaskOptions,
  botOptions,
	weekOptions,
	getUserLocation
} = require("./options");
const { black_humor, stupid_humor_plus, stupid_humor } = require("./jokes");
const {
  answers,
  answer_5,
  answer_6,
  answer_3,
  answer_2,
} = require("./answers");
const { Subject, User } = require("./models/Schemas");

const bot = new TelegramBot(token, { polling: true });
const chats = {};
const subjectsNames = [];
const lessonsNums = {
	1: "08:00-09:35",
	2: "09:50-11:25",
	3: "11:50-13:25", 
	4: "13:40-15:15",
	5: "15:20-16:55"
}
const weekNums = {
	"even": "П",
	"odd": "Н",
}

// Jokes
let usedJokes = [];
let usedBlackHumor = [];
let usedStupidHumor = [];
let usedStupidHumorPlus = [];

const startGame = async (chatId, name) => {
	chats[`isGame-${chatId}`] = true;
  await bot.sendMessage(chatId, `${name}, я загадал решку чи орла`);
  const rememberNum = Math.floor(1 + Math.random() * 2);
  chats[`gameNum-${chatId}`] = rememberNum;
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
      chats[`isKeyWord-${chatId}`] = true;
      return bot.sendMessage(chatId, `${message}`);
    }
  }
};

const getDaySubjects = (subjects) => {
	let day = '';
	for(let i=0; i<subjects.length; i++) {
		if(subjects[i+1] && subjects[i].numOfLesson === subjects[i+1].numOfLesson) {
			day += `
_${subjects[i].numOfLesson}_) \`${lessonsNums[subjects[i].numOfLesson]}\` — "[${subjects[i].name.toUpperCase()} | ${weekNums[subjects[i].numOfWeek]}](${subjects[i].link})" | "[${subjects[i+1].name.toUpperCase()} | ${weekNums[subjects[i+1].numOfWeek]}](${subjects[i+1].link})"`;
		} else if(subjects[i-1] && subjects[i].numOfLesson !== subjects[i-1].numOfLesson){
		day += `
_${subjects[i].numOfLesson}_) \`${lessonsNums[subjects[i].numOfLesson]}\` — "[${subjects[i].name.toUpperCase()} | ${weekNums[subjects[i].numOfWeek]}](${subjects[i].link})"`;
		} else if(!subjects[i-1] && !subjects[i-1]) {
		day += `
_${subjects[i].numOfLesson}_) \`${lessonsNums[subjects[i].numOfLesson]}\` — "[${subjects[i].name.toUpperCase()} | ${weekNums[subjects[i].numOfWeek]}](${subjects[i].link})"`;
		}
	}
	return day;
}

const getWeatherByCity = async (chatId, city) => {
	chats[`isKeyWord-${chatId}`] = true;
	const response = await import('node-fetch').then(({ default: fetch }) => fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=uk&appid=${process.env.weatherApiKey}`))
	const data = await response.json();
	if(data.cod == 404) {
		return bot.sendMessage(chatId, 'Пункт не розпізнаний(');
	}
	const yourCity = city[0].toUpperCase() + city.slice(1);
	await bot.sendMessage(chatId, `Погода в пункті ${yourCity}: ${data.weather[0].description}`, botOptions);
	await bot.sendPhoto(chatId, `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)
	return bot.sendMessage(chatId, `Температура: ${data.main.temp} °С`);
}

const getWeather = async (chatId, lat, lon) => {
	chats[`isKeyWord-${chatId}`] = true;
	const response = await import('node-fetch').then(({ default: fetch }) => fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=uk&appid=${process.env.weatherApiKey}`))
	const data = await response.json();
	const response_city = await import('node-fetch').then(({ default: fetch }) => fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.weatherApiKey}`))
	const data_city = await response_city.json();
	if(data.cod == 404 || data_city == 404) {
		return bot.sendMessage(chatId, 'Пункт не розпізнаний(');
	}
	await bot.sendMessage(chatId, `Погода в пункті ${data_city[0].local_names['uk']}: ${data.weather[0].description}`, botOptions);
	await bot.sendPhoto(chatId, `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)
	return bot.sendMessage(chatId, `Температура: ${data.main.temp} °С`);
}

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

  let subjectsNamesOptions = subjectsNames.map((item) => {
    return [{ text: item, callback_data: item }];
  });

  //Bot commands
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/help", description: "Инфа о методах" },
    { command: "/game", description: "Check your lucky" },
    { command: "/jokes", description: "Best humor in the world" },
    { command: "/get_subjects", description: "Get all subject" },
    { command: "/add_subject", description: "Add one more subject" },
    { command: "/edit_subject", description: "Edit one subject" },
    { command: "/delete_subject", description: "Delete one subject" },
    { command: "/get_your_city_weather", description: "Get weather of your location" },
    { command: "/get_city_weather", description: "Get weather of any city location" },
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
    const voice = msg && msg.voice && msg.voice;
    const video_note = msg && msg.video_note && msg.video_note;
    const location = msg && msg.location && msg.location;
    const contact = msg && msg.contact && msg.contact;
    const name = msg.from.first_name;
		chats[`isKeyWord-${chatId}`] = false;

		//console.log(msg);

    if (sticker || animation) {
      return bot.sendMessage(chatId, "Заебок", {
				reply_to_message_id: msg.message_id
			});
    }
    if (photo || video_note || voice) {
      return bot.sendMessage(chatId, answers(answer_6), {
				reply_to_message_id: msg.message_id
			});
    }
    if (document || contact) {
      return bot.sendMessage(chatId, "Заебок");
    }

		// Enter password
		if (!chats[`isAuth-${chatId}`] && text === "/add_subject" 
		|| !chats[`isAuth-${chatId}`] && text === "/edit_subject" 
		|| !chats[`isAuth-${chatId}`] && text === "/delete_subject") {
      chats[`isEnterPassword-${chatId}`] = true;
      return bot.sendMessage(chatId, "Ого, для цього введи пароль...");
    }

		if(chats[`isEnterPassword-${chatId}`]) {
			chats[`isEnterPassword-${chatId}`] = false;
			if(text === process.env.botPassword) {
				chats[`isAuth-${chatId}`] = true;
				return bot.sendMessage(chatId, "Правильно! Тепер можеш додати/змінити/видалити предмет)");
			} else {
				return bot.sendMessage(chatId, "Не, не угадав(");
			}
		}

    // Add new subject
		if(text === "/add_subject") {
			chats[`isEnterName-${chatId}`] = true;
      return bot.sendMessage(chatId, "Впиши назву предмета");
		}

    if (chats[`isEnterName-${chatId}`]) {
			if(text.includes('`')) return bot.sendMessage(chatId, "В назві не може бути таких скобок: ` . Спробуй знову...");
      const candidate = await Subject.findOne({ name: text });
      if (candidate) {
        return bot.sendMessage(
          chatId,
          "Такий предмет уже інсує! Спробуй знову..."
        );
      }
      const subject = new Subject({ name: text, link: '-', hometask: '-', numOfLesson: '-', numOfDay: '-' });
      await subject.save();
      chats[`enteredName-${chatId}`] = text;
      chats[`isEnterName-${chatId}`] = false;
      chats[`isEnterLink-${chatId}`] = true;
      return bot.sendMessage(chatId, "Впиши посилання на предмет (або '-')");
    }
    if (chats[`isEnterLink-${chatId}`]) {
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { link: text });
      chats[`isEnterLink-${chatId}`] = false;
      chats[`isEnterHT-${chatId}`] = true;
      return bot.sendMessage(chatId, "Впиши д/з на предмета (або '-')");
    }
    if (chats[`isEnterHT-${chatId}`]) {
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { hometask: text });
      chats[`isEnterHT-${chatId}`] = false;
			chats[`isEnterNumOfDay-${chatId}`] = true;
      return bot.sendMessage(chatId, "Вибери день неділі", dayOptions);
    }

    // Get subjects
    if (text === "/get_subjects" || text === "предмети") {
      let result = `
			*Розраби:* [LinkStudy](https://t.me/+zo1juPQYJqZjNTYy)
			`;
      let monday = `
*Monday*`;
      let tuesday = `
*Tuesday*`;
      let wednesday = `
*Wednesday*`;
      let thursday = `
*Thursday*`;
      let friday = `
*Friday*`;

      const subjects = await Subject.find().sort("numOfLesson");
			const mondaySubjects = [];
			const tuesdaySubjects = [];
			const wednesdaySubjects = [];
			const thursdaySubjects = [];
			const fridaySubjects = [];

      for (let i = 0; i < subjects.length; i++) {
        if (subjects[i].numOfDay === "monday") {
					mondaySubjects.push(subjects[i]);
				}
				if (subjects[i].numOfDay === "tuesday") {
					tuesdaySubjects.push(subjects[i]);
				}
				if (subjects[i].numOfDay === "wednesday") {
					wednesdaySubjects.push(subjects[i]);
				}
				if (subjects[i].numOfDay === "thursday") {
					thursdaySubjects.push(subjects[i]);
				}
				if (subjects[i].numOfDay === "friday") {
					fridaySubjects.push(subjects[i]);
				}
      }

			monday += getDaySubjects(mondaySubjects);
			tuesday += getDaySubjects(tuesdaySubjects);
			wednesday += getDaySubjects(wednesdaySubjects);
			thursday += getDaySubjects(thursdaySubjects);
			friday += getDaySubjects(fridaySubjects);
			
      if (monday.length > 15) result += `${monday}`;
      if (tuesday.length > 15) {
        result += `
				${tuesday}`;
      }
      if (wednesday.length > 15) {
        result += `
				${wednesday}`;
      }
      if (thursday.length > 15) {
        result += `
				${thursday}`;
      }
      if (friday.length > 15) {
        result += `
				${friday}`;
      }

			if(result.length <= 62) {
				result += `
Немає жодного предмета!`;
			}

      return bot.sendMessage(chatId, result, hometaskOptions);
    }

    // Get one subject
    for (let i = 0; i < subjectsNames.length; i++) {
      if (!chats[`isEnterEditName-${chatId}`] && text === subjectsNames[i]) {
        let result = "";
        const subject = await Subject.findOne({ name: text });
        result += `
						Name: *${subject.name}*
						Link: __${subject.hometask ? subject.link : '-'}__
						H/t: _${subject.hometask ? subject.hometask : '-'}_
						Lesson: _${subject.numOfLesson} - ${lessonsNums[subject.numOfLesson]}_
						Day: _${subject.numOfDay} | ${weekNums[subject.numOfWeek]}_
					`;
        return bot.sendMessage(
          chatId,
          `${result}`,
          {
            parse_mode: "Markdown",
          },
          hometaskOptions
        );
      }
    }

    // Edit one subject
    if (text === "/edit_subject") {
			chats[`isEnterEditName-${chatId}`] = true;
      return bot.sendMessage(chatId, "Впиши назву предмета");
    }

    if (chats[`isEnterEditName-${chatId}`]) {
			if(subjectsNames.includes(text)) {
				chats[`enteredName-${chatId}`] = text;
				chats[`isEnterEditName-${chatId}`] = false;
				chats[`isEnterEditData-${chatId}`] = true;
				return bot.sendMessage(chatId, "Що хочеш змінити?", subjectChangeOptions);
			} else {
				chats[`enteredName-${chatId}`] = '';
				chats[`isEnterEditName-${chatId}`] = false;
				return bot.sendMessage(chatId, "Такого предмета немає(");
			}
    }

    if (chats[`isEditName-${chatId}`]) {
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { name: text });
			const nameOfSubject = subjectsNames.indexOf(chats[`enteredName-${chatId}`]);
      subjectsNames.splice(nameOfSubject, 1);
      subjectsNames.push(text);
			subjectsNamesOptions = subjectsNames.map((item) => {
				return [{ text: item, callback_data: item }];
			});
      chats[`enteredName-${chatId}`] = "";
      chats[`isEnterEditData-${chatId}`] = false;
      chats[`isEditName-${chatId}`] = false;
      return bot.sendMessage(chatId, "Назву змінено!");
    }
    if (chats[`isEditLink-${chatId}`]) {
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { link: text });
      chats[`enteredName-${chatId}`] = "";
      chats[`isEnterEditData-${chatId}`] = false;
      chats[`isEditLink-${chatId}`] = false;
      return bot.sendMessage(chatId, "Посилання змінено!");
    }
    if (chats[`isEditHT-${chatId}`]) {
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { hometask: text });
      chats[`enteredName-${chatId}`] = "";
      chats[`isEnterEditData-${chatId}`] = false;
      chats[`isEditHT-${chatId}`] = false;
      return bot.sendMessage(chatId, "Д/з змінено!");
    }

    // Delete one subject
    if (text === "/delete_subject") {
      chats[`isDeleteSubject-${chatId}`] = true;
			if(subjectsNamesOptions.length) {
				return bot.sendMessage(chatId, "Який предмет треба видалити?..", {
					reply_markup: JSON.stringify({
						inline_keyboard: subjectsNamesOptions,
					}),
				});
			}
      return bot.sendMessage(chatId, "Поки що немає жодного предмета...");
    }

		// Get weather of your location
		if(text === 'погода' || text === '/get_your_city_weather') {
			if(chats[`isWeatherLat-${chatId}`]) {
				return getWeather(chatId, chats[`isWeatherLat-${chatId}`], chats[`isWeatherLon-${chatId}`]);
			} else if(chats[`isYourCityForWeather-${chatId}`]) {
				return getWeatherByCity(chatId, chats[`isYourCityForWeather-${chatId}`]);
			}
			chats[`isEnterCity-${chatId}`] = true;
			return bot.sendMessage(chatId, `${name}, поділиcь локацією або впиши свій наслений пункт. Я запам'ятаю - і надалі питати не буду) Або відмовся, написавши 'відбій'`, getUserLocation);
		}
		if(text === 'відбій') {
			chats[`isEnterCity-${chatId}`] = false;
			return bot.sendMessage(chatId, 'Відмову прийнято, але хер ти тепер знатимеш погоду(', botOptions);
		}
		if(chats[`isEnterCity-${chatId}`]) {
			chats[`isYourCityForWeather-${chatId}`] = text;
		}
		if(chats[`isEnterCity-${chatId}`] && location) {
			chats[`isEnterCity-${chatId}`] = false;
			chats[`isWeatherLat-${chatId}`] = location.latitude;
			chats[`isWeatherLon-${chatId}`] = location.longitude;
			return getWeather(chatId, location.latitude, location.longitude);
		} else if(chats[`isEnterCity-${chatId}`] && chats[`isYourCityForWeather-${chatId}`]) {
			chats[`isEnterCity-${chatId}`] = false;
			return getWeatherByCity(chatId, chats[`isYourCityForWeather-${chatId}`]);
		}

		// Get weather of any city location
		if(text === '/get_city_weather') {
			chats[`isEnterCity-${chatId}`] = true;
			return bot.sendMessage(chatId, 'Введи пункт, де необхідно дізнатись погоду...', botOptions);
		}
		if(chats[`isEnterCity-${chatId}`]) {
			chats[`isCityForWeather-${chatId}`] = text;
		}
		if(chats[`isEnterCity-${chatId}`] && chats[`isCityForWeather-${chatId}`]) {
			chats[`isEnterCity-${chatId}`] = false;
			return getWeatherByCity(chatId, chats[`isCityForWeather-${chatId}`]);
		}


		//Replies to various messages
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

    textIncludes(
      text,
      chatId,
      ["привет", "хальоу", "алоха"],
      answers(answer_2)
    );
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
      const candidate = await User.findOne({ id: msg.from.id });
      if (!candidate) {
        const user = new User({
          id: msg.from.id,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          username: msg.from.username,
        });
        await user.save();
      }
      return bot.sendMessage(chatId, `${name}, здарова`, botOptions);
    }
    if (text === "/help") {
      return bot.sendMessage(chatId, `${name}, сорі, але тут 0 інфи`);
    }
    if (text === "/game" || text === "орел&решка") {
      return startGame(chatId, name);
    }
    if (text === "/jokes") {
      return bot.sendMessage(chatId, "Захотелось поугарать?...", jokesOptions);
    }

    !chats[`isKeyWord-${chatId}`] && bot.sendMessage(chatId, "Я хз, шо ти хочеш(");
  });







  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const name = msg.from.first_name;

    if (data === "/again_game") {
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

    //Eagle or tail
    if (chats[`isGame-${chatId}`] && +data === chats[`gameNum-${chatId}`]) {
      chats[`isGame-${chatId}`] = false;
      return bot.sendMessage(
        chatId,
        `Поздравляю, ти угадав ${
          chats[`gameNum-${chatId}`] === 1 ? "орла" : "решку"
        }, йди набухайся!`,
        againGameOptions
      );
    } else if (chats[`isGame-${chatId}`] && +data !== chats[`gameNum-${chatId}`]) {
      chats[`isGame-${chatId}`] = false;
      return bot.sendMessage(
        chatId,
        `Сорі, ти проэбався( Я загадав ${
          chats[`gameNum-${chatId}`] === 1 ? "орла" : "решку"
        }`,
        againGameOptions
      );
    }

    // Add lesson and day settings
    if (chats[`isEnterNumOfDay-${chatId}`]) {
			chats[`numOfDay-${chatId}`] = data;
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { numOfDay: data });
			chats[`isEnterNumOfDay-${chatId}`] = false;
      chats[`isEnterNumOfWeek-${chatId}`] = true;
      return bot.sendMessage(chatId, "Вибери тиждень", weekOptions);
    }
		if (chats[`isEnterNumOfWeek-${chatId}`]) {
			chats[`numOfWeek-${chatId}`] = data;
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { numOfWeek: data });
			chats[`isEnterNumOfWeek-${chatId}`] = false;
      chats[`isEnterNumOfLesson-${chatId}`] = true;
      return bot.sendMessage(chatId, "Вибери номер пари", lessonOptions);
    }
    if (chats[`isEnterNumOfLesson-${chatId}`]) {
			const subjects = await Subject.find({numOfDay: chats[`numOfDay-${chatId}`], numOfWeek: chats[`numOfWeek-${chatId}`]});
			for(let i = 0; i < subjects.length; i++) {
				if(data === subjects[i].numOfLesson) {
					return bot.sendMessage(chatId, `В цей день ${data} пара вже зайнята. Вибери інший номер...`, lessonOptions);
				}
			}
			chats[`numOfDay-${chatId}`] = "";
			chats[`numOfWeek-${chatId}`] = "";
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { numOfLesson: data });
      subjectsNames.push(chats[`enteredName-${chatId}`]);
			subjectsNamesOptions = subjectsNames.map((item) => {
				return [{ text: item, callback_data: item }];
			});
      chats[`enteredName-${chatId}`] = "";
      chats[`isEnterNumOfLesson-${chatId}`] = false;
      return bot.sendMessage(chatId, "Предмет додано!");
    }

    // Edit lesson and day settings
    if (chats[`isEditNumOfDay-${chatId}`]) {
			const subject = await Subject.findOne({name: chats[`enteredName-${chatId}`]});
			const subjects = await Subject.find({numOfDay: data, numOfWeek: subject.numOfWeek});
			for(let i = 0; i < subjects.length; i++) {
				if(subject.numOfLesson === subjects[i].numOfLesson) {
					return bot.sendMessage(chatId, `В цей день ${lessonsNums[subjects[i].numOfLesson]} пара вже зайнята. Вибери інший день...`, dayOptions);
				}
			}
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { numOfDay: data });
      chats[`enteredName-${chatId}`] = "";
      chats[`isEnterEditData-${chatId}`] = false;
      chats[`isEditNumOfDay-${chatId}`] = false;
      return bot.sendMessage(chatId, "День пари змінено!");
    }
		if (chats[`isEditNumOfWeek-${chatId}`]) {
			const subject = await Subject.findOne({name: chats[`enteredName-${chatId}`]});
			const subjects = await Subject.find({numOfWeek: data, numOfDay: subject.numOfDay});
			for(let i = 0; i < subjects.length; i++) {
				if(subject.numOfLesson === subjects[i].numOfLesson) {
					return bot.sendMessage(chatId, `В цей день ${lessonsNums[subjects[i].numOfLesson]} пара вже зайнята. Вибери інше...`, weekOptions);
				}
			}
      await Subject.findOneAndUpdate({ name: chats[`enteredName-${chatId}`] }, { numOfWeek: data });
      chats[`enteredName-${chatId}`] = "";
      chats[`isEnterEditData-${chatId}`] = false;
      chats[`isEditNumOfWeek-${chatId}`] = false;
      return bot.sendMessage(chatId, "Парність/непарність пари змінено!");
    }
		if (chats[`isEditNumOfLesson-${chatId}`]) {
			const subject = await Subject.findOne({name: chats[`enteredName-${chatId}`]});
			const subjects = await Subject.find({numOfDay: subject.numOfDay, numOfWeek: subject.numOfWeek});
			for(let i = 0; i < subjects.length; i++) {
				if(data === subjects[i].numOfLesson) {
					return bot.sendMessage(chatId, `В цей день ${data} пара вже зайнята. Вибери інший номер...`, lessonOptions);
				}
			}
      await Subject.findOneAndUpdate(
        { name: chats[`enteredName-${chatId}`] },
        { numOfLesson: data }
      );
      chats[`enteredName-${chatId}`] = "";
      chats[`isEnterEditData-${chatId}`] = false;
      chats[`isEditNumOfLesson-${chatId}`] = false;
      return bot.sendMessage(chatId, "Номер пари змінено!");
    }

    // Change subject settings
    if (chats[`isEnterEditData-${chatId}`] && data === "name") {
			chats[`isEditName-${chatId}`] = true;
      return bot.sendMessage(chatId, "Введи текст для изменения...");
    }
    if (chats[`isEnterEditData-${chatId}`] && data === "link") {
      chats[`isEditLink-${chatId}`] = true;
      return bot.sendMessage(chatId, "Введи текст для изменения...");
    }
    if (chats[`isEnterEditData-${chatId}`] && data === "h/t") {
      chats[`isEditHT-${chatId}`] = true;
      return bot.sendMessage(chatId, "Введи текст для изменения...");
    }
    if (chats[`isEnterEditData-${chatId}`] && data === "day") {
			chats[`isEditNumOfDay-${chatId}`] = true;
      return bot.sendMessage(
        chatId,
        "Вибери день для изменения...",
        dayOptions
      );
    }
		if (chats[`isEnterEditData-${chatId}`] && data === "week") {
			chats[`isEditNumOfWeek-${chatId}`] = true;
      return bot.sendMessage(
        chatId,
        "Вибери парний чи непарний тиждень для изменения...",
        weekOptions
      );
    }
		if (chats[`isEnterEditData-${chatId}`] && data === "lesson") {
			chats[`isEditNumOfLesson-${chatId}`] = true;
      return bot.sendMessage(
        chatId,
        "Вибери номер пары для изменения...",
        lessonOptions
      );
    }

    if (data === "h/t") {
			// chats[`isHomeTask-${chatId}`] = true;
			if(subjectsNamesOptions.length) {
				return bot.sendMessage(chatId, "Д/з якого предмета треба?..", {
					reply_markup: JSON.stringify({
						inline_keyboard: subjectsNamesOptions,
					}),
				});
			}
      return bot.sendMessage(chatId, "Поки що немає жодного предмета...");
    }

    // Delete one subject and Get h/t of one subject
    for (let i = 0; i < subjectsNames.length; i++) {
      if (chats[`isDeleteSubject-${chatId}`] && data === subjectsNames[i]) {
        const subject = await Subject.findOne({ name: data });
        subject.remove();
				const nameOfSubject = subjectsNames.indexOf(data);
      	subjectsNames.splice(nameOfSubject, 1);
				subjectsNamesOptions = subjectsNames.map((item) => {
					return [{ text: item, callback_data: item }];
				});
        chats[`isDeleteSubject-${chatId}`] = false;
        return bot.sendMessage(chatId, `Предмет ${data} видалено!`);
      }
      if (data === subjectsNames[i]) {
        //chats[`isHomeTask-${chatId}`] = false;
        let result = "";
        const subject = await Subject.findOne({ name: data });
        result += `
						Hometask of ${data}: *${subject.hometask}*
					`;
        return bot.sendMessage(chatId, `Тримай: ${result}`, {
          parse_mode: "Markdown",
        });
      }
    }
  });
};

start();
