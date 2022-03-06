module.exports = {
	gameOptions: { 
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Орел", callback_data: "1"}, {text: "Решка", callback_data: "2"}]
			]
		})
	},
	againOptions: {
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "Играть ше раз ", callback_data: "/again"}],
			]
		})
	},
	unluckyDaysOptions: { 
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: "2022", callback_data: "2022"}, {text: "2021", callback_data: "2021"}],
				[{text: "2020", callback_data: "2020"}, {text: "2019", callback_data: "2019"}],
				[{text: "2018", callback_data: "2018"}, {text: "2017", callback_data: "2017"}],
				[{text: "2016", callback_data: "2016"}, {text: "2015", callback_data: "2015"}],
				[{text: "2014", callback_data: "2014"}, {text: "2013", callback_data: "2013"}],
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
}