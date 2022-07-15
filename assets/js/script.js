const fetchBtn = $("#fetchWeather");
const fetchLocationBtn = $("#fetchLocation");
const locationInput = $("#locationInput");
const APP_ID = "a85920815477cd95ada1b55d26549d09";
const locations = loadLocations();
const locationBtnContainer = $("#locationBtnContainer");

fetchLocationBtn.on("click", () => {
  const location = locationInput.val();
  fetchLocation(location);
});

locationBtnContainer.on("click", "button", e => {
  const btn = $(e.target);
  const location = btn.data("location");
  fetchWeather(location);
});

function loadLocations() {
  const data = JSON.parse(localStorage.getItem("locations"));
  return data || [];
}

async function fetchLocation(location) {
  const params = {
    q: location,
    appid: APP_ID,
  };
  const query = new URLSearchParams(params);
  const url = new URL("geo/1.0/direct", "http://api.openweathermap.org");
  url.search = query.toString();
  try {
    const response = await fetch(url);
    const data = await response.json();
    saveLocation(data[0]);
    renderLocations();
  } catch (error) {
    console.error(error);
  }
}

async function fetchWeather(location) {
  const query = new URLSearchParams(location);
  query.append("appid", "a85920815477cd95ada1b55d26549d09");
  query.append("units", "metric");
  query.append("exclude", "minutely,hourly,alerts");

  const url = new URL("data/2.5/onecall", "https://api.openweathermap.org");
  url.search = query.toString();
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
}

function saveLocation(location) {
  if (locationExists(location)) return;
  const saveItem = {
    name: location.name,
    lat: location.lat,
    lon: location.lon,
    country: location.country,
  };
  locations.push(saveItem);
  localStorage.setItem("locations", JSON.stringify(locations));
}

function locationExists(location) {
  const exists = locations.find(l => l.name === location.name);
  return !!exists;
}

function renderLocations() {
  locationBtnContainer.html("");
  locations.forEach(location => {
    const btn = $(
      `<button class="btn btn-success p-3 m-2 text-white fs-4">${location.name}</button>`
    );
    btn.data("location", location);
    locationBtnContainer.append(btn);
  });
}

function init() {
  renderLocations();
}

init();
