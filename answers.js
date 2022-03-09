module.exports = {
  answer_1: ['Ага, сам чуть не впісявся', 'Хе-хе', 'Лол'],
  answer_2: ['привет', 'хальоу', 'здоров'],
  answer_3: ['Та йди нахер)', 'Обращайся', '))'],
  answer_4: ['Заебок', 'Шо за шняга?', 'Ахах, прикол'],
  answer_5: [`Bruh`, `LOOOOL`, `Axaxa`],
  answer_6: [`Держи в курсі`, `Ладно...`, `Допустім`],
  answer_7: [],
  answer_8: [],
  answer_9: [],
  answer_10: [],
  answer_11: [],
  answer_12: [],
  answer_13: [],
  answer_14: [],
  answer_15: [],
  answer_16: [],
  answer_17: [],
  answer_18: [],
  answer_19: [],

  answers: (answers) => {
    const numOfAnswer = Math.floor(Math.random() * answers.length);
    return answers[numOfAnswer];
  },
};
