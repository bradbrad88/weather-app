const searchForm = $("#searchForm");
const locationDropdown = $("#locationDropdown");
const locationBtnContainer = $("#locationBtnContainer");
const cityDetailsContainer = $("#cityDetailsContainer");
const cityDetailsCard = cityDetailsContainer.find(".card-body.main");
cityDetailsCard.detach();
const forecastContainer = $("#forecastContainer");
const setHomeBtn = $("#setHome");
const homeTownNav = $("#homeTown");

const APP_ID = "a85920815477cd95ada1b55d26549d09";
const OPENWEATHER_URL = "https://api.openweathermap.org";
const ICON_URL = "http://openweathermap.org/img/wn/";

const locations = loadLocations();

setHomeBtn.hide();
setHomeBtn.on("click", saveHomeLocation);

searchForm.on("submit", async e => {
  e.preventDefault();
  const input = $(e.target).find("input");
  const success = await onSearch(input.val());
  if (!success) return;
  input.val("");
});

homeTownNav.on("click", onHome);

function onHome() {
  const location = loadHomeLocation();
  onSearch(location.name);
}

function renderHomeNav() {
  const home = JSON.parse(localStorage.getItem("home"));
  if (!home) return;
  const anchor = homeTownNav.find("a");
  anchor.text("Home - " + home.name);
  anchor.removeClass(["disabled", "text-secondary"]);
  anchor.addClass("text-dark");
}

function onLocationClick(e) {
  const el = $(e.target);
  currentLocation = el.data("location");
  saveCurrentLocation(currentLocation);
  updateWeather();
  window.scrollTo(0, 0);
}

locationDropdown.on("click", "a", onLocationClick);

locationBtnContainer.on("click", "button", onLocationClick);

function loadLocations() {
  const data = JSON.parse(localStorage.getItem("locations"));
  return data || [];
}

function loadCurrentLocation() {
  const data = JSON.parse(localStorage.getItem("currentLocation"));
  return data;
}

function loadHomeLocation() {
  const data = JSON.parse(localStorage.getItem("home"));
  return data;
}

function saveLocation(location) {
  locations.push(location);
  localStorage.setItem("locations", JSON.stringify(locations));
}

function saveCurrentLocation(location) {
  localStorage.setItem("currentLocation", JSON.stringify(location));
}

function saveHomeLocation() {
  const location = loadCurrentLocation();
  localStorage.setItem("home", JSON.stringify(location));
  setHomeBtn.hide();
  renderHomeNav();
}

function normaliseLocation(location) {
  // Only want the following properties from the returned api object
  return {
    name: location.name,
    lat: location.lat,
    lon: location.lon,
    country: location.country,
  };
}

async function onSearch(locationName) {
  const existingLocation = locations.find(
    location => location.name.toLowerCase() === locationName.toLowerCase()
  );
  if (existingLocation) {
    saveCurrentLocation(existingLocation);
  } else {
    try {
      const responseData = await fetchLocation(locationName);
      const location = normaliseLocation(responseData);
      saveLocation(location);
      saveCurrentLocation(location);
    } catch (error) {
      return false;
      // Handle the case where can't find a location
    }
  }
  updateWeather();
  return true;
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
  const currentLocation = loadCurrentLocation();
  if (!currentLocation) return null;
  const query = new URLSearchParams(currentLocation);
  query.append("appid", APP_ID);
  query.append("units", "metric");
  query.append("exclude", "minutely,hourly,alerts");
  const url = new URL("data/2.5/onecall", OPENWEATHER_URL);
  url.search = query.toString();
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Error when fetching weather", error);
    return null;
  }
}

function setUvClass(uvSpan, uvi) {
  uvSpan.removeClass(["bg-success", "bg-warning", "bg-danger"]);
  if (uvi < 2) {
    uvSpan.addClass("bg-success");
  } else if (uvi < 5) {
    uvSpan.addClass("bg-warning");
  } else {
    uvSpan.addClass("bg-danger");
  }
}

function getIcon(icon) {
  return `${ICON_URL}${icon}@4x.png`;
}

function renderForecast(forecast) {
  forecastContainer.html("");
  for (let i = 0; i < 5; i++) {
    renderForecastCard(forecast[i]);
  }
}

function renderCityCard(weatherCurrent) {
  if (!weatherCurrent) return;
  const { dt, temp, wind_speed, humidity, uvi, weather } = weatherCurrent;
  const currentLocation = loadCurrentLocation();
  if (!currentLocation) return;
  const homeLocation = loadHomeLocation();
  if (homeLocation && currentLocation.name === homeLocation.name) {
    setHomeBtn.hide();
  } else {
    setHomeBtn.show();
  }
  const date = moment.unix(dt).format("Do MMM, Y");
  cityDetailsCard.find("h1").text(`${currentLocation.name} (${currentLocation.country})`);
  cityDetailsCard.find(".date").text(date);
  cityDetailsCard.find(".temp").text(temp + "°C");
  cityDetailsCard.find(".wind").text(wind_speed + " KPH");
  cityDetailsCard.find(".humidity").text(humidity + "%");
  cityDetailsCard.find("img").attr("src", getIcon(weather[0].icon));
  const uvSpan = cityDetailsCard.find(".uvi");
  uvSpan.text(uvi);
  setUvClass(uvSpan, uvi);

  const placeholder = cityDetailsContainer.find(".card-body.sub");
  if (placeholder.length > 0) {
    placeholder.detach();
    cityDetailsContainer.append(cityDetailsCard);
  }
}

function renderForecastCard(dailyData) {
  const { dt, temp, wind_speed, humidity, weather } = dailyData;
  const date = moment.unix(dt).format("dddd[\n]Do MMM, Y");
  const cardBody = $(`<div class="card-body">`);
  cardBody.append(
    $(
      `<img class="card-img-top" src="${getIcon(weather[0].icon)}" alt="${
        weather[0].description
      }" />`
    )
  );
  cardBody.append($(`<h2 class="card-title">${date}</h2>`));
  cardBody.append($(`<p class="card-text">Temp: ${temp.max}°C</p>`));
  cardBody.append($(`<p class="card-text">Wind Speed: ${wind_speed} KPH</p>`));
  cardBody.append($(`<p class="card-text">Humidity: ${humidity}%</p>`));
  const card = $(`<article class="card my-2 p-1 p-md-3 bg-light border-dark">`);
  const col = $(`<div class="col-6 col-md-4">`);
  card.append(cardBody);
  col.append(card);
  forecastContainer.append(col);
}

async function updateWeather() {
  renderLocations();
  const weather = await fetchWeather();
  if (!weather) return;
  renderCityCard(weather.current);
  renderForecast(weather.daily);
}

function renderLocations() {
  locationDropdown.html("");
  locations.forEach(location => {
    const item = $("<li>");
    const anchor = $(`<a class="dropdown-item" href="#">${location.name}</a>`);
    anchor.data("location", location);
    item.append(anchor);
    locationDropdown.append(item);
  });
}

function init() {
  updateWeather();
  renderHomeNav();
}

init();
