//===========================================
//APP STATE (GLOBAL). STEP 1.
//===========================================
const AppState = {
  currentStatus: 'maintenance',//1
  isMaintenanceMode: true,//2
  isAdmin: false,//3
  interval: null,//4
  maintenanceTime: 86400//5
}


//============================================
//DOM ELEMENTS MODULE. STEP 2.
//============================================
const DOM = {

  init () {
  this.statusDot = document.getElementById('statusDot');//1
  this.statusText = document.getElementById('statusText');//2
  this.warningMsg = document.getElementById('warningMsg');//3
  this.mainLink = document.querySelector('.main-link');//4
  this.toggleBtn = document.getElementById('toggleMaintenance');//5
  this.adminPanel = document.querySelector('.admin-panel');//6
  this.adminTrigger = document.getElementById('adminTrigger');//7
  this.logoutBtn = document.getElementById('logoutAdmin');//8
  this.countdownTimer = document.getElementById('countdownTimer');//9
  this.redirectMsg = document.getElementById('redirectMsg');//10

  }
};


//============================================
//ADMIN MODULE. STEP 3.
//============================================
const AdminModule = {

  init () {                               //1
    this.loadSession();
    this.bindEvents();
  },


  loadSession () {                        //2
    const savedAdmin = sessionStorage.getItem('adminSession');

    if (savedAdmin === 'true') {
      AppState.isAdmin = true;
      DOM.adminPanel.style.display = 'block';
    }
  },


  bindEvents () {                         //3
    DOM.adminTrigger.addEventListener('dblclick', this.login.bind(this));
    DOM.logoutBtn.addEventListener('click', this.logout.bind(this));
  },


  async login () {                              //4
    
    const password = prompt ('Enter admin password');

    if (!password) return;

    const hashedInput = await hashText(password);

    if (hashedInput === Security.adminHash) {

      AppState.isAdmin = true;
      sessionStorage.setItem('adminSession', 'active');

      DOM.adminPanel.style.display = 'block';

      alert ('Admin access granted');

    } else {
      alert ('Access denied');
    }

  },


  logout () {                             //5
    AppState.isAdmin = false;
    sessionStorage.removeItem('adminSession');

    DOM.adminPanel.style.display = 'none'
    alert ('Logged out')
  }
};


//============================================
//SECURITY CONFIG. STEP 10
//============================================
const Security = {
  //Pre-generate hash of the password
  adminHash: '164123564372d6d3298b851827a387815387f22b2f2280371143e5a17dcf712f' //we'll generate later
};


