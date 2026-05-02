//=============================================
//SYSTEM STATUS CONTROLLER
//=============================================

//Get elements from HTML
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

//============================================
//STATUS CONFIG FUNCTION
//============================================
function setStatus (status) {

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

//Set default status
setStatus('maintenance')