// Initialize recent searches from localStorage or empty array
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// Update current time
function updateCurrentTime() {
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeString;
}

// Update recent searches list
function updateRecentSearches(city, country) {
    const searchItem = `${city}, ${country}`;
    
    // Remove if already exists
    recentSearches = recentSearches.filter(item => item !== searchItem);
    
    // Add to beginning of array
    recentSearches.unshift(searchItem);
    
    // Keep only last 5 searches
    if (recentSearches.length > 5) {
        recentSearches.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    
    // Update UI
    displayRecentSearches();
}

// Display recent searches in sidebar
function displayRecentSearches() {
    const recentCitiesList = document.getElementById('recentCities');
    recentCitiesList.innerHTML = '';
    
    recentSearches.forEach(city => {
        const li = document.createElement('li');
        li.innerHTML = `
            <i class="fas fa-history"></i>
            ${city}
        `;
        li.addEventListener('click', () => {
            document.getElementById('cityField').value = city.split(',')[0];
            searchWeather();
        });
        recentCitiesList.appendChild(li);
    });
}

// Update time every minute
setInterval(updateCurrentTime, 60000);
updateCurrentTime();

// Display initial recent searches
displayRecentSearches();

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

document.getElementById("searchBtn").addEventListener("click", searchWeather);

document.getElementById("cityField").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchWeather();
  }
});

function searchWeather() {
  const city = document.getElementById("cityField").value.trim();
  if (city) {
    getCoordinates(city);
  } else {
    showError("Please enter a city name");
  }
}

async function getCoordinates(city) {
  showError("");
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("Location not found");
    }

    const { latitude, longitude, name, country } = data.results[0];
    getWeather(latitude, longitude, name, country);
  } catch (error) {
    showError(error.message);
  }
}

async function getWeather(latitude, longitude, city, country) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,is_day,visibility,dew_point_2m`
      );
  
      if (!response.ok) {
        throw new Error("Weather data not available");
      }
  
      const data = await response.json();
      displayWeather(data.current, city, country);
    } catch (error) {
      showError(error.message);
    }
}

function displayWeather(weather, city, country) {
    const weatherContainer = document.getElementById("weatherContainer");
    const cityHeader = document.getElementById("cityName");
    const temp = document.getElementById("temperature");
    const condition = document.getElementById("condition");
    const windSpeed = document.getElementById("windSpeed");
    const uvIndex = document.getElementById("uvIndex");
    const humidity = document.getElementById("humidity");
    const dewPoint = document.getElementById("dewPoint");
    const pressure = document.getElementById("pressure");
    const visibility = document.getElementById("visibility");
    const searchTime = document.getElementById("searchTime");
  
    const weatherCondition =
      weatherDescriptions[weather.weather_code] || "Unknown Condition";
  
    // Format current time for search result
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  
    weatherContainer.style.display = "block";
    cityHeader.textContent = `${city}, ${country}`;
    searchTime.textContent = `Last updated: ${dateString} at ${timeString}`;
    
    temp.textContent = `${weather.temperature_2m}°C`;
    condition.textContent = weatherCondition;
    windSpeed.textContent = `${weather.wind_speed_10m} km/h`;
    uvIndex.textContent = `${weather.uv_index}`;
    humidity.textContent = `${weather.relative_humidity_2m}%`;
    dewPoint.textContent = `${weather.dew_point_2m}°C`;
    pressure.textContent = `${Math.round(weather.pressure_msl)} hPa`;
    visibility.textContent = `${weather.visibility / 1000} km`;
    
    // Update recent searches
    updateRecentSearches(city, country);
}

function showError(message) {
    const weatherContainer = document.getElementById("weatherContainer");
    weatherContainer.style.display = "none";
    const errorPara = document.getElementById("errorMessage");
    errorPara.textContent = message;
}