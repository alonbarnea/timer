let workoutRounds = parseInt(document.getElementById('sets').value);

let restTime = parseInt(document.getElementById('restTime').value);
let workTime = parseInt(document.getElementById('workTime').value);
let switchTime = parseInt(document.getElementById('switchTime').value);

let tickVolume = parseInt(document.getElementById('tickVolume').value);

let tickLastSeconds = parseInt(document.getElementById('tickLastSeconds').value);
let tickToneLastSecond = parseInt(document.getElementById('tickToneLastSecond').value);
let tickAlways = document.getElementById('tickAlways').checked;

let tickOnStartStop = document.getElementById('tickOnStartStop').checked;
let tickToneOnStartStop = parseInt(document.getElementById('tickToneOnStartStop').value);

let tickOnSwitch = document.getElementById('tickOnSwitch').checked;
let tickToneWhenSwitching = parseInt(document.getElementById('tickToneWhenSwitching').value);

const planksSetOrder = ['Work', 'Rest'];
const sidePlanksSetOrder = ['Side A', 'Switch Sides', 'Side B', 'Rest'];

let repsTimerInterval = null;
let repsRounds = workoutRounds;
let repsSeconds = restTime;
let repsRound = 1;

let planksTimerInterval = null;
let planksSeconds = workTime;
let planksRounds = workoutRounds;
let planksRoundsLeft = workoutRounds;
let planksIndex = 0;

let sidePlanksTimerInterval = null;
let sidePlanksSeconds = workTime;
let sidePlanksRounds = workoutRounds;
let sidePlanksRoundsLeft = workoutRounds;
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

document.getElementById('sets').addEventListener('change', e => {
    workoutRounds = e.target.value;
    planksRounds = workoutRounds;
    planksRoundsLeft = workoutRounds;
    sidePlanksRounds = workoutRounds;
    sidePlanksRoundsLeft = workoutRounds;
    localStorage.setItem('workoutRounds', workoutRounds);
});

document.getElementById('restTime').addEventListener('change', e => {
    restTime = e.target.value;
    repsSeconds = restTime;
    localStorage.setItem('restTime', restTime);
    updateRepsDisplay();
});

document.getElementById('workTime').addEventListener('change', e => {
    workTime = e.target.value;
    planksSeconds = workTime;
    sidePlanksSeconds = workTime;
    localStorage.setItem('workTime', workTime);
    updatePlanksDisplay();
    updateSidePlanksDisplay();
});

document.getElementById('switchTime').addEventListener('change', e => {
    switchTime = e.target.value;
    localStorage.setItem('switchTime', switchTime);
});

document.getElementById('tickVolume').addEventListener('change', e => {
    tickVolume = e.target.value;
    localStorage.setItem('tickVolume', tickVolume);
});

document.getElementById('tickLastSeconds').addEventListener('change', e => {
    tickLastSeconds = e.target.value;
    localStorage.setItem('tickLastSeconds', tickLastSeconds);
});

document.getElementById('tickToneLastSecond').addEventListener('change', e => {
    tickToneLastSecond = e.target.value;
    localStorage.setItem('tickToneLastSecond', tickToneLastSecond);
});

document.getElementById('tickAlways').addEventListener('change', e => {
    tickAlways = e.target.checked;
    localStorage.setItem('tickAlways', tickAlways);
});

document.getElementById('tickOnStartStop').addEventListener('change', e => {
    tickOnStartStop = e.target.checked;
    localStorage.setItem('tickOnStartStop', tickOnStartStop);
});

document.getElementById('tickToneOnStartStop').addEventListener('change', e => {
    tickToneOnStartStop = e.target.value;
    localStorage.setItem('tickToneOnStartStop', tickToneOnStartStop);
});

document.getElementById('tickOnSwitch').addEventListener('change', e => {
    tickOnSwitch = e.target.checked;
    localStorage.setItem('tickOnSwitch', tickOnSwitch);
});

document.getElementById('tickToneWhenSwitching').addEventListener('change', e => {
    tickToneWhenSwitching = e.target.value;
    localStorage.setItem('tickToneWhenSwitching', tickToneWhenSwitching);
});

document.getElementById('resetDefaultsBtn').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

function playTick() {
    playBeep(tickToneLastSecond, 0.1, tickVolume / 1000, 'square');
}

function playLastTicks() {
    playBeep(tickToneLastSecond, 0.1, 6 * tickVolume / 1000, 'square');
}

function playSwitchTicks() {
    playBeep(tickToneWhenSwitching, 0.1, 2 * tickVolume / 1000, 'square');
}

function playPressTick() {
    playBeep(tickToneOnStartStop, 0.1, tickVolume / 1000, 'square');
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
    if (tickOnStartStop) {
        playPressTick();
    }

    const header = document.getElementById('repsHeader');
    if (!repsTimerInterval) {
        header.textContent = 'Set ' + repsRound + ': Rest';
        repsTimerInterval = setInterval(() => {
            repsSeconds--;
            updateRepsDisplay();
            if (repsSeconds >= tickLastSeconds) {
                if (tickAlways) playTick();
            } else {
                playLastTicks();
            }
            if (repsSeconds === 0) {
                clearInterval(repsTimerInterval);
                repsTimerInterval = null;
                repsSeconds = restTime;
                repsRound = repsRound % workoutRounds + 1;
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
    if (tickOnStartStop) {
        playPressTick();
    }

    const header = document.getElementById('planksHeader');
    if (!planksTimerInterval) {
        header.textContent = 'Set ' + (planksRounds - planksRoundsLeft + 1) + ": " + planksSetOrder[planksIndex];
        planksTimerInterval = setInterval(() => {
            planksSeconds--;
            updatePlanksDisplay();
            if (planksSeconds < tickLastSeconds) {
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
                    header.textContent = 'Done';
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
    if (tickOnStartStop) {
        playPressTick();
    }

    const header = document.getElementById('sidePlanksHeader');
    if (!sidePlanksTimerInterval) {
        header.textContent = 'Set ' + (sidePlanksRounds - sidePlanksRoundsLeft + 1) + ": " + sidePlanksSetOrder[sidePlanksIndex];
        sidePlanksTimerInterval = setInterval(() => {
            sidePlanksSeconds--;
            updateSidePlanksDisplay();
            if (sidePlanksIndex === 1) { // Switch
                if(tickOnSwitch) {
                    playSwitchTicks();
                }
            } else if (sidePlanksSeconds < tickLastSeconds) {
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
                    header.textContent = 'Done';
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

function loadPreferences() {
    // Helper that sets the input from storage (if it exists) and returns its current value
    const loadAndGet = (id) => {
        const saved = localStorage.getItem(id);
        const input = document.getElementById(id);
        if (saved !== null) {
            input.value = saved;
        }
        // Return whatever value the input currently holds (from HTML or localStorage)
        return parseInt(input.value);
    };

    const loadAndGetBoolean = (id) => {
        const saved = localStorage.getItem(id);
        const input = document.getElementById(id);
        if (saved !== null) {
            input.checked = (saved === 'true');
        }
        return input.checked;
    };

    // 1. Load inputs & assign your global variables using HTML as the source of truth
    workoutRounds = loadAndGet('sets');

    workTime = loadAndGet('workTime');
    restTime = loadAndGet('restTime');
    switchTime = loadAndGet('switchTime');

    tickVolume = loadAndGet('tickVolume');

    tickLastSeconds = loadAndGet('tickLastSeconds');
    tickToneLastSecond = loadAndGet('tickToneLastSecond');
    
    tickAlways = loadAndGetBoolean('tickAlways');

    tickOnStartStop = loadAndGetBoolean('tickOnStartStop');
    tickToneOnStartStop = loadAndGet('tickToneOnStartStop');

    tickOnSwitch = loadAndGetBoolean('tickOnSwitch');
    tickToneWhenSwitching = loadAndGet('tickToneWhenSwitching');
}

// Run on startup
loadPreferences();

updateRepsDisplay();
updatePlanksDisplay();
updateSidePlanksDisplay();