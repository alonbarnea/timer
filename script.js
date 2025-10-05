const workoutRounds = 3;
const workoutInterval = 30;
const switchInterval = 5;

const warningSeconds = 4;

const planksRounds = workoutRounds;
const planksSetOrder = ['Work', 'Rest'];

const sidePlanksRounds = workoutRounds;
const sidePlanksSetOrder = ['Work R', 'Switch', 'Work L', 'Rest'];

const restFrequency = 1000;
const workFrequency = 2000;
const switchFrequency = 4000;
const tickDuration = 0.1;
const lastTickDuration = 0.5;

let repsTimerInterval = null;
let repsSeconds = workoutInterval;
let repsRound = 1;

let planksTimerInterval = null;
let planksSeconds = workoutInterval;
let planksRoundsLeft = planksRounds;
let planksIndex = 0;

let sidePlanksTimerInterval = null;
let sidePlanksSeconds = workoutInterval;
let sidePlanksRoundsLeft = sidePlanksRounds;
let sidePlanksIndex = 0;

function updateRepsDisplay() {
    const mins = Math.floor(repsSeconds / 60).toString().padStart(2, '0');
    const secs = (repsSeconds % 60).toString().padStart(2, '0');
    document.getElementById('reps-timer').textContent = `${mins}:${secs}`;
}

function updatePlanksDisplay() {
    const mins = Math.floor(planksSeconds / 60).toString().padStart(2, '0');
    const secs = (planksSeconds % 60).toString().padStart(2, '0');
    document.getElementById('planks-timer').textContent = `${mins}:${secs}`;
}

function updateSidePlanksDisplay() {
    const mins = Math.floor(sidePlanksSeconds / 60).toString().padStart(2, '0');
    const secs = (sidePlanksSeconds % 60).toString().padStart(2, '0');
    document.getElementById('side-planks-timer').textContent = `${mins}:${secs}`;
}

function playRestTick() {
    playBeep(restFrequency, tickDuration, 0.1);
}

function playWorkTick() {
    playBeep(workFrequency, tickDuration, 0.1);
}

function playSwitchTick() {
    playBeep(switchFrequency, tickDuration, 0.1);
}

function playLastRestTick() {
    playBeep(restFrequency, lastTickDuration, 0.4);
}

function playLastWorkTick() {
    playBeep(workFrequency, lastTickDuration, 0.4);
}

function playLastSwitchTick() {
    playBeep(switchFrequency, lastTickDuration, 0.4);
}

function playBeep(frequency, duration, volume) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine'; // sawtooth, square, triangle, sine
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.value = volume;

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
}

function toggleRepsTimer() {
    const header = document.getElementById('repsHeader');
    if (!repsTimerInterval) {
        header.textContent = 'Set ' + repsRound + ': Rest';
        repsTimerInterval = setInterval(() => {
            repsSeconds--;
            updateRepsDisplay();
            if (repsSeconds <= warningSeconds && repsSeconds > 0) {
                playRestTick();
            }
            if (repsSeconds === 0) {
                playLastRestTick();
                clearInterval(repsTimerInterval);
                repsTimerInterval = null;
                repsSeconds = workoutInterval;
                repsRound = repsRound % 3 + 1;
                if (repsRound > 1) {
                    header.textContent = 'Set ' + repsRound + ': Work';
                } else {
                    header.textContent = 'No Set';
                }

                updateRepsDisplay();
            }
        }, 1000);
    } else {
        clearInterval(repsTimerInterval);
        repsTimerInterval = null;
        header.textContent = 'PAUSED!';
    }
}

