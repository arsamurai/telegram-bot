exports.startGame = async function(bot, chats, options, chatId, name) {
	chats[`isGame-${chatId}`] = true;
  await bot.sendMessage(chatId, `${name}, я загадал решку чи орла`);
  const rememberNum = Math.floor(1 + Math.random() * 2);
  chats[`gameNum-${chatId}`] = rememberNum;
  await bot.sendMessage(chatId, "Твоя задача угадать...", options);
};