const fetchBtn = $("#fetchWeather");
const fetchLocationBtn = $("#fetchLocation");
const locationInput = $("#locationInput");

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

async function fetchLocation(location) {
  const params = {
    q: location,
    appid: "a85920815477cd95ada1b55d26549d09",
  };
  const query = new URLSearchParams(params);
  const url = new URL("geo/1.0/direct", "http://api.openweathermap.org");
  url.search = query.toString();
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
  saveLocation(data);
}

function saveLocation(location) {
  if (locationExists(location)) return;
  console.log("location doesn't exist");
  const saveItem = location.map(l => ({
    name: l.name,
    lat: l.lat,
    lon: l.lon,
    country: l.country,
  }));
  const data = JSON.parse(localStorage.getItem("locations")) || [];
  data.push(saveItem);
  localStorage.setItem("locations", JSON.stringify(data));
}

function locationExists(location) {
  const data = JSON.parse(localStorage.getItem("locations"));
  if (!data) return false;
  const exists = data.find(l => l.name === location.name);
  return !!exists;
}
