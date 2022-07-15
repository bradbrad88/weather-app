// const fetchBtn = $("#fetchWeather");
// const fetchLocationBtn = $("#fetchLocation");
const locationInput = $("#locationInput");
const locationBtnContainer = $("#locationBtnContainer");
const searchForm = $("#searchForm");

const APP_ID = "a85920815477cd95ada1b55d26549d09";

const locations = loadLocations();
// let currentLocation = loadCurrentLocation(); //either the top location or undefined

searchForm.on("submit", async e => {
  e.preventDefault();
  const input = $(e.target).find("input");
  await onSearch(input.val());
});

async function onSearch(locationName) {
  const existingLocation = locations.find(
    location => location.name.toLowerCase() === locationName.toLowerCase()
  );
  if (existingLocation) {
    saveCurrentLocation(existingLocation);
  } else {
    try {
      const location = await fetchLocation(locationName);
      normaliseLocation(location);
      saveLocation(location);
      saveCurrentLocation(location);
    } catch (error) {
      // Handle the case where can't find a location
    }
  }
  renderLocations();
  fetchWeather();
}

locationBtnContainer.on("click", "button", e => {
  const btn = $(e.target);
  currentLocation = btn.data("location");
  saveCurrentLocation(currentLocation);
  const weather = fetchWeather();
  renderLocations();
});

function loadLocations() {
  const data = JSON.parse(localStorage.getItem("locations"));
  return data || [];
}

function loadCurrentLocation() {
  const data = JSON.parse(localStorage.getItem("currentLocation"));
  // if (!data) return locations[0];
  return data;
}

function saveCurrentLocation(location) {
  localStorage.setItem("currentLocation", JSON.stringify(location));
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
    return data[0];
  } catch (error) {
    console.error(error);
  }
}

async function fetchWeather() {
  const query = new URLSearchParams(currentLocation);
  query.append("appid", "a85920815477cd95ada1b55d26549d09");
  query.append("units", "metric");
  query.append("exclude", "minutely,hourly,alerts");

  const url = new URL("data/2.5/onecall", "https://api.openweathermap.org");
  url.search = query.toString();
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error(error);
  }
}

function normaliseLocation() {
  // Only want the following properties from the returned api object
  currentLocation = {
    name: currentLocation.name,
    lat: currentLocation.lat,
    lon: currentLocation.lon,
    country: currentLocation.country,
  };
}

function saveLocation(location) {
  locations.push(location);
  localStorage.setItem("locations", JSON.stringify(locations));
}

function renderLocations() {
  const currentLocation = loadCurrentLocation();
  locationBtnContainer.html("");
  locations.forEach(location => {
    console.log(location);
    const btn = $(
      `<button class="btn btn-primary p-3 m-2 text-white fs-4">${location.name}</button>`
    );
    btn.data("location", location);
    if (currentLocation && currentLocation.name === location.name) {
      btn.addClass("btn-success");
    }
    locationBtnContainer.append(btn);
  });
}

function init() {
  renderLocations();
}

init();
