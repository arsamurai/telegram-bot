const { textIncludes } = require("./textIncludes");
const { startGame } = require("./startGame");
const { getWeatherByLocation } = require("./getWeatherByLocation");
const { getWeatherByCity } = require("./getWeatherByCity");
const { getJoke } = require("./getJoke");
const { getDayOfSubjects } = require("./getDayOfSubjects");

module.exports = {
	textIncludes,
	startGame,
	getWeatherByLocation,
	getWeatherByCity,
	getJoke,
	getDayOfSubjects
}