function togglePlanksTimer() {
    const header = document.getElementById('planksHeader');
    if (!planksTimerInterval) {
        header.textContent = 'Set ' + (planksRounds - planksRoundsLeft + 1) + ": " + planksSetOrder[planksIndex];
        planksTimerInterval = setInterval(() => {
            planksSeconds--;
            updatePlanksDisplay();
            if (planksSeconds <= warningSeconds && planksSeconds > 0) {
                if (planksIndex === 0) { // ['Work', 'Rest']
                    playWorkTick();
                } else {
                    playRestTick();
                }
            }
            if (planksSeconds === 0) {
                if (planksIndex === 0) { // ['Work', 'Rest']
                    playLastWorkTick();
                } else {
                    playLastRestTick();
                }
                clearInterval(planksTimerInterval);
                planksTimerInterval = null;

                planksIndex = 1 - planksIndex;
                if (planksIndex === 0) {
                    planksRoundsLeft--;
                }
                if (planksRoundsLeft > 0) {
                    planksSeconds = workoutInterval;
                    togglePlanksTimer();
                } else {
                    planksRoundsLeft = planksRounds;
                    planksSeconds = workoutInterval;
                    header.textContent = 'No Set';
                    updatePlanksDisplay();
                }
            }
        }, 1000);
    } else {
        clearInterval(planksTimerInterval);
        planksTimerInterval = null;
        header.textContent = 'PAUSED!';
     }
}

function toggleSidePlanksTimer() {
    const header = document.getElementById('sidePlanksHeader');
    if (!sidePlanksTimerInterval) {
        header.textContent = 'Set ' + (sidePlanksRounds - sidePlanksRoundsLeft + 1) + ": " + sidePlanksSetOrder[sidePlanksIndex];
        sidePlanksTimerInterval = setInterval(() => {
            sidePlanksSeconds--;
            updateSidePlanksDisplay();
            if (sidePlanksSeconds <= warningSeconds && sidePlanksSeconds > 0) {
                if (sidePlanksIndex === 0 || sidePlanksIndex === 2) { // ['Work R', 'Switch', 'Work L', 'Rest'];
                    playWorkTick();
                } else if (sidePlanksIndex === 1) {
                    playSwitchTick();
                } else if (sidePlanksIndex === 3) {
                    playRestTick();
                }
            }
            if (sidePlanksSeconds === 0) {
                if (sidePlanksIndex === 0 || sidePlanksIndex === 2) { // ['Work R', 'Switch', 'Work L', 'Rest'];
                    playLastWorkTick();
                } else if (sidePlanksIndex === 1) {
                    playLastSwitchTick();
                } else if (sidePlanksIndex === 3) {
                    playLastRestTick();
                }

                clearInterval(sidePlanksTimerInterval);
                sidePlanksTimerInterval = null;

                sidePlanksIndex = (sidePlanksIndex + 1) % 4;
                if (sidePlanksIndex === 0) {
                    sidePlanksRoundsLeft--;
                }

                if (sidePlanksRoundsLeft > 0) {
                    sidePlanksSeconds = (sidePlanksIndex === 1) ? switchInterval : workoutInterval;
                    toggleSidePlanksTimer();
                } else {
                    sidePlanksRoundsLeft = sidePlanksRounds;
                    sidePlanksSeconds = workoutInterval;
                    header.textContent = 'No Set';
                    updateSidePlanksDisplay();
                }
            }
        }, 1000);
    } else {
        clearInterval(sidePlanksTimerInterval);
        sidePlanksTimerInterval = null;
        header.textContent = 'PAUSED!';
      }
}

 function resetRepsTimer() {
      clearInterval(repsTimerInterval);
      repsTimerInterval = null;
      repsSeconds = workoutInterval;
      repsRound = 1;
      document.getElementById('repsHeader').textContent = 'No Set';
      updateRepsDisplay();
  }

 function resetPlanksTimer() {
      clearInterval(planksTimerInterval);
      planksTimerInterval = null;
      planksSeconds = workoutInterval;
      planksRoundsLeft = planksRounds;
      planksIndex = 0
      document.getElementById('planksHeader').textContent = 'No Set';
      updatePlanksDisplay();
  }

 function resetSidePlanksTimer() {
      clearInterval(sidePlanksTimerInterval);
      sidePlanksTimerInterval = null;
      sidePlanksSeconds = workoutInterval;
      sidePlanksRoundsLeft = sidePlanksRounds;
      sidePlanksIndex = 0;
      document.getElementById('sidePlanksHeader').textContent = 'No Set';
      updateSidePlanksDisplay();
  }

updateRepsDisplay();
updatePlanksDisplay();
updateSidePlanksDisplay();