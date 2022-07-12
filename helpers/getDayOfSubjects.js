exports.getDayOfSubjects = function(weekNums, lessonsNums, subjects) {
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