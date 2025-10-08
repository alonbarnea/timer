const workoutRounds = 3;
const workoutInterval = 30;
const switchInterval = 8;
const warningSeconds = 4;

const planksRounds = workoutRounds;
const planksSetOrder = ['Work', 'Rest'];

const sidePlanksRounds = workoutRounds;
const sidePlanksSetOrder = ['Side A', 'Switch Sides', 'Side B', 'Rest'];

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

function playTick() {
    playBeep(440, 0.1, 0.1, 'square');
}

function playLastTicks() {
    playBeep(520, 0.4, 0.6, 'square');
}

function playSwitchTick() {
    playBeep(4000, 0.1, 0.1, 'sine');
}

const ctx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(frequency, duration, volume, type) {

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

function toggleRepsTimer() {
    const header = document.getElementById('repsHeader');
    if (!repsTimerInterval) {
        header.textContent = 'Set ' + repsRound + ': Rest';
        repsTimerInterval = setInterval(() => {
            repsSeconds--;
            updateRepsDisplay();
            if (repsSeconds > warningSeconds) {
                playTick();
            } else {
                playLastTicks();
            }
            if (repsSeconds === 0) {
                clearInterval(repsTimerInterval);
                repsTimerInterval = null;
                repsSeconds = workoutInterval;
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
    const header = document.getElementById('planksHeader');
    if (!planksTimerInterval) {
        header.textContent = 'Set ' + (planksRounds - planksRoundsLeft + 1) + ": " + planksSetOrder[planksIndex];
        planksTimerInterval = setInterval(() => {
            planksSeconds--;
            updatePlanksDisplay();
            if (planksSeconds < warningSeconds) {
                playLastTicks();
            }
            if (planksSeconds === 0) {
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

function toggleSidePlanksTimer() {
    const header = document.getElementById('sidePlanksHeader');
    if (!sidePlanksTimerInterval) {
        header.textContent = 'Set ' + (sidePlanksRounds - sidePlanksRoundsLeft + 1) + ": " + sidePlanksSetOrder[sidePlanksIndex];
        sidePlanksTimerInterval = setInterval(() => {
            sidePlanksSeconds--;
            updateSidePlanksDisplay();
            if (sidePlanksIndex === 1) { // Switch
                playSwitchTick();
            } else if (sidePlanksSeconds < warningSeconds) {
                playLastTicks();
            } else if (sidePlanksIndex === 3) { // Rest
                playTick();
            }
            if (sidePlanksSeconds === 0) {
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