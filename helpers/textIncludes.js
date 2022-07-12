exports.textIncludes = function(bot, chats, text, chatId, words, message) {
  for (let i = 0; i < words.length; i++) {
    if (text.includes(words[i])) {
      chats[`isKeyWord-${chatId}`] = true;
      return bot.sendMessage(chatId, `${message}`);
    }
  }
};