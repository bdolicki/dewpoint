(function() {
  // --- State Variables ---
  let airTemperature = 20; // Initial temperature in °C
  let relativeHumidity = 50; // Initial humidity in %

  // --- Constraints ---
  const TEMP_MIN = -40;
  const TEMP_MAX = 60;
  const TEMP_STEP = 1;
  const RH_MIN = 0;
  const RH_MAX = 100;
  const RH_STEP = 1;

  // --- DOM Element References ---
  // Temperature elements
  const tempValueDisplay = document.getElementById('temp-value');
  const tempDecrementBtn = document.getElementById('temp-decrement');
  const tempIncrementBtn = document.getElementById('temp-increment');

  // Humidity elements
  const rhValueDisplay = document.getElementById('rh-value');
  const rhDecrementBtn = document.getElementById('rh-decrement');
  const rhIncrementBtn = document.getElementById('rh-increment');

  // Dewpoint output element
  const dpOutputDisplay = document.getElementById('dp-output');

  // --- Core Dewpoint Calculation Function ---
  function dewpoint(T, RH) {
    if (RH === 0) return -Infinity; // Or handle as appropriate, e.g., return a specific low value or NaN
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * T) / (b + T)) + Math.log(RH / 100);
    return (b * alpha) / (a - alpha);
  }

  // --- Update Functions ---
  function updateDisplays() {
    if (tempValueDisplay) tempValueDisplay.textContent = airTemperature;
    if (rhValueDisplay) rhValueDisplay.textContent = relativeHumidity;
    calculateAndDisplayDewpoint();
  }

  function calculateAndDisplayDewpoint() {
    if (!dpOutputDisplay) return; // Guard if element not found
    const dp = dewpoint(airTemperature, relativeHumidity);
    if (dp === -Infinity || isNaN(dp) || typeof dp !== 'number') { // Added typeof check
         dpOutputDisplay.textContent = '--';
    } else {
        dpOutputDisplay.textContent = dp.toFixed(1); // Display dewpoint to one decimal place
    }
  }

  // --- Event Handlers for Pickers ---
  function setupEventListeners() {
    // Temperature
    if (tempDecrementBtn) {
      tempDecrementBtn.addEventListener('click', () => {
        airTemperature = Math.max(TEMP_MIN, airTemperature - TEMP_STEP);
        updateDisplays();
      });
    }

    if (tempIncrementBtn) {
      tempIncrementBtn.addEventListener('click', () => {
        airTemperature = Math.min(TEMP_MAX, airTemperature + TEMP_STEP);
        updateDisplays();
      });
    }

    // Humidity
    if (rhDecrementBtn) {
      rhDecrementBtn.addEventListener('click', () => {
        relativeHumidity = Math.max(RH_MIN, relativeHumidity - RH_STEP);
        updateDisplays();
      });
    }

    if (rhIncrementBtn) {
      rhIncrementBtn.addEventListener('click', () => {
        relativeHumidity = Math.min(RH_MAX, relativeHumidity + RH_STEP);
        updateDisplays();
      });
    }
  }

  // --- Initialization ---
  function init() {
    // Check if all crucial DOM elements are present before proceeding
    if (tempValueDisplay && tempDecrementBtn && tempIncrementBtn &&
        rhValueDisplay && rhDecrementBtn && rhIncrementBtn && dpOutputDisplay) {
      updateDisplays(); // Initial display update and dewpoint calculation
      setupEventListeners(); // Setup event listeners only if elements are found
    } else {
      console.error("One or more calculator DOM elements are missing. Initialization skipped.");
    }
  }

  // Make sure the DOM is loaded before trying to access elements
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init(); // DOM is already loaded
  }

})();
