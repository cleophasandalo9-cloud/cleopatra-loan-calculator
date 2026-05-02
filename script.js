//=============================================
//SYSTEM STATUS CONTROLLER
//=============================================

let currentStatus = 'maintenance';

let isMaintenanceMode = true;

//Get elements from HTML
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

const warningMsg = document.getElementById('warningMsg');
const mainLink = document.querySelector('.main-link');

const toggleBtn = document.getElementById('toggleMaintenance');

const adminPanel = document.querySelector('.admin-panel');
const adminTrigger = document.getElementById('adminTrigger');

let isAdmin = false;

//========================
//LOAD ADMIN SESSION
//========================

//Check if already authenticated
const savedAdmin = localStorage.getItem('isAdmin');

if (savedAdmin === 'true') {
  isAdmin = true;
  adminPanel.style.display = 'block';
}

//=======================================
//ADMIN ACCESS CONTROL
//=======================================
adminTrigger.addEventListener('dblclick', () => {
  const password = prompt ('Enter admin password');

  if (password === '#theeCalculator@1') {
    isAdmin =true;

    localStorage.setItem ('isAdmin', 'true');

    adminPanel.style.display = 'block';

    alert ('Admin access granted');

  } else {
    alert ('Access denied');
  }

});

//Logout for the admin
const LogoutBtn = document.getElementById('logoutAdmin');

LogoutBtn.addEventListener('click', () => {
  isAdmin = false;

  localStorage.removeItem ('isAdmin');

  adminPanel.style.display = 'none';

  alert ('Logged out');
  
});


//==========================
//LOAD SAVED STATE
//==========================
const savedMode = localStorage.getItem('maintenanceMode');

if (savedMode !== null) {
  isMaintenanceMode = savedMode === 'true';
};

if (isMaintenanceMode) {
  setStatus('maintenance');
} else {
  setStatus('online');
}

//=============================================
//TOGGLE MAINTENANCE MODE
//=============================================
toggleBtn.addEventListener('click', () => {

  //Flip State
  isMaintenanceMode = !isMaintenanceMode;

  //Save to localStorage
  localStorage.setItem('maintenanceMode', isMaintenanceMode);

  //Apply new State
  if (isMaintenanceMode) {
    setStatus('maintenance');
    redirectMsg.innerText = 'Maintenance mode activated.'
  } else {
    setStatus('online');
    redirectMsg.innerText = 'System is now live.'
  }
});

//============================================
//STATUS CONFIG FUNCTION
//============================================
function setStatus (status) {

  currentStatus = status

  if (status === 'maintenance') {
    statusText.innerText = 'Maintenance in Progress';

    statusDot.style.setProperty('--status-color', 'rgb(255, 180, 0)');
    statusDot.style.setProperty('--status-glow', '0 0 10px rgba(255, 180, 0, 0.8)');
    statusDot.style.setProperty('--status-glow-soft', '0 0 10px rgba(255, 180, 0, 0.5)');
    statusDot.style.setProperty('--status-glow-strong', '0 0 10px rgba(255, 180, 0, 1)');

  } else if (status === 'online') {
    statusText.innerText = 'System Operational';

statusDot.style.setProperty('--status-color', 'rgb(0, 200, 100)');
    statusDot.style.setProperty('--status-glow', '0 0 10px rgba(0, 200, 100, 0.8)');
    statusDot.style.setProperty('--status-glow-soft', '0 0 10px rgba(0, 200, 100, 0.5)');
    statusDot.style.setProperty('--status-glow-strong', '0 0 10px rgba(0, 200, 100, 1)');

  } else if (status === 'down') {
    statusText.innerText = 'System Offline';

    statusDot.style.setProperty('--status-color', 'rgb(255, 80, 80)');
    statusDot.style.setProperty('--status-glow', '0 0 10px rgba(255, 80, 80, 0.8)');
    statusDot.style.setProperty('--status-glow-soft', '0 0 10px rgba(255, 80, 80, 0.5)');
    statusDot.style.setProperty('--status-glow-strong', '0 0 10px rgba(255, 80, 80, 1)');



  }

}



//==========================================
//COUNTDOWN SYSTEM
//==========================================

//Set maintenance duration (in seconds)
let maintenanceTime = 86400;

const countdownTimer = document.getElementById('countdownTimer');
const redirectMsg = document.getElementById('redirectMsg');

//========================================
//FORMAT TIME FUNCTION
//========================================
function formatTime (seconds) {
  let mins = Math.floor(seconds / 60);
  let secs = seconds % 60;

  if (secs < 10) secs = '0' + secs;

  return mins + ':' + secs;
}

//==========================================
//START COUNTDOWN
//==========================================
function startCountdown () {

  if (!isMaintenanceMode) {
    clearInterval(interval);
    return;
  }

  const interval = setInterval(() => {

    maintenanceTime--;

    countdownTimer.innerText = formatTime(maintenanceTime);

    //Check server after every 5 seconds
    if (maintenanceTime % 5 === 0) {

      checkServerStatus().then(isOnline => {

        if (isOnline) {
          warningMsg.innerText = '';
          clearInterval(interval);

          //Switch status to online
          setStatus('online');

          redirectMsg.innerText = 'System is back online. Redirecting...';

          //Redirect after a short delay
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 3000);

        } else {
          redirectMsg.innerText = 'Still under maintenance... checking again.';

          warningMsg.innerText = '⚠ System is currently unavailable. Please wait...'
        }
        
      });

        //countdownTimer.innerText = '00:00';

      
      
    }

  }, 1000);
}

//=======================================
//SERVER STATUS CHECK
//=======================================
async function checkServerStatus() {
  try {
    const response = await fetch ('index0.html', {
      method: 'HEAD',
      cache: 'no-store'
    });

    //If response is ok 'n server is back
    if (response.ok) {
      return true;

    } else {
      return false;
    }

  } catch (error) {
    //If request fails 'n still down
    return false;
  }
}

//Set default status
setStatus('maintenance');
startCountdown();

//=======================================
//BLOCK ACCESS IF NOT READY
//=======================================
mainLink.addEventListener('click', function (e) {

  if (currentStatus !== 'online') {
    e.preventDefault(); //Stop navigation

    warningMsg.innerText = `⚠ System is not ready yet. Please wait until it's back online.`;
  }
});
