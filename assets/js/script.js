// API key for OpenWeatherMap
let apiKey = "6a388ea7fd76b67721cbdab8b49dd137";

// Reference to the search button and city input elements
const searchBtn = document.querySelector("#button-addon2");
const citySearch = document.querySelector(".form-control");

// Create a global element for displaying the current date
const todayDateElement = document.createElement("p");
todayDateElement.id = "today-date";

// Function to display the current date
function displayTime(element) {
  const today = dayjs().format("MMMM DD, YYYY");
  element.textContent = today;
}

// Function to get the current date
function getCurrentDate() {
  return dayjs().format("MMMM DD, YYYY");
}

// Function to update the search history
function updateSearchHistory(city) {
  let searchHistoryElement = document.getElementById("search-history");

  // Create searchHistory element if not present
  if (!searchHistoryElement) {
    searchHistoryElement = document.createElement("div");
    searchHistoryElement.id = "searchHistory";
    document.body.appendChild(searchHistoryElement);
  }

  // Check if the city is already in the search history
  const existingEntry = Array.from(searchHistoryElement.children).find(
    (entry) => entry.textContent === city
  );

  if (!existingEntry) {
    // Create a clickable search entry
    const newSearchEntry = document.createElement("p");
    newSearchEntry.textContent = city;
    newSearchEntry.style.cursor = "pointer"; // Add a pointer cursor for better UX
    newSearchEntry.addEventListener("click", function () {
      // Trigger function to fetch data for the selected city
      getWeatherData(city);
      getForecastData(city);
    });

    // Add the specified classes to the new search entry
    newSearchEntry.classList.add(
      "btn",
      "btn-primary",
      "m-2",
      "d-flex",
      "flex-wrap",
      "justify-content-around",
      "text-center"
    );

    // Append the new search entry to the search history
    searchHistoryElement.appendChild(newSearchEntry);
  }
}

// Function to check if data can be fetched
async function preCheckData(city) {
  if (!city) {
    document.getElementById("error-message").textContent =
      "Please enter a city to search.";
    document.getElementById("error-message").style.display = "block";
    return false;
  }

  const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  try {
    const response = await fetch(weatherAPIUrl);

    if (response.status !== 404) {
      // Hide the error message
      document.getElementById("error-message").style.display = "none";
      return true; // Data can be fetched
    } else {
      // Display "City not found" message and return false
      document.getElementById("error-message").textContent = "City not found.";
      document.getElementById("error-message").style.display = "block";
      return false;
    }
  } catch (error) {
    console.error(`Error checking data: ${error.message}`);
    document.getElementById(
      "error-message"
    ).textContent = `Error checking data: ${error.message}`;
    document.getElementById("error-message").style.display = "block";
    return false;
  }
}

// Function to get weather data from OpenWeatherMap API
async function getWeatherData(city) {
  if (!(await preCheckData(city))) {
    return;
  }

  const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  try {
    const response = await fetch(weatherAPIUrl);
    const data = await response.json();
    displayWeather(data);
    updateSearchHistory(city); // Update search history after a successful search
  } catch (error) {
    console.error(`Error fetching weather data: ${error.message}`);
  }
}

// Function to get 5-day forecast data from OpenWeatherMap API
async function getForecastData(city) {
  if (!(await preCheckData(city))) {
    return;
  }

  const forecastAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  try {
    const response = await fetch(forecastAPIUrl);
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.error(`Error fetching forecast data: ${error.message}`);
  }
}

