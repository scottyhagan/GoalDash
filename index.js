let width = window.innerWidth;
let height = window.innerHeight;
let url = `https://source.unsplash.com/featured/${width}x${height}/?nature`;
let content = document.getElementById('content-wrapper');
document.body.style.background = `url(${url})`;
document.body.style.backgroundPositionY = '100px';
document.body.style.backgroundRepeat = 'no-repeat';  

function setGoals(period, goals) { 
  console.log(goals);
  
  if(!goals[period]) {
    return false;
  } else {
    const ol = document.getElementById(`${period}GoalList`);
    while(ol.firstChild) {
      ol.removeChild(ol.firstChild);
    }
    goals[period].forEach((goal,i) => {
      const li = document.createElement("li");
      const div = document.createElement('div');
      const input = document.createElement('span');
      const xButton = document.createElement('button');
      const checkbox = document.createElement('span');
      checkbox.addEventListener('click', () => {
        getGoals(period).then(goals => goals);
        goals[period][i].isDone ? goals[period][i].isDone = false : goals[period][i].isDone = true;
        chrome.storage.sync.set(goals, () => {
          console.log('goal updated');
        });
        goals[period][i].isDone ? toggleClass(checkbox, 'unchecked', 'checked') : toggleClass(checkbox, 'checked', 'unchecked');
      });

      goal.isDone ? toggleClass(checkbox, 'unchecked', 'checked') : toggleClass(checkbox, 'checked', 'unchecked');
      // input.setAttribute('disabled', 'disabled');
      // input.setAttribute('rows', '1');
      input.innerHTML = goal.value;
      // input.style.height = 'auto';
      xButton.setAttribute('data-period', period);
      xButton.setAttribute('data-goal', goal.value);
      input.classList.add('goal-input');
      li.classList.add('goal-item');
      div.classList.add('goal-div');
      checkbox.classList.add('checkbox');
      xButton.classList.add('x-btn');
      xButton.innerHTML = '&#10005';
      li.append(div);
      div.append(input);
      div.prepend(checkbox);
      div.append(xButton);
      ol.prepend(li);
      input.addEventListener('dblclick', () => {
        input.removeAttribute('disabled');
      });
    });
    let x = document.getElementsByClassName('x-btn');
    for(let i= 0; i < x.length; i++) {
      x[i].addEventListener('click', () => {
        let period = window.event.target.getAttribute('data-period');
        let goal = window.event.target.getAttribute('data-goal');
        // console.log(period);
        // console.log(goal);
        removeGoal(period, goal)
      });
    }
  }
}

function toggleClass(elm, classRemove, classAdd){
  elm.classList.remove(classRemove);
  elm.classList.add(classAdd);
}

function getGoals(period) {
  return new Promise(resolve => {
    chrome.storage.sync.get(period, (goals) => {
      if(!goals[period]) {
        resolve(goals = {});
      } else {
        resolve(goals);
      }
    });
  });
}

async function saveGoal(period, value) {
  let goals = await getGoals(period);
  if(!goals[period]) {
    goals[period] = [];
    goals[period].push(value);
  } else {
    goals[period].push(value);
  }
  chrome.storage.sync.set(goals, () => {
    console.log('goal saved');
  });
  console.log('set goal', goals);
  
  setGoals(period, goals);
}

async function removeGoal(period, value) {
  let goals = await getGoals(period);
  let index = goals[period].findIndex(g => g.value === value);
  // console.log(index);
  if(index > -1) {
    goals[period].splice(index, 1);
  }
  // console.log(goals);
  chrome.storage.sync.set(goals, () => {
    console.log('goal removed');
  });
  setGoals(period, goals);
}

