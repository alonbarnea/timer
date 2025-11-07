const workoutRounds = 3;

let workTime = 30;
let restTime = 45;
let switchTime = 10;
let tickTime = 10;
let tickAlways = false;

const planksRounds = workoutRounds;
const planksSetOrder = ['Work', 'Rest'];

const sidePlanksRounds = workoutRounds;
const sidePlanksSetOrder = ['Side A', 'Switch Sides', 'Side B', 'Rest'];

let repsTimerInterval = null;
let repsSeconds = restTime;
let repsRound = 1;

let planksTimerInterval = null;
let planksSeconds = workTime;
let planksRoundsLeft = planksRounds;
let planksIndex = 0;

let sidePlanksTimerInterval = null;
let sidePlanksSeconds = workTime;
let sidePlanksRoundsLeft = sidePlanksRounds;
let sidePlanksIndex = 0;

const sectionHeaders = document.querySelectorAll('.section-header');
const sectionContents = document.querySelectorAll('.section-content');

sectionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
        // Close all opened sections
        sectionContents.forEach((content) => content.style.display = 'none');

        // Open the clicked section
        header.nextElementSibling.style.display = 'block';
    });
});

const settingsHeader = document.querySelector('.section-header-settings');

settingsHeader.addEventListener('click', () => {
    const panel = settingsHeader.nextElementSibling;
    const isHidden = getComputedStyle(panel).display === 'none';
    panel.style.display = isHidden ? 'block' : 'none';
});

document.getElementById('workTime').addEventListener('change', e => {
    workTime = e.target.value;
    planksSeconds = workTime;
    sidePlanksSeconds = workTime;
    updatePlanksDisplay();
    updateSidePlanksDisplay();
});

document.getElementById('restTime').addEventListener('change', e => {
    restTime = e.target.value;
    repsSeconds = restTime;
    updateRepsDisplay();
});

document.getElementById('switchTime').addEventListener('change', e => {
    switchTime = e.target.value;
});

document.getElementById('tickTime').addEventListener('change', e => {
    tickTime = e.target.value;
});

document.getElementById('tickAlways').addEventListener('change', e => {
    tickAlways = e.target.checked;
});

function playTick() {
    playBeep(440, 0.1, 0.1, 'square');
}

function playLastTicks() {
    playBeep(440, 0.1, 0.6, 'square');
}

function playSwitchTicks() {
    playBeep(4400, 0.1, 0.2, 'square');
}

function playPressTick() {
    playBeep(660, 0.1, 0.1, 'square');
}

const ctx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(frequency, duration, volume, type) {
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type; // sawtooth, square, triangle, sine
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.value = volume;

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
}

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

function toggleRepsTimer() {
    playPressTick();
    const header = document.getElementById('repsHeader');
    if (!repsTimerInterval) {
        header.textContent = 'Set ' + repsRound + ': Rest';
        repsTimerInterval = setInterval(() => {
            repsSeconds--;
            updateRepsDisplay();
            if (repsSeconds > tickTime) {
                if (tickAlways) playTick();
            } else {
                playLastTicks();
            }
            if (repsSeconds === 0) {
                clearInterval(repsTimerInterval);
                repsTimerInterval = null;
                repsSeconds = restTime;
                repsRound = repsRound % 3 + 1;
                header.textContent = 'Set ' + repsRound + ': Work';
                updateRepsDisplay();
            }
        }, 1000);
    } else {
        clearInterval(repsTimerInterval);
        repsTimerInterval = null;
        header.textContent = 'PAUSED';
    }
}

function togglePlanksTimer() {
    playPressTick();
    const header = document.getElementById('planksHeader');
    if (!planksTimerInterval) {
        header.textContent = 'Set ' + (planksRounds - planksRoundsLeft + 1) + ": " + planksSetOrder[planksIndex];
        planksTimerInterval = setInterval(() => {
            planksSeconds--;
            updatePlanksDisplay();
            if (planksSeconds < tickTime) {
                playLastTicks();
            } else {
                if (tickAlways) playTick();
            }
            if (planksSeconds === 0) {
                clearInterval(planksTimerInterval);
                planksTimerInterval = null;
                planksIndex = 1 - planksIndex;
                if (planksIndex === 0) {
                    planksRoundsLeft--;
                    planksSeconds = workTime;
                } else {
                    planksSeconds = restTime;
                }
                if (planksRoundsLeft > 0) {
                    togglePlanksTimer();
                } else {
                    planksRoundsLeft = planksRounds;
                    header.textContent = 'Planks Done';
                    updatePlanksDisplay();
                }
            }
        }, 1000);
    } else {
        clearInterval(planksTimerInterval);
        planksTimerInterval = null;
        header.textContent = 'PAUSED';
     }
}

function toggleSidePlanksTimer(pressTick = true) {
    if (pressTick) playPressTick();
    const header = document.getElementById('sidePlanksHeader');
    if (!sidePlanksTimerInterval) {
        header.textContent = 'Set ' + (sidePlanksRounds - sidePlanksRoundsLeft + 1) + ": " + sidePlanksSetOrder[sidePlanksIndex];
        sidePlanksTimerInterval = setInterval(() => {
            sidePlanksSeconds--;
            updateSidePlanksDisplay();
            if (sidePlanksIndex === 1) { // Switch
                playSwitchTicks();
            } else if (sidePlanksSeconds < tickTime) {
                playLastTicks();
            } else {
                if (tickAlways) playTick();
            }
            if (sidePlanksSeconds === 0) {
                clearInterval(sidePlanksTimerInterval);
                sidePlanksTimerInterval = null;
                sidePlanksIndex = (sidePlanksIndex + 1) % 4;
                if (sidePlanksIndex === 0) {
                    sidePlanksRoundsLeft--;
                    sidePlanksSeconds = workTime;
                } else if (sidePlanksIndex === 1) {
                    sidePlanksSeconds = switchTime;
                } else if (sidePlanksIndex === 2) {
                    sidePlanksSeconds = workTime;
                }
                else if (sidePlanksIndex === 3) {
                    sidePlanksSeconds = restTime;
                }
                if (sidePlanksRoundsLeft > 0) {
                    toggleSidePlanksTimer(false);
                } else {
                    sidePlanksRoundsLeft = sidePlanksRounds;
                    header.textContent = 'Side Planks Done';
                    updateSidePlanksDisplay();
                }
            }
        }, 1000);
    } else {
        clearInterval(sidePlanksTimerInterval);
        sidePlanksTimerInterval = null;
        header.textContent = 'PAUSED';
      }
}

updateRepsDisplay();
updatePlanksDisplay();
updateSidePlanksDisplay();