// Function to display current weather information
function displayWeather(data) {
  const temperatureInFahrenheit = (
    ((data.main.temp - 273.15) * 9) / 5 +
    32
  ).toFixed(2);

  const weatherDisplay = document.getElementById("weather-display");
  const iconUrl = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  weatherDisplay.innerHTML = `
    <div class="card mb-3 col-12">  
      <div class="row g-0">        
        <div class="col-12">
          <div class="card-body">

          <div class="d-flex justify-content-between">
          <div class="d-flex flex-start">
          <h2 class="card-title">${
            data.name
          }<img src="${iconUrl}" class="d-inline img-fluid"><br><span id="today-date">${getCurrentDate()}</span></h2>
          </div>
          <div class="d-flex flex-end">
            <h2 id="temp">${temperatureInFahrenheit}°F</h2>
            </div>
            </div>
            <div class="d-block">
            <ul>
              <li>Wind Speed: ${data.wind.speed} m/s</li>
              <li>Umidity: ${data.main.humidity}%</li>
            </ul>
            
          </div>
        </div>
      </div>
    </div>
  `;
}

// Function to display 5-day forecast information
function displayForecast(data) {
  const forecastDisplay = document.getElementById("forecast-display");
  forecastDisplay.innerHTML = "";

  for (let i = 0; i < data.list.length; i += 8) {
    const forecast = data.list[i];
    const iconUrl = `http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    const temperatureInFahrenheit = (
      ((forecast.main.temp - 273.15) * 9) / 5 +
      32
    ).toFixed(2);

    const forecastCard = document.createElement("div");
    forecastCard.classList.add("card", "mb-3", "col-12");

    forecastCard.innerHTML = `
      <div class="g-0">
        <div class="col-12">
          <img src="${iconUrl}" class="img-fluid" alt="Weather Icon">
        </div>
        <div class="col-12">
          <div class="card-body">
            <h5 class="card-title">${getForecastDate(forecast.dt)}</h5>
            <ul class="small-card">
              <li>Temperature: ${temperatureInFahrenheit}°F</li>
              <li>Wind Speed: ${forecast.wind.speed} m/s</li>
              <li>Humidity: ${forecast.main.humidity}%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>      
    `;

    forecastDisplay.appendChild(forecastCard);
  }
}

// Function to convert timestamp to date for forecast
function getForecastDate(timestamp) {
  return dayjs.unix(timestamp).format("MMMM DD, YYYY");
}

// Function to clear the input form
function clearForm() {
  document.getElementById("cityInput").value = "";
}

// Add this code after selecting the input field
const cityInput = document.getElementById("cityInput");

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Trigger the search when Enter key is pressed
    search();
  }
});

searchBtn.addEventListener("click", search);

// Add this code to clear the form input
async function search() {
  // Display the current date and fetch weather data based on the city input
  displayTime(todayDateElement);
  const cityInputValue = document.getElementById("cityInput").value;

  // Check if the city input is empty
  if (!cityInputValue) {
    document.getElementById("error-message").textContent =
      "Please enter a city to search.";
    document.getElementById("error-message").style.display = "block";
    return; // Stop execution if the city input is empty
  }

  // Fetch weather data
  const weatherData = await getWeatherData(cityInputValue);

  // Check if weather data was fetched successfully
  if (weatherData) {
    // Show the forecast section
    const forecastSection = document.getElementById("five-days-forecast");
    forecastSection.classList.remove("hidden");

    // Create forecastDisplay element if not present
    let forecastDisplayElement = document.getElementById("forecastDisplay");
    if (!forecastDisplayElement) {
      forecastDisplayElement = document.createElement("div");
      forecastDisplayElement.id = "forecastDisplay";
      document.body.appendChild(forecastDisplayElement);
    }

    // Fetch forecast data
    await getForecastData(cityInputValue);

    // Clear the form input
    clearForm();
  }
}

// Function to get weather data from OpenWeatherMap API
async function getWeatherData(city) {
  if (!(await preCheckData(city))) {
    return null; // Return null if data cannot be fetched
  }

  const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  try {
    const response = await fetch(weatherAPIUrl);
    const data = await response.json();
    displayWeather(data);
    updateSearchHistory(city); // Update search history after a successful search
    return data; // Return the weather data
  } catch (error) {
    console.error(`Error fetching weather data: ${error.message}`);
    return null; // Return null if an error occurs
  }
}
