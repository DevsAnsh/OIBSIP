const form = document.querySelector("#converter-form");
const input = document.querySelector("#temperature");
const inputWrap = document.querySelector(".input-wrap");
const inputSymbol = document.querySelector("#input-symbol");
const error = document.querySelector("#input-error");

const results = document.querySelector(".results");
const resultStatus = document.querySelector("#result-status");
const copyButton = document.querySelector("#copy-button");

const artTemperature = document.querySelector("#art-temperature");
const artDescription = document.querySelector("#art-description");
const thermometerArt = document.querySelector(".thermometer-art");
const thermometerMercury = document.querySelector(".thermo-mercury");


const unitNames = {
  celsius: "°C",
  fahrenheit: "°F",
  kelvin: "K",
};


/* -----------------------------
   SELECTED UNIT
----------------------------- */

function selectedUnit() {
  return document.querySelector(
    'input[name="unit"]:checked'
  ).value;
}


/* -----------------------------
   ERROR HANDLING
----------------------------- */

function showError(message) {
  error.textContent = message;

  inputWrap.classList.add("invalid");

  resultStatus.textContent = "Check value";
  resultStatus.classList.remove("active");

  copyButton.disabled = true;
}


function clearError() {
  error.textContent = "";

  inputWrap.classList.remove("invalid");
}


/* -----------------------------
   NUMBER FORMATTING
----------------------------- */

function format(value) {
  const rounded =
    Math.round((value + Number.EPSILON) * 100) / 100;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(rounded);
}


/* -----------------------------
   TEMPERATURE DESCRIPTION
----------------------------- */

function getTemperatureDescription(celsius) {

  if (celsius <= -30) {
    return "freezing";
  }

  if (celsius <= 0) {
    return "very cold";
  }

  if (celsius <= 10) {
    return "cold";
  }

  if (celsius <= 18) {
    return "cool";
  }

  if (celsius <= 26) {
    return "just right";
  }

  if (celsius <= 32) {
    return "warm";
  }

  if (celsius <= 40) {
    return "hot";
  }

  return "very hot";
}


/* -----------------------------
   UPDATE ILLUSTRATION
----------------------------- */

function updateIllustration(celsius) {

  const rounded =
    Math.round(celsius * 10) / 10;

  artTemperature.textContent =
    `${rounded}°`;

  artDescription.textContent =
    getTemperatureDescription(celsius);


  /*
    Keep the mercury height within
    a visually pleasing range.
  */

  const percentage =
    Math.max(
      15,
      Math.min(
        100,
        ((celsius + 20) / 60) * 100
      )
    );

  const mercuryHeight =
    60 + percentage * 0.65;

  thermometerMercury.style.height =
    `${mercuryHeight}px`;


  /*
    Subtle background changes based
    on temperature.
  */

  if (celsius <= 0) {
    thermometerArt.style.background = "#b8d9dc";
  } else if (celsius <= 18) {
    thermometerArt.style.background = "#d7dfc2";
  } else if (celsius <= 30) {
    thermometerArt.style.background = "#f6c86b";
  } else {
    thermometerArt.style.background = "#f49a68";
  }
}


/* -----------------------------
   CONVERT
----------------------------- */

function convert() {

  const rawValue = input.value.trim();

  /*
    Empty input
  */

  if (!rawValue) {

    showError(
      "Enter a temperature to get started."
    );

    return;
  }


  /*
    Valid decimal number.

    Supports:
    24
    24.5
    .5
    -10
    +20.25
  */

  const numberPattern =
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

  if (!numberPattern.test(rawValue)) {

    showError(
      "Please enter a valid number, such as 24.5."
    );

    return;
  }


  const value = Number(rawValue);
  const unit = selectedUnit();


  /*
    Convert input to Celsius first.
  */

  let celsius;

  if (unit === "celsius") {

    celsius = value;

  } else if (unit === "fahrenheit") {

    celsius = ((value - 32) * 5) / 9;

  } else {

    celsius = value - 273.15;
  }


  /*
    Absolute zero validation.
  */

  if (celsius < -273.15 - 1e-9) {

    const limits = {
      celsius: "−273.15 °C",
      fahrenheit: "−459.67 °F",
      kelvin: "0 K",
    };

    showError(
      `That is below absolute zero. ${limits[unit]} is the lowest possible temperature.`
    );

    return;
  }


  clearError();


  /*
    Calculate all units.
  */

  const fahrenheit =
    (celsius * 9) / 5 + 32;

  const kelvin =
    celsius + 273.15;


  /*
    Update result cards.
  */

  document.querySelector("#celsius-value").textContent =
    format(celsius);

  document.querySelector("#fahrenheit-value").textContent =
    format(fahrenheit);

  document.querySelector("#kelvin-value").textContent =
    format(kelvin);


  /*
    Update status.
  */

  resultStatus.textContent = "Converted";
  resultStatus.classList.add("active");

  copyButton.disabled = false;


  /*
    Update illustration.
  */

  updateIllustration(celsius);
}


/* -----------------------------
   UNIT CHANGE
----------------------------- */

document
  .querySelectorAll('input[name="unit"]')
  .forEach((radio) => {

    radio.addEventListener("change", () => {

      const unit = selectedUnit();

      inputSymbol.textContent =
        unitNames[unit];


      /*
        Convert again if there
        is already a value.
      */

      if (input.value.trim()) {
        convert();
      }

    });

  });


/* -----------------------------
   QUICK VALUES
----------------------------- */

document
  .querySelectorAll(".quick-buttons button")
  .forEach((button) => {

    button.addEventListener("click", () => {

      input.value =
        button.dataset.value;

      convert();

      input.focus();

    });

  });


/* -----------------------------
   INPUT
----------------------------- */

input.addEventListener("input", () => {

  if (inputWrap.classList.contains("invalid")) {
    clearError();
  }

});


/* -----------------------------
   COPY RESULTS
----------------------------- */

copyButton.addEventListener("click", async () => {

  if (copyButton.disabled) {
    return;
  }


  const celsius =
    document.querySelector("#celsius-value").textContent;

  const fahrenheit =
    document.querySelector("#fahrenheit-value").textContent;

  const kelvin =
    document.querySelector("#kelvin-value").textContent;


  const text =
    `${celsius} °C = ${fahrenheit} °F = ${kelvin} K`;


  try {

    await navigator.clipboard.writeText(text);

    copyButton.innerHTML =
      `Copied <span>✓</span>`;


    setTimeout(() => {

      copyButton.innerHTML =
        `Copy results <span>⌘</span>`;

    }, 1600);

  } catch (err) {

    /*
      Fallback for browsers where
      clipboard API is unavailable.
    */

    const temporaryInput =
      document.createElement("textarea");

    temporaryInput.value = text;

    document.body.appendChild(temporaryInput);

    temporaryInput.select();

    document.execCommand("copy");

    temporaryInput.remove();

    copyButton.innerHTML =
      `Copied <span>✓</span>`;


    setTimeout(() => {

      copyButton.innerHTML =
        `Copy results <span>⌘</span>`;

    }, 1600);

  }

});


/* -----------------------------
   FORM SUBMIT
----------------------------- */

form.addEventListener("submit", (event) => {

  event.preventDefault();

  convert();

});