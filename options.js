module.exports = {
	gameOptions: { 
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Орел", callback_data: "1"}, {text: "Решка", callback_data: "2"}]
			]
		})
	},
	againGameOptions: {
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Играть ше раз", callback_data: "/again_game"}],
			]
		})
	},
	againPasswordOptions: {
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Спробувати ще раз", callback_data: "/again_password"}],
			]
		})
	},
	jokesOptions: { 
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Чёрный юмор", callback_data: "black-humor"}],
				[{text: "Тупой юмор", callback_data: "stupid-humor"}],
				[{text: "Тупой юмор +", callback_data: "stupid-humor-plus"}],
			]
		})
	},
	subjectChangeOptions: { 
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Назва", callback_data: "name"}],
				[{text: "Посилання", callback_data: "link"}],
				[{text: "Д/з", callback_data: "h/t"}],
				[{text: "День", callback_data: "day"}],
				[{text: "Тиждень", callback_data: "week"}],
				[{text: "Пара", callback_data: "lesson"}],
			]
		})
	},
	hometaskOptions: {
		parse_mode: "Markdown",
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Д/з", callback_data: "h/t"}],
			]
		})
	},
	dayOptions: { 
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Понеділок", callback_data: "monday"}],
				[{text: "Вівторок", callback_data: "tuesday"}],
				[{text: "Середа", callback_data: "wednesday"}],
				[{text: "Четверг", callback_data: "thursday"}],
				[{text: "П'ятниця", callback_data: "friday"}],
			]
		})
	},
	weekOptions: { 
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Непарний", callback_data: "odd"}],
				[{text: "Парний", callback_data: "even"}],
			]
		})
	},
	lessonOptions: { 
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "1", callback_data: "1"}],
				[{text: "2", callback_data: "2"}],
				[{text: "3", callback_data: "3"}],
				[{text: "4", callback_data: "4"}],
				[{text: "5", callback_data: "5"}],
			]
		})
	},
	botOptions: { 
		reply_markup: JSON.stringify({
			keyboard: [
				[{text: "Предмети"}],
				[{text: "Шутку"}],
				[{text: "Орел&Решка"}],
			]
		})
	},
}