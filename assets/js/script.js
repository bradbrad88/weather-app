const searchForm = $("#searchForm");
const locationBtnContainer = $("#locationBtnContainer");
const cityDetailsContainer = $("#cityDetailsContainer");
const forecastContainer = $("#forecastContainer");

const APP_ID = "a85920815477cd95ada1b55d26549d09";
const OPENWEATHER_URL = "https://api.openweathermap.org";
const ICON_URL = "http://openweathermap.org/img/wn/";

const locations = loadLocations();

searchForm.on("submit", async e => {
  e.preventDefault();
  const input = $(e.target).find("input");
  const success = await onSearch(input.val());
  if (!success) return;
  input.val("");
});

locationBtnContainer.on("click", "button", e => {
  const btn = $(e.target);
  currentLocation = btn.data("location");
  saveCurrentLocation(currentLocation);
  updateWeather();
  window.scrollTo(0, 0);
});

function loadLocations() {
  const data = JSON.parse(localStorage.getItem("locations"));
  return data || [];
}

function loadCurrentLocation() {
  const data = JSON.parse(localStorage.getItem("currentLocation"));
  return data;
}

function saveLocation(location) {
  locations.push(location);
  localStorage.setItem("locations", JSON.stringify(locations));
}

function saveCurrentLocation(location) {
  localStorage.setItem("currentLocation", JSON.stringify(location));
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

async function updateWeather() {
  renderLocations();
  const weather = await fetchWeather();
  if (!weather) return;
  renderCityCard(weather.current);
  renderForecast(weather.daily);
  console.log(weather);
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
    console.error(error);
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

function renderLocations() {
  const currentLocation = loadCurrentLocation();
  locationBtnContainer.html("");
  locations.forEach(location => {
    const btn = $(
      `<button class="btn btn-outline-primary  p-3 my-2  fs-4">${location.name}</button>`
    );
    btn.data("location", location);
    if (currentLocation && currentLocation.name === location.name) {
      btn.addClass("btn-primary");
      btn.removeClass("btn-outline-primary");
    }
    locationBtnContainer.append(btn);
  });
}

function renderForecast(forecast) {
  forecastContainer.html("");

  for (let i = 0; i < 5; i++) {
    renderForecastCard(forecast[i]);
  }
}

function renderCityCard(weatherCurrent) {
  const currentLocation = loadCurrentLocation();
  const { dt, temp, wind_speed, humidity, uvi, weather } = weatherCurrent;
  const date = moment.unix(dt).format("Do MMM, Y");
  cityDetailsContainer.find("h1").text(`${currentLocation.name} (${currentLocation.country})`);
  cityDetailsContainer.find(".date").text(date);
  cityDetailsContainer.find(".temp").text(temp + "°C");
  cityDetailsContainer.find(".wind").text(wind_speed + " KPH");
  cityDetailsContainer.find(".humidity").text(humidity + "%");
  cityDetailsContainer.find("img").attr("src", getIcon(weather[0].icon));
  const uvSpan = cityDetailsContainer.find(".uvi");
  uvSpan.text(uvi);
  setUvClass(uvSpan, uvi);
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
  card.append(cardBody);
  const col = $(`<div class="col-6 col-md-4">`);
  col.append(card);
  forecastContainer.append(col);
}

function init() {
  renderLocations();
  updateWeather();
}

init();
