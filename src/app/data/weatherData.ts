import { WeatherData } from '../types/metro';

export const mumbaiWeather: WeatherData = {
  location: 'Mumbai, Maharashtra',
  temperature: 32,
  feelsLike: 36,
  humidity: 68,
  windSpeed: 14,
  condition: 'Partly Cloudy',
  conditionCode: 'partly-cloudy',
  visibility: 8.5,
  pressure: 1008,
  uvIndex: 8,
  forecast: [
    { day: 'Today', high: 34, low: 27, condition: 'Partly Cloudy', conditionCode: 'partly-cloudy' },
    { day: 'Fri', high: 35, low: 28, condition: 'Sunny', conditionCode: 'sunny' },
    { day: 'Sat', high: 33, low: 27, condition: 'Cloudy', conditionCode: 'cloudy' },
    { day: 'Sun', high: 31, low: 26, condition: 'Light Rain', conditionCode: 'rainy' },
    { day: 'Mon', high: 30, low: 25, condition: 'Rain', conditionCode: 'rainy' },
  ],
};

export const puneWeather: WeatherData = {
  location: 'Pune, Maharashtra',
  temperature: 28,
  feelsLike: 30,
  humidity: 52,
  windSpeed: 18,
  condition: 'Sunny',
  conditionCode: 'sunny',
  visibility: 12,
  pressure: 1012,
  uvIndex: 9,
  forecast: [
    { day: 'Today', high: 30, low: 20, condition: 'Sunny', conditionCode: 'sunny' },
    { day: 'Fri', high: 31, low: 21, condition: 'Sunny', conditionCode: 'sunny' },
    { day: 'Sat', high: 29, low: 20, condition: 'Partly Cloudy', conditionCode: 'partly-cloudy' },
    { day: 'Sun', high: 27, low: 19, condition: 'Cloudy', conditionCode: 'cloudy' },
    { day: 'Mon', high: 26, low: 18, condition: 'Light Rain', conditionCode: 'rainy' },
  ],
};

export const thaneWeather: WeatherData = {
  location: 'Thane, Maharashtra',
  temperature: 31,
  feelsLike: 35,
  humidity: 72,
  windSpeed: 12,
  condition: 'Cloudy',
  conditionCode: 'cloudy',
  visibility: 7,
  pressure: 1007,
  uvIndex: 6,
  forecast: [
    { day: 'Today', high: 33, low: 26, condition: 'Cloudy', conditionCode: 'cloudy' },
    { day: 'Fri', high: 34, low: 27, condition: 'Partly Cloudy', conditionCode: 'partly-cloudy' },
    { day: 'Sat', high: 32, low: 26, condition: 'Cloudy', conditionCode: 'cloudy' },
    { day: 'Sun', high: 30, low: 25, condition: 'Rain', conditionCode: 'rainy' },
    { day: 'Mon', high: 29, low: 24, condition: 'Heavy Rain', conditionCode: 'storm' },
  ],
};
