import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import rainyWeather from "@/Weather/Rainy.png";
import sunnyWeather from "@/Weather/Sunny.png";
import normalWeather from "@/Weather/Normal.png";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Weather icon mapping based on temperature
export function getWeatherIcon(weatherCode: number, temperature: number): string {
  if (temperature <= 18) {
    return rainyWeather;
  } else if (temperature >= 30) {
    return sunnyWeather;
  } else {
    return normalWeather;
  }
}
