"use strict";
import "./styles.css";
const form = document.querySelector(`form`);
import arrowSvg from "./imgs/wind-arrow.svg";
// const container = document.querySelector(`.weather-container`);
const output_container = document.querySelector(`.output-container`);
const weatherContainer = document.querySelector(`.weather-container`);

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const city = formatCity(document.getElementById("city-input").value);
  document.getElementById("city-input").value = "";
  if (!city) return;
  console.log("city: ", city);
  const data = await getWeather(city);
  displayWeather(data);
});

const formatCity = (city) =>
  city ? city[0].toUpperCase() + city.slice(1).toLowerCase() : city;

async function getWeather(city) {
  if (!city) return;
  const response = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=5b9478bff10b4dcba4c102131253107&q=${city}`,
    { mode: `cors` }
  );
  if (!response.ok) return;
  const processedData = processWeatherData(await response.json());
  console.log(
    `Weather in ${city}:\nTemperature: ${processedData.temp}°C (Feels like ${processedData.feels_like}°C), ${processedData.condition}\nHumidity: ${processedData.humidity}\nWind: ${processedData.wind} km/h (${processedData.wind_dir} degrees)`
  );

  return processedData;
}

const processWeatherData = function (data) {
  console.log("DATA:", data);
  const dict = {
    temp: data.current.temp_c,
    feels_like: data.current.feelslike_c,
    condition: data.current.condition.text,
    wind: data.current.wind_kph,
    wind_dir: data.current.wind_degree,
    humidity: data.current.humidity,
    icon: data.current.condition.icon,
    city: data.location.name,
    country: data.location.country,
  };
  return dict;
};

const displayWeather = function (data) {
  if (!data) return;
  console.log("data:", data);
  clearWeatherContainer();
  setGifBackground(data.condition);
  // toggle hidden class for the container
  if (output_container.classList.contains("hidden"))
    output_container.classList.remove("hidden");
  if (weatherContainer.classList.contains("hidden"))
    weatherContainer.classList.remove("hidden");
  const temp_container = getTemperatureContainer(data);
  const wind_container = getWindContainer(data);
  const weather_div = getCommonContainer(
    temp_container,
    wind_container,
    "result-container"
  );
  const location = getLocationContainer(data);
  // append it to main weather container
  weatherContainer.appendChild(location);
  weatherContainer.appendChild(weather_div);
  // setGifBackground(data.condition);
  //   container.appendChild(temp_container);
  //   container.appendChild(wind_container);
};

const getTemperatureContainer = function (data) {
  const temp_container = document.createElement("ul");
  temp_container.classList.add("temperature-container");
  const weather_img = document.createElement("img");
  weather_img.src = `https:${data.icon}`;
  const actual_temp = document.createElement("li");
  actual_temp.classList.add("actual-temperature");
  actual_temp.textContent = data.temp + "°C";
  const condition = document.createElement("li");
  condition.classList.add("condition");
  condition.textContent = data.condition;
  const feels_like_temp = document.createElement("li");
  feels_like_temp.classList.add("feels_like");
  feels_like_temp.textContent = "Feels like " + data.feels_like + "°C";
  // append to temperature container
  temp_container.appendChild(weather_img);
  temp_container.appendChild(actual_temp);
  temp_container.appendChild(condition);
  temp_container.appendChild(feels_like_temp);
  return temp_container;
};

const getWindContainer = function (data) {
  const wind_container = document.createElement("ul");
  wind_container.classList.add("wind-container");
  const wind_dir_img = document.createElement("img");
  wind_dir_img.classList.add("wind-dir");
  wind_dir_img.src = arrowSvg;
  wind_dir_img.onload = function () {
    wind_dir_img.style.transform = `rotate(${data.wind_dir}deg)`;
    wind_dir_img.style.color = "white";
  };
  const wind = document.createElement("li");
  wind.classList.add("word-wind");
  wind.textContent = "Wind";
  const speed = document.createElement("li");
  speed.classList.add("word-speed");
  speed.textContent = data.wind;
  const kmph = document.createElement("li");
  kmph.classList.add("word-kmph");
  kmph.textContent = "km/h";
  // append to wind container
  wind_container.appendChild(wind_dir_img);
  wind_container.appendChild(wind);
  wind_container.appendChild(speed);
  wind_container.appendChild(kmph);
  return wind_container;
};

const getCommonContainer = function (div1, div2, className) {
  const the_div = document.createElement("div");
  the_div.classList.add(className);
  the_div.appendChild(div1);
  the_div.appendChild(div2);
  return the_div;
};

const getLocationContainer = function (data) {
  const location = document.createElement("div");
  location.classList.add("location-div");
  location.textContent = data.city + ", " + data.country;
  return location;
};

const clearWeatherContainer = function () {
  weatherContainer.innerHTML = "";
  if (!weatherContainer.classList.contains("hidden"))
    weatherContainer.classList.toggle("hidden");
  // maybe outputContainer instead? We'll see...
};

const getCondition = function (condition) {
  condition = condition.toLowerCase();
  console.log("type of condition: ", typeof condition);
  if (condition.includes("thunder")) {
    return "thunder";
  }
  if (
    condition.includes("snow") ||
    condition.includes("ice") ||
    condition.includes("sleet") ||
    condition.includes("blizzard")
  ) {
    return "snow";
  }
  if (condition.includes("rain") || condition.includes("drizzle")) {
    return "rain";
  }
  if (condition.includes("sun") || condition.includes("clear")) {
    return "sun";
  }
  if (condition.includes("cloud") || condition.includes("overcast")) {
    return "cloud";
  }
  if (condition.includes("fog") || condition.includes("mist")) {
    return "fog";
  }
};

async function setGifBackground(condition) {
  const gifID = getGifID(getCondition(condition));
  if (!gifID) return;
  await fetch(
    `https://api.giphy.com/v1/gifs/${gifID}?api_key=KyZ23ldaNj98kVRChCL42wDin5u5vfIM`,
    { mode: "cors" }
  )
    .then((response) => response.json())
    .then((data) => {
      weatherContainer.style.backgroundImage = `url(${data.data.images.original.url})`;
      weatherContainer.style.backgroundSize = "cover";
      console.log("url:", data.data.images.original.url);
      console.log("weather container:", weatherContainer);
      console.log(
        "applied background image:",
        weatherContainer.style.backgroundImage
      );
    })
    .catch((e) => console.error("Error fetching GIF:", e));
}

const getGifID = function (condition) {
  let gifID;
  if (condition === "thunder") gifID = "fAV73wP5H7xN6";
  if (condition === "snow") gifID = "rRmBOCZDJJGU0";
  if (condition === "rain") gifID = "n0Zt16UrMKNFu";
  if (condition === "sun") gifID = "dVztX2CPLUKRy";
  if (condition === "cloud") gifID = "3o7rc6sa2RvKo8K5EI";
  if (condition === "fog") gifID = "gu6Wt3BmcoCDPR1wvp";
  return gifID;
};
