exports.setBotCommands = function() {
	return [
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
  ]
}