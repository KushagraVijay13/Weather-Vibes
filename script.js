// Weather App JavaScript
class WeatherApp {
    constructor() {
        this.apiKey = 'dd4f4e681c0c46558d7114441251210';
        this.baseUrl = 'https://api.weatherapi.com/v1';
        this.init();
    }

    init() {
        this.bindEvents();
        this.getCurrentLocationWeather();
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => {
            const city = document.getElementById('cityInput').value.trim();
            if (city) {
                this.getWeatherByCity(city);
            }
        });

        document.getElementById('cityInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = e.target.value.trim();
                if (city) {
                    this.getWeatherByCity(city);
                }
            }
        });

        document.getElementById('locationBtn').addEventListener('click', () => {
            this.getCurrentLocationWeather();
        });
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('weatherCard').style.display = 'none';
        document.getElementById('forecastSection').style.display = 'none';
        document.getElementById('recommendations').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    getCurrentLocationWeather() {
        if (navigator.geolocation) {
            this.showLoading();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    this.getWeatherByCoords(lat, lon);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    this.hideLoading();
                    alert('Unable to get your location. Please search for a city manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    async getWeatherByCity(city) {
        this.showLoading();
        try {
            // Get current weather and forecast
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(`${this.baseUrl}/current.json?key=${this.apiKey}&q=${city}&aqi=no`),
                fetch(`${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${city}&days=5&aqi=no`)
            ]);
            
            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();
            
            if (currentResponse.ok && forecastResponse.ok) {
                this.displayWeather(currentData);
                this.displayForecast(forecastData);
            } else {
                throw new Error(currentData.error?.message || forecastData.error?.message);
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            alert('Error fetching weather data. Please try again.');
            this.hideLoading();
        }
    }

    async getWeatherByCoords(lat, lon) {
        try {
            // Get current weather and forecast
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(`${this.baseUrl}/current.json?key=${this.apiKey}&q=${lat},${lon}&aqi=no`),
                fetch(`${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${lat},${lon}&days=5&aqi=no`)
            ]);
            
            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();
            
            if (currentResponse.ok && forecastResponse.ok) {
                this.displayWeather(currentData);
                this.displayForecast(forecastData);
            } else {
                throw new Error(currentData.error?.message || forecastData.error?.message);
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            alert('Error fetching weather data. Please try again.');
            this.hideLoading();
        }
    }

    displayWeather(data) {
        this.hideLoading();
        
        const { location, current } = data;
        
        // Update weather display
        document.getElementById('cityName').textContent = `${location.name}, ${location.country}`;
        document.getElementById('temp').textContent = Math.round(current.temp_c);
        document.getElementById('description').textContent = current.condition.text;
        document.getElementById('weatherIcon').src = `https:${current.condition.icon}`;
        document.getElementById('feelsLike').textContent = `${Math.round(current.feelslike_c)}°C`;
        document.getElementById('humidity').textContent = `${current.humidity}%`;
        document.getElementById('windSpeed').textContent = `${current.wind_kph} km/h`;
        
        // Update background
        this.updateBackground(current.condition.text, current.is_day);
        
        // Show weather card
        document.getElementById('weatherCard').style.display = 'block';
        
        // Generate and display recommendations
        this.generateRecommendations(current.condition.text, current.temp_c, current.is_day);
        document.getElementById('recommendations').style.display = 'block';
    }

    displayForecast(data) {
        const forecastGrid = document.getElementById('forecastGrid');
        const forecastDays = data.forecast.forecastday;
        
        forecastGrid.innerHTML = forecastDays.map((day, index) => {
            const date = new Date(day.date);
            const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return `
                <div class="forecast-item">
                    <div class="forecast-date">
                        <div>${dayName}</div>
                        <div style="font-size: 0.8rem; opacity: 0.7;">${monthDay}</div>
                    </div>
                    <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                    <div class="forecast-temps">
                        <span class="forecast-high">${Math.round(day.day.maxtemp_c)}°</span>
                        <span class="forecast-low">${Math.round(day.day.mintemp_c)}°</span>
                    </div>
                    <div class="forecast-desc">${day.day.condition.text}</div>
                    <div style="font-size: 0.8rem; opacity: 0.6; margin-top: 5px;">
                        <i class="fas fa-tint"></i> ${day.day.daily_chance_of_rain}%
                    </div>
                </div>
            `;
        }).join('');
        
        // Show forecast section
        document.getElementById('forecastSection').style.display = 'block';
    }

    updateBackground(condition, isDay) {
        const background = document.getElementById('weatherBackground');
        background.className = 'weather-background';
        
        const conditionLower = condition.toLowerCase();
        
        if (!isDay) {
            background.classList.add('night');
        } else if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
            background.classList.add('sunny');
        } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
            background.classList.add('rainy');
        } else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
            background.classList.add('snowy');
        } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
            background.classList.add('stormy');
        } else {
            background.classList.add('cloudy');
        }
    }

    generateRecommendations(condition, temperature, isDay) {
        const conditionLower = condition.toLowerCase();
        let weatherType = 'cloudy';
        
        if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
            weatherType = 'sunny';
        } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
            weatherType = 'rainy';
        } else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
            weatherType = 'snowy';
        } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
            weatherType = 'stormy';
        }
        
        this.displaySongRecommendations(weatherType, temperature, isDay);
        this.displayPlaceRecommendations(weatherType, temperature, isDay);
    }

    displaySongRecommendations(weatherType, temperature, isDay) {
        const songRecommendations = {
            sunny: [
                {
                    title: "Good 4 U",
                    artist: "Olivia Rodrigo",
                    description: "Perfect upbeat track for sunny days",
                    spotifyUrl: "https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG"
                },
                {
                    title: "Blinding Lights",
                    artist: "The Weeknd",
                    description: "Energetic vibes for bright weather",
                    spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlULA4LGoDOLVja"
                },
                {
                    title: "Sunflower",
                    artist: "Post Malone & Swae Lee",
                    description: "Sunny day anthem",
                    spotifyUrl: "https://open.spotify.com/track/0RiRZpuVRbi7oqRdSMwhQY"
                },
                {
                    title: "Walking on Sunshine",
                    artist: "Katrina and the Waves",
                    description: "Classic feel-good sunny song",
                    spotifyUrl: "https://open.spotify.com/track/05wIrZSwuaVWhcv5FfqeH0"
                }
            ],
            rainy: [
                {
                    title: "Drivers License",
                    artist: "Olivia Rodrigo",
                    description: "Perfect for reflective rainy moments",
                    spotifyUrl: "https://open.spotify.com/track/7lPN2DXiMsVn7XUKtOW1CS"
                },
                {
                    title: "Someone Like You",
                    artist: "Adele",
                    description: "Emotional ballad for rainy days",
                    spotifyUrl: "https://open.spotify.com/track/1zwMYTA5nlNjZxYrvBB2pV"
                },
                {
                    title: "Raindrops Keep Fallin' on My Head",
                    artist: "B.J. Thomas",
                    description: "Classic rainy day song",
                    spotifyUrl: "https://open.spotify.com/track/1WkMMavIMc4JZ8cfMmxHkI"
                },
                {
                    title: "The Sound of Silence",
                    artist: "Simon & Garfunkel",
                    description: "Contemplative track for quiet rain",
                    spotifyUrl: "https://open.spotify.com/track/7ku7Zb7Ht1xTJWNnxLIlGu"
                }
            ],
            snowy: [
                {
                    title: "Let It Snow! Let It Snow! Let It Snow!",
                    artist: "Dean Martin",
                    description: "Classic winter wonderland song",
                    spotifyUrl: "https://open.spotify.com/track/1HNE2PX70ztbEl6MLqHW7M"
                },
                {
                    title: "Winter Wonderland",
                    artist: "Tony Bennett",
                    description: "Perfect for snowy landscapes",
                    spotifyUrl: "https://open.spotify.com/track/2EjXfH91m7f8HiJN1yQg97"
                },
                {
                    title: "Snowman",
                    artist: "Sia",
                    description: "Modern winter ballad",
                    spotifyUrl: "https://open.spotify.com/track/0bYg9bo50gSsH3LtXe2SQn"
                },
                {
                    title: "Baby, It's Cold Outside",
                    artist: "Ella Fitzgerald & Louis Jordan",
                    description: "Cozy winter duet",
                    spotifyUrl: "https://open.spotify.com/track/3W3l8eZsqhKNbGxlAGGqWD"
                }
            ],
            stormy: [
                {
                    title: "Thunderstruck",
                    artist: "AC/DC",
                    description: "High energy for stormy weather",
                    spotifyUrl: "https://open.spotify.com/track/57bgtoPSgt236HzfBOd8kj"
                },
                {
                    title: "Riders on the Storm",
                    artist: "The Doors",
                    description: "Atmospheric storm anthem",
                    spotifyUrl: "https://open.spotify.com/track/14XWXWv5FoCbFzLksawpEe"
                },
                {
                    title: "Purple Rain",
                    artist: "Prince",
                    description: "Epic track for dramatic weather",
                    spotifyUrl: "https://open.spotify.com/track/4U45aEWtQhrm8A5mxPaFZ7"
                },
                {
                    title: "Storm",
                    artist: "Godspeed You! Black Emperor",
                    description: "Intense instrumental for storms",
                    spotifyUrl: "https://open.spotify.com/track/4W4wXjDzBqMKYexjqbXGh6"
                }
            ],
            cloudy: [
                {
                    title: "Cloudy",
                    artist: "Simon & Garfunkel",
                    description: "Mellow track for overcast days",
                    spotifyUrl: "https://open.spotify.com/track/6JV2JOEocMgcZxYSZelKcc"
                },
                {
                    title: "Mad World",
                    artist: "Gary Jules",
                    description: "Contemplative mood for gray skies",
                    spotifyUrl: "https://open.spotify.com/track/4Fau05gWqDLPANjjdBYzR8"
                },
                {
                    title: "Breathe Me",
                    artist: "Sia",
                    description: "Introspective for cloudy weather",
                    spotifyUrl: "https://open.spotify.com/track/7H0ya83CMmgFcOhw0UB6ow"
                },
                {
                    title: "The Night We Met",
                    artist: "Lord Huron",
                    description: "Nostalgic for overcast evenings",
                    spotifyUrl: "https://open.spotify.com/track/7qEHsqek33rTcFNT9PFqLf"
                }
            ]
        };

        const songs = songRecommendations[weatherType] || songRecommendations.cloudy;
        const songsGrid = document.getElementById('songsGrid');
        
        songsGrid.innerHTML = songs.map(song => `
            <a href="${song.spotifyUrl}" target="_blank" class="song-item">
                <h4><i class="fab fa-spotify"></i>${song.title}</h4>
                <p><strong>${song.artist}</strong></p>
                <p>${song.description}</p>
            </a>
        `).join('');
    }

    displayPlaceRecommendations(weatherType, temperature, isDay) {
        const placeRecommendations = {
            sunny: [
                {
                    name: "Central Park",
                    type: "Outdoor Recreation",
                    description: "Perfect for picnics and outdoor activities",
                    website: "https://www.centralparknyc.org/"
                },
                {
                    name: "Beach Resorts",
                    type: "Beach & Water",
                    description: "Enjoy the sun and water activities",
                    website: "https://www.booking.com/beach.html"
                },
                {
                    name: "Hiking Trails",
                    type: "Nature & Adventure",
                    description: "Explore nature trails and scenic views",
                    website: "https://www.alltrails.com/"
                },
                {
                    name: "Outdoor Markets",
                    type: "Shopping & Culture",
                    description: "Browse local markets and street food",
                    website: "https://www.tripadvisor.com/Attractions"
                }
            ],
            rainy: [
                {
                    name: "Museums",
                    type: "Culture & Arts",
                    description: "Explore art, history, and science indoors",
                    website: "https://www.museumfinder.org/"
                },
                {
                    name: "Cozy Cafes",
                    type: "Food & Drink",
                    description: "Warm up with coffee and good books",
                    website: "https://foursquare.com/explore?mode=url&near=coffee"
                },
                {
                    name: "Shopping Malls",
                    type: "Shopping & Entertainment",
                    description: "Indoor shopping and entertainment",
                    website: "https://www.simon.com/"
                },
                {
                    name: "Libraries",
                    type: "Education & Quiet",
                    description: "Perfect for reading and studying",
                    website: "https://www.publiclibraries.com/"
                }
            ],
            snowy: [
                {
                    name: "Ski Resorts",
                    type: "Winter Sports",
                    description: "Hit the slopes for skiing and snowboarding",
                    website: "https://www.snow.com/"
                },
                {
                    name: "Ice Skating Rinks",
                    type: "Winter Recreation",
                    description: "Enjoy ice skating with friends",
                    website: "https://www.iceskatingrinks.com/"
                },
                {
                    name: "Winter Markets",
                    type: "Seasonal Shopping",
                    description: "Browse holiday markets and crafts",
                    website: "https://www.christmasmarkets.com/"
                },
                {
                    name: "Hot Springs",
                    type: "Relaxation & Wellness",
                    description: "Warm up in natural hot springs",
                    website: "https://www.hotsprings.org/"
                }
            ],
            stormy: [
                {
                    name: "Movie Theaters",
                    type: "Entertainment",
                    description: "Catch the latest films indoors",
                    website: "https://www.fandango.com/"
                },
                {
                    name: "Bowling Alleys",
                    type: "Indoor Recreation",
                    description: "Fun indoor activity with friends",
                    website: "https://www.bowlingcenters.com/"
                },
                {
                    name: "Indoor Gaming Centers",
                    type: "Gaming & Entertainment",
                    description: "Video games and arcade fun",
                    website: "https://www.gameworks.com/"
                },
                {
                    name: "Spa & Wellness Centers",
                    type: "Relaxation",
                    description: "Relax and unwind during the storm",
                    website: "https://www.spafinder.com/"
                }
            ],
            cloudy: [
                {
                    name: "Art Galleries",
                    type: "Culture & Arts",
                    description: "Perfect lighting for viewing art",
                    website: "https://www.artgalleries.com/"
                },
                {
                    name: "Bookstores",
                    type: "Literature & Coffee",
                    description: "Browse books in cozy atmosphere",
                    website: "https://www.bookstores.com/"
                },
                {
                    name: "Photography Spots",
                    type: "Creative & Scenic",
                    description: "Great soft lighting for photos",
                    website: "https://www.photographyspots.com/"
                },
                {
                    name: "Wine Tasting",
                    type: "Food & Drink",
                    description: "Perfect ambiance for wine tasting",
                    website: "https://www.winetasting.com/"
                }
            ]
        };

        const places = placeRecommendations[weatherType] || placeRecommendations.cloudy;
        const placesGrid = document.getElementById('placesGrid');
        
        placesGrid.innerHTML = places.map(place => `
            <a href="${place.website}" target="_blank" class="place-item">
                <h4><i class="fas fa-external-link-alt"></i>${place.name}</h4>
                <p><strong>${place.type}</strong></p>
                <p>${place.description}</p>
            </a>
        `).join('');
    }
}

// Initialize the weather app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});