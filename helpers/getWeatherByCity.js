exports.getWeatherByCity = async function(bot, chats, chatId, city) {
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