function getStarted() {
  // return new Promise(resolve => {
    let gSection = document.getElementsByClassName('goal-section');
    for(let i = 0; i < gSection.length; i++) {
      gSection[i].classList.add('hidden');
    }
    const yearStart = document.getElementById('startYear');
    const weekStart = document.getElementById('startWeek');
    const dayStart = document.getElementById('startDay');
    yearStart.classList.remove('hidden');
    const yearStartInput = document.getElementById('yearStartInput');
    const weekStartInput = document.getElementById('weekStartInput');
    const dayStartInput = document.getElementById('dayStartInput');
    yearStartInput.addEventListener('change', () => {
      saveGoal('yearly' , {isDone: false, date: Date.now(), value: yearStartInput.value}); 
      yearStart.classList.add('hidden');
      weekStart.classList.remove('hidden');
      setTimeout(() => {
        // document.getElementsByClassName('goal-input')[0].value = yearStartInput.value;
        getStartedSetGoals('yearly');
      },100);
    });
    weekStartInput.addEventListener('change', () => {
      saveGoal('weekly' , {isDone: false, date: Date.now(), value: weekStartInput.value});
      weekStart.classList.add('hidden');
      dayStart.classList.remove('hidden');
      setTimeout(() => {
        getStartedSetGoals('weekly');
      },100);
    });
    dayStartInput.addEventListener('change', () => {
      saveGoal('daily' , {isDone: false, date: Date.now(), value: dayStartInput.value});
      dayStart.classList.add('hidden');
      for(let i = 0; i < gSection.length; i++) {
        gSection[i].classList.remove('hidden');
      }
    }); 
   
  //   resolve();
  // });
}

async function getStartedSetGoals(period) {
  let p = await getGoals(period);
  console.log('getstarted ', p);
  setGoals(period, p);
}

async function initGoals() {
  let daily = await getGoals('daily');
  let weekly = await getGoals('weekly');
  let yearly = await getGoals('yearly');
  if(daily.daily.length === 0 && weekly.weekly.length === 0 && yearly.yearly.length === 0) {
    getStarted();  
  } else {
    let date = new Date();
    let d = new Date(daily.daily[0] ? daily.daily[0].date: Date.now());
    if(date.toLocaleDateString === d.toLocaleDateString) {
      setGoals('daily', daily);
      console.log("same day");
    } else {
      chrome.storage.sync.set({'daily': []}, () => {
        console.log('new day, goals reset');
      });
      setGoals('daily', daily);
    }
    setGoals('weekly', weekly);
    setGoals('yearly', yearly);
  }
}

function setQuote(quote) {
  const quotebox = document.getElementById('quotebox');
  const quoteContent = document.createElement('h3');
  const quoteAuthor = document.createElement('h4');
  quotebox.append(quoteContent);
  quotebox.append(quoteAuthor);
  quoteContent.innerHTML = `\"${quote.quote}\"`;
  quoteContent.style.fontStyle = 'italic';
  quoteAuthor.innerHTML = `--${quote.author}`;
}

function getQuote() {
  chrome.storage.sync.get('quote', (quoteObj) => {
    let quoteDate = new Date(quoteObj.quote.date);
    let timeSinceQuote = Date.now() - quoteDate;
    
    if(timeSinceQuote > 86400000) {
      return fetch('https://quotes.rest/qod?category=inspire', {
        headers: {
          "Accept": "application/json"
        },
        method: 'GET'
      }).then(response => response.json())
      .then(quote => {
        let q = quote.contents.quotes[0];
        chrome.storage.sync.set({"quote": q}, () => {
          console.log('quote set');
        });
        setQuote(q.quote);
      });
    } else {
      setQuote(quoteObj.quote);
    }

  });
}
 
const dailyGoalInput = document.getElementById('dailyGoal');
dailyGoalInput.addEventListener('change', () => { 
  saveGoal('daily' , {isDone: false, date: Date.now(), value: dailyGoalInput.value});
  dailyGoalInput.value = '';
});

const weeklyGoalInput = document.getElementById('weeklyGoal');
weeklyGoalInput.addEventListener('change', () => { 
  saveGoal('weekly' , {isDone: false, date: Date.now(), value: weeklyGoalInput.value}); 
  weeklyGoalInput.value = '';
});

const yearlyGoalInput = document.getElementById('yearlyGoal');
yearlyGoalInput.addEventListener('change', () => { 
  saveGoal('yearly' , {isDone: false, date: Date.now(), value: yearlyGoalInput.value}); 
  yearlyGoalInput.value = '';
});

function startTime() {
  let today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  m = checkTime(m);
  document.getElementById('timestamp').innerHTML =
  h + ":" + m;
  let t = setTimeout(startTime, 500);
}
function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

document.addEventListener('DOMContentLoaded', () => {
  initGoals();
  getQuote();
  startTime();
});
