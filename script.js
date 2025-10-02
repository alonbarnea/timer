const baseRounds = 3;
const baseInterval = 5;

// not used
const setWorkTime = 5;
const setRestTime = 5;
const numberOfSets = 3;

const dumbbellsEndingSeconds = 2;
const dumbbellsWarningSeconds = 8;

const planksRounds = baseRounds;
const planksSetOrder = ['Work', 'Rest'];

const sidePlanksRounds = baseRounds;
const sidePlanksSetOrder = ['Work R', 'Work L', 'Rest'];

let dumbbellsTimerInterval = null;
let dumbbellsSeconds = baseInterval;
let dumbbellsRound = 0;

let planksTimerInterval = null;
let planksSeconds = baseInterval;
let planksRoundsLeft = planksRounds;
let planksIndex = 0;

let sidePlanksTimerInterval = null;
let sidePlanksSeconds = baseInterval;
let sidePlanksRoundsLeft = sidePlanksRounds;
let sidePlanksIndex = 0;

function updateDumbbellsDisplay() {
    const mins = Math.floor(dumbbellsSeconds / 60).toString().padStart(2, '0');
    const secs = (dumbbellsSeconds % 60).toString().padStart(2, '0');
    document.getElementById('dumbbells-timer').textContent = `${mins}:${secs}`;
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

function playBeep(frequency, duration) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
//    oscillator.connect(ctx.destination);

    oscillator.type = 'sawtooth'; // sawtooth, square, triangle, sine
//    oscillator.frequency.value = frequency;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.value = 0.2;

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
}

function toggleDumbbellsTimer() {
    const header = document.getElementById('dumbbellsHeader');
    if (!dumbbellsTimerInterval) {
        header.textContent = 'Set ' + (dumbbellsRound + 1) + ': Rest';
        dumbbellsTimerInterval = setInterval(() => {
            dumbbellsSeconds--;
            updateDumbbellsDisplay();
            if (dumbbellsSeconds === dumbbellsWarningSeconds) {
                playBeep(660, 0.4);
            }
            if (dumbbellsSeconds <= dumbbellsEndingSeconds && dumbbellsSeconds >= 1) {
                playBeep(660, 0.4);
            }
            if (dumbbellsSeconds <= 0) {
                playBeep(660, 0.8);
                resetDumbbellsTimer();
                clearInterval(dumbbellsTimerInterval);
                dumbbellsTimerInterval = null;
                dumbbellsSeconds = baseInterval;
                updateDumbbellsDisplay();
                dumbbellsRound = (dumbbellsRound + 1) % 3;
                if (dumbbellsRound > 0) {
                    header.textContent = 'Set ' + (dumbbellsRound + 1) + ': Work';
                } else {
                    header.textContent = '';
                }
            }
        }, 1000);
    } else {
        clearInterval(dumbbellsTimerInterval);
        dumbbellsTimerInterval = null;
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
            if (planksSeconds === 1 && planksIndex === 1) {
                playBeep(660, 0.4);
            }
            if (planksSeconds <= 0) {
                playBeep(660, 0.8);
                clearInterval(planksTimerInterval);
                planksTimerInterval = null;

                planksIndex = 1 - planksIndex;
                if (planksIndex === 0) {
                    planksRoundsLeft--;
                }
                if (planksRoundsLeft > 0) {
                    planksSeconds = baseInterval;
                    togglePlanksTimer();
                } else {
                    planksRoundsLeft = planksRounds;
                    planksSeconds = baseInterval;
                    header.textContent = '';
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
            if (sidePlanksSeconds === 1 && sidePlanksIndex === 2) {
                playBeep(660, 0.4);
            }
            if (sidePlanksSeconds <= 0) {
                playBeep(660, 0.6);
                clearInterval(sidePlanksTimerInterval);
                sidePlanksTimerInterval = null;

                sidePlanksIndex = (sidePlanksIndex + 1) % 3;
                if (sidePlanksIndex === 0) {
                    sidePlanksRoundsLeft--;
                }

                if (sidePlanksRoundsLeft > 0) {
                    sidePlanksSeconds = baseInterval;
                    toggleSidePlanksTimer();
                } else {
                    sidePlanksRoundsLeft = sidePlanksRounds;
                    sidePlanksSeconds = baseInterval;
                    header.textContent = '';
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

 function resetDumbbellsTimer() {
      clearInterval(dumbbellsTimerInterval);
      dumbbellsTimerInterval = null;
      dumbbellsSeconds = baseInterval;
      dumbbellsRound = 0;
      document.getElementById('dumbbellsHeader').textContent = '';
      updateDumbbellsDisplay();
  }

 function resetPlanksTimer() {
      clearInterval(planksTimerInterval);
      planksTimerInterval = null;
      planksSeconds = baseInterval;
      planksRoundsLeft = planksRounds;
      planksIndex = 0
      document.getElementById('planksHeader').textContent = '';
      updatePlanksDisplay();
  }

 function resetSidePlanksTimer() {
      clearInterval(sidePlanksTimerInterval);
      sidePlanksTimerInterval = null;
      sidePlanksSeconds = baseInterval;
      sidePlanksRoundsLeft = sidePlanksRounds;
      sidePlanksIndex = 0;
      document.getElementById('sidePlanksHeader').textContent = '';
      updateSidePlanksDisplay();
  }

updateDumbbellsDisplay();
updatePlanksDisplay();
updateSidePlanksDisplay();