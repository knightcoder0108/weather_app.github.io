document.addEventListener('DOMContentLoaded', () => {
    const weatherElement = document.getElementById('weather');
    const mapElement = document.getElementById('map');
    const locationInput = document.getElementById('location-input');
    const searchButton = document.getElementById('search-button');
    let map;
    let marker;

    function showLoading(message) {
        weatherElement.innerHTML = `<div class="loading">${message}</div>`;
    }

    function showError(message) {
        weatherElement.innerHTML = `<div class="error">${message}</div>`;
    }

    function initializeMap(latitude, longitude) {
        const location = { lat: latitude, lng: longitude };
        if (!map) {
            map = new google.maps.Map(mapElement, {
                center: location,
                zoom: 15,
            });
            marker = new google.maps.Marker({
                position: location,
                map: map,
            });
        } else {
            map.setCenter(location);
            marker.setPosition(location);
        }
    }

    function fetchWeather(latitude, longitude) {
        const apiKey = '9f9623155f178086c93848dd96d1ad2b';
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    weatherElement.innerHTML = `
                        <p>Temperature: ${data.main.temp}°C</p>
                        <p>Weather: ${data.weather[0].description}</p>
                    `;
                } else {
                    showError('Failed to retrieve weather data.');
                }
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                showError('Error fetching weather data.');
            });
    }

    function handlePlaceSelect() {
        const autocomplete = new google.maps.places.Autocomplete(locationInput);
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const latitude = place.geometry.location.lat();
                const longitude = place.geometry.location.lng();
                initializeMap(latitude, longitude);
                fetchWeather(latitude, longitude);
            } else {
                showError('No details available for input: ' + place.name);
            }
        });
    }

    function getLocation() {
        if (navigator.geolocation) {
            showLoading('Fetching location...');
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    initializeMap(latitude, longitude);
                    fetchWeather(latitude, longitude);
                },
                error => {
                    showError('Failed to get location.');
                }
            );
        } else {
            showError('Geolocation is not supported by this browser.');
        }
    }

    searchButton.addEventListener('click', () => {
        const place = locationInput.value;
        if (place) {
            showLoading('Fetching location...');
            handlePlaceSelect();
        } else {
            showError('Please enter a location.');
        }
    });

    getLocation();
});