//============================================
//HASH UTILITY. STEP 11.
//============================================
 async function hashText(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const hashBuffer = await crypto.subtle.digest ('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map (b => b.toString(16).padStart(2, '0')).join('');
 }



//============================================
//STATUS MODULE. STEP 4.
//============================================
const StatusModule = {

  set(status) {
    AppState.currentStatus = status;

    if (status === 'maintenance') {
      DOM.statusText.innerText = 'Maintenance in Progress';

      DOM.statusDot.style.setProperty('--status-color', 'rgb(255, 180, 0)');
      DOM.statusDot.style.setProperty('--status-glow', '0 0 10px rgba(255, 180, 0, 0.8)');
      DOM.statusDot.style.setProperty('--status-glow-soft', '0 0 10px rgba(255, 180, 0, 0.5)');
      DOM.statusDot.style.setProperty('--status-glow-strong', '0 0 10px rgba(255, 180, 0, 1)');

    } else if (status === 'online') {
      DOM.statusText.innerText = 'System Operational';

      DOM.statusDot.style.setProperty('--status-color', 'rgb(0, 200, 100)');
      DOM.statusDot.style.setProperty('--status-glow', '0 0 10px rgba(0, 200, 100, 0.8)');
      DOM.statusDot.style.setProperty('--status-glow-soft', '0 0 10px rgba(0, 200, 100, 0.5)');
      DOM.statusDot.style.setProperty('--status-glow-strong', '0 0 10px rgba(0, 200, 100, 1)');

    } else if (status === 'down') {
      DOM.statusText.innerText = 'System Offline';

      DOM.statusDot.style.setProperty('--status-color', 'rgb(255, 80, 80)');
      DOM.statusDot.style.setProperty('--status-glow', '0 0 10px rgba(255, 80, 80, 0.8)');
      DOM.statusDot.style.setProperty('--status-glow-soft', '0 0 10px rgba(255, 80, 80, 0.5)');
      DOM.statusDot.style.setProperty('--status-glow-strong', '0 0 10px rgba(255, 80, 80, 1)');

    }

    if (!DOM.statusText) {
      console.error ('DOM not initialized');
      return;
    }
  }
}



//============================================
//SERVER MODULE. STEP 6.
//============================================
const ServerModule = {

  async check () {
    try {
      const response = await fetch ('index0.html', {
        method: 'HEAD',
        cache: 'no-store'
      });

      return response.ok;

    } catch(error) {
      return false;
    }

  }

};


//============================================
//COUNTDOWN MODULE. STEP 7.
//============================================
const CountdownModule ={

  formatTime (seconds) {
  let mins = Math.floor(seconds / 60);
  let secs = seconds % 60;

  if (secs < 10) secs = '0' + secs;

  return mins + ':' + secs;
},

start() {

  //Stop any existing interval
  if (AppState.interval) {
    clearInterval(AppState.interval);
  }

  if (!AppState.isMaintenanceMode) return;

  AppState.interval = setInterval (async () => {

    AppState.maintenanceTime--;

    DOM.countdownTimer.innerText = this.formatTime(AppState.maintenanceTime);

    //Every 5 seconds, check if system is online
    if (AppState.maintenanceTime % 5 === 0) {

      const isOnline = await ServerModule.check();

      if (isOnline) {
        clearInterval (AppState.interval);

        StatusModule.set('online');
        DOM.warningMsg.innerText = '';
        DOM.redirectMsg.innerText = 'System is back online. Redirecting...';

        setTimeout (() => {
          window.location.href ='index.html';
        }, 3000);

      } else {
        DOM.redirectMsg.innerText = 'Still under maintenance...checking again.';

        DOM.warningMsg.innerText = '⚠ System is currently unavailable. Please wait...';
      }
    }

  }, 1000);

}

};


//=============================================
//MAINTENANCE CONTROLLER. STEP 8.
//=============================================
const MaintenanceController = {

    init () {
      this.bindEvents();
    },


  bindEvents () {
    DOM.toggleBtn.addEventListener('click', this.toggle.bind(this));
  },


  toggle () {
    if (!AppState.isAdmin) {
      alert ('Unauthorized action');
      return;
    }
    //Flip stste
    AppState.isMaintenanceMode = !
    AppState.isMaintenanceMode;

    //save status
    localStorage.setItem ('maintenance', AppState.isMaintenanceMode);

    //Apply state
    if (AppState.isMaintenanceMode) {
      StatusModule.set('maintenance');
      DOM.redirectMsg.innerText = 'Maintenance mode activated.';
      CountdownModule.start();

    } else {
      StatusModule.set('online');
      DOM.redirectMsg.innerText = 'System is now live';
    }
  }

};


//==============================================
//LINK GUARD MODULE. STEP 9.
//==============================================
const LinkGuard = {

  init () {
    DOM.mainLink.addEventListener('click', this.handleClick);
  },

  handleClick (e) {
    if (AppState.currentStatus !== 'online') {
      e.preventDefault();

      DOM.warningMsg.innerText = "⚠ System is not ready yet. Please wait until it's back online.";
    }
  }
};




//============================================
//APP INITIALIZATION. STEP 5.
//============================================
document.addEventListener('DOMContentLoaded', () => {

  //Initialize DOM
  DOM.init();

  //Load saved maintenance status
  const savedMode = localStorage.getItem('maintenanceMode');

  if (savedMode !== null) {
    AppState.isMaintenanceMode = savedMode === 'true';
  }

  //Init modules
  AdminModule.init ();
  MaintenanceController.init();
  LinkGuard.init();

  //Apply state
  if (AppState.isMaintenanceMode) {
    StatusModule.set('maintenance');
  } else {
    StatusModule.set('online');
  }

});
