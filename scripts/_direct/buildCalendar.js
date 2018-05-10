let container = document.querySelector('.calendar-container');

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getMonthInfo(monthNumber, year) {
  let startDay = new Date(year, monthNumber, 1).getDay();
  let nDays = new Date(year, monthNumber+1, 0).getDate();
  let nWeeks = Math.ceil((nDays+startDay)/7.)

  return {
    startDay,
    nDays,
    nWeeks,
  }
}

function buildHeader(monthNumber, year) {

  let headerElement = document.createElement('div');
  headerElement.classList.add('monthHeader');

  let monthLabel = document.createElement('h1');
  monthLabel.classList.add('monthLabel');
  monthLabel.innerHTML = `${monthNames[monthNumber]} ${year}`

  let prevMonthBtn = document.createElement('button');
  prevMonthBtn.classList.add('prev-month');
  prevMonthBtn.innerHTML = '<<'
  prevMonthBtn.onclick = prevMonth;

  let nextMonthBtn = document.createElement('button');
  nextMonthBtn.classList.add('next-month');
  nextMonthBtn.innerHTML = '>>'
  nextMonthBtn.onclick = nextMonth;

  // headerElement.appendChild(prevMonthBtn);
  // headerElement.appendChild(nextMonthBtn);
  headerElement.appendChild(monthLabel);

  let weekDayLabels = document.createElement('div');
  weekDayLabels.classList.add('dayLabels', 'clearfix');
  headerElement.appendChild(weekDayLabels);

  dayNames.forEach(function(dayName, ix) {
    let headerDayElement = document.createElement('div');
    headerDayElement.classList.add('dayLabel');
    headerDayElement.innerHTML = dayName;
    weekDayLabels.appendChild(headerDayElement);
  })


  return headerElement;
}


function buildDay(dayNumber, dateInfo) {
  let dayElement = document.createElement('div');
  dayElement.classList.add('daybox', `day${dayNumber}`, `date-${dateInfo[2]}`);
  if (dateInfo[1]) {
    dayElement.classList.add('current');
  }

  let today = new Date();
  if (dateInfo[2] === getDateStr(today.getFullYear(), today.getMonth(), today.getDate()-1)) {
    dayElement.classList.add('today');
  }

  let numberElement = document.createElement('span');
  numberElement.classList.add('dayDate');
  numberElement.innerHTML = dateInfo[0];

  dayElement.appendChild(numberElement);

  return dayElement
}


function buildWeek(dateArray) {
  let weekElement = document.createElement('div');
  weekElement.classList.add('weekbox', 'clearfix');

  for (var ix = 0; ix < 7; ix++) {
    let dayElement = buildDay(ix, dateArray[ix]);
    weekElement.appendChild(dayElement);
  };

  return weekElement;
}

function zeroPadStr(number) {
  return number < 10 ? `0${number}` : `${number}`
}

function getDateStr(year, monthNumber, dayNumber) {
  let m = moduloDate(year, monthNumber, 0);
  return `${m.year}${zeroPadStr(m.monthNumber+1)}${zeroPadStr(m.dayNumber+1)}`
}


function buildMonth(monthNumber, year) {
  let monthInfo = getMonthInfo(monthNumber, year);
  let priorMonthInfo = getMonthInfo(monthNumber-1, year);
  let nDaysPre = getMonthInfo(monthNumber-1, year).nDays;

  let dateArray = Array(monthInfo.nWeeks*7).fill().map(function(_, ix) {
    let dateDay, dateStr, currentMonth;
    if (ix < monthInfo.startDay) {
      dateDay = nDaysPre - (monthInfo.startDay - ix);
      dateStr = getDateStr(year, monthNumber-1, dateDay);
      currentMonth = false;
    } else if (ix < monthInfo.startDay + monthInfo.nDays) {
      dateDay = ix - monthInfo.startDay;
      dateStr = getDateStr(year, monthNumber, dateDay);
      currentMonth = true;
    } else {
      dateDay = ix - monthInfo.startDay - monthInfo.nDays;
      dateStr = getDateStr(year, monthNumber+1, dateDay);
      currentMonth = false;
    }
    return [dateDay+1, currentMonth, dateStr];
  })

  let monthElement = document.createElement('div');
  monthElement.classList.add('monthbox');


  for (var ix = 0; ix < monthInfo.nWeeks; ix++) {
    let weekElement = buildWeek(dateArray.slice(ix*7,(ix+1)*7));
    monthElement.appendChild(weekElement);
  }

  return monthElement
}

function moduloDate(year, monthNumber, dayNumber) {
  if (monthNumber > 11) {
    monthNumber = monthNumber % 12;
    year += 1
  } else if (monthNumber < 0) {
    monthNumber += 12;
    year -= 1;
  }

  monthInfo = getMonthInfo(monthNumber, year);
  if (dayNumber > monthInfo.nDays - 1) {
    dayNumber = dayNumber % monthInfo.nDays;
    monthNumber += 1;
  } else if (dayNumber < 0) {
    monthNumber -= 1;
    preMonthInfo = getMonthInfo(monthNumber, year);
    dayNumber += preMonthInfo.nDays;
  }

  return {
    year,
    monthNumber,
    dayNumber,
  }
}

function buildCalendar(monthNumber, year) {
  let modulated = moduloDate(year, monthNumber, 0);
  year = modulated.year;
  monthNumber = modulated.monthNumber;

  let calendarElement = document.createElement('div');
  calendarElement.classList.add('calendarBox');

  let monthHeaderElement = buildHeader(monthNumber, year);
  let monthElement = buildMonth(monthNumber, year);

  calendarElement.appendChild(monthHeaderElement);
  calendarElement.appendChild(monthElement);

  container.innerHTML = '';
  container.appendChild(calendarElement);
}

buildCalendar(4, 2018);

let state = {
  monthNumber: 4,
  year: 2018,
  dayNumber: 8,
}

function updateState(stateObject) {
  temp = JSON.parse(JSON.stringify(state));
  Object.assign(temp, stateObject);
  m = moduloDate(temp.year, temp.monthNumber, temp.dayNumber);
  Object.assign(state, m);
}

function nextMonth() {
  updateState({monthNumber: state.monthNumber + 1});
  build();
}

function prevMonth() {
  updateState({monthNumber: state.monthNumber - 1});
  build();
}

function build() {
  buildCalendar(state.monthNumber, state.year);
}

let nextButton = document.querySelector('.next-month').onclick = nextMonth;
let prevButton = document.querySelector('.prev-month').onclick = prevMonth;