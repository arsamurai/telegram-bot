exports.getWeatherByLocation = async function(bot, chats, chatId, lat, lon) {
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