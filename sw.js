const CACHE_NAME = 'timer-app-v9';
const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './styles.css',
  './manifest.json',

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
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
