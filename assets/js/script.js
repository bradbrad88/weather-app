const fetchBtn = $("#fetchWeather");
const fetchLocationBtn = $("#fetchLocation");
const locationInput = $("#locationInput");
const APP_ID = "a85920815477cd95ada1b55d26549d09";
const locations = loadLocations();

fetchLocationBtn.on("click", () => {
  const location = locationInput.val();
  fetchLocation(location);
});

fetchBtn.on("click", () => {
  const location = {
    lat: "123",
    lon: "456",
  };
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
  const response = await fetch(url);
  const data = await response.json();
  saveLocation(data[0]);
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
