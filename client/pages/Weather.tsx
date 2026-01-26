import { useState } from "react";
import { Search, Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface DetailedWeather {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: "sunny" | "cloudy" | "rainy";
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  pressure: number;
  rainChance: number;
  rainTrajectory: string;
  uvIndex: number;
}

const locationData: Record<string, DetailedWeather[]> = {
  // Southern Region
  Maputo: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 27,
      low: 21,
      condition: "cloudy",
      humidity: 68,
      windSpeed: 13,
      windDirection: "E",
      visibility: 10,
      pressure: 1014,
      rainChance: 35,
      rainTrajectory: "Scattered showers possible",
      uvIndex: 7,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 28,
      low: 22,
      condition: "sunny",
      humidity: 60,
      windSpeed: 11,
      windDirection: "NE",
      visibility: 11,
      pressure: 1016,
      rainChance: 15,
      rainTrajectory: "Clear skies developing",
      uvIndex: 8,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 29,
      low: 23,
      condition: "sunny",
      humidity: 55,
      windSpeed: 10,
      windDirection: "N",
      visibility: 12,
      pressure: 1017,
      rainChance: 5,
      rainTrajectory: "No precipitation",
      uvIndex: 8,
    },
    {
      date: "2024-01-29",
      day: "Thu",
      high: 30,
      low: 24,
      condition: "sunny",
      humidity: 50,
      windSpeed: 8,
      windDirection: "NW",
      visibility: 12,
      pressure: 1018,
      rainChance: 0,
      rainTrajectory: "Perfect conditions",
      uvIndex: 9,
    },
    {
      date: "2024-01-30",
      day: "Fri",
      high: 31,
      low: 25,
      condition: "sunny",
      humidity: 48,
      windSpeed: 7,
      windDirection: "W",
      visibility: 12,
      pressure: 1019,
      rainChance: 0,
      rainTrajectory: "Continued sunshine",
      uvIndex: 9,
    },
  ],
  Inhambane: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 28,
      low: 22,
      condition: "rainy",
      humidity: 75,
      windSpeed: 15,
      windDirection: "SE",
      visibility: 8,
      pressure: 1010,
      rainChance: 85,
      rainTrajectory: "Moving NW, expected to clear by evening",
      uvIndex: 7,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 26,
      low: 20,
      condition: "rainy",
      humidity: 80,
      windSpeed: 18,
      windDirection: "SE",
      visibility: 6,
      pressure: 1008,
      rainChance: 90,
      rainTrajectory: "Continuing from south, heavy rainfall expected",
      uvIndex: 6,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 27,
      low: 21,
      condition: "cloudy",
      humidity: 65,
      windSpeed: 12,
      windDirection: "E",
      visibility: 10,
      pressure: 1012,
      rainChance: 40,
      rainTrajectory: "System moving away to the north",
      uvIndex: 6,
    },
    {
      date: "2024-01-29",
      day: "Thu",
      high: 29,
      low: 23,
      condition: "sunny",
      humidity: 55,
      windSpeed: 10,
      windDirection: "NE",
      visibility: 12,
      pressure: 1015,
      rainChance: 10,
      rainTrajectory: "Clear conditions expected",
      uvIndex: 8,
    },
    {
      date: "2024-01-30",
      day: "Fri",
      high: 30,
      low: 24,
      condition: "sunny",
      humidity: 50,
      windSpeed: 8,
      windDirection: "N",
      visibility: 12,
      pressure: 1017,
      rainChance: 5,
      rainTrajectory: "No precipitation expected",
      uvIndex: 9,
    },
  ],
  Gaza: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 31,
      low: 24,
      condition: "sunny",
      humidity: 60,
      windSpeed: 12,
      windDirection: "SW",
      visibility: 11,
      pressure: 1013,
      rainChance: 20,
      rainTrajectory: "No significant rain expected",
      uvIndex: 9,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 30,
      low: 23,
      condition: "cloudy",
      humidity: 65,
      windSpeed: 14,
      windDirection: "SW",
      visibility: 10,
      pressure: 1011,
      rainChance: 30,
      rainTrajectory: "Light rain possible in afternoon",
      uvIndex: 8,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 29,
      low: 22,
      condition: "cloudy",
      humidity: 70,
      windSpeed: 16,
      windDirection: "S",
      visibility: 9,
      pressure: 1009,
      rainChance: 45,
      rainTrajectory: "Rain system approaching from south",
      uvIndex: 7,
    },
    {
      date: "2024-01-29",
      day: "Thu",
      high: 28,
      low: 21,
      condition: "rainy",
      humidity: 78,
      windSpeed: 18,
      windDirection: "SE",
      visibility: 7,
      pressure: 1007,
      rainChance: 75,
      rainTrajectory: "Heavy rain expected, moving northward",
      uvIndex: 5,
    },
    {
      date: "2024-01-30",
      day: "Fri",
      high: 26,
      low: 20,
      condition: "rainy",
      humidity: 82,
      windSpeed: 20,
      windDirection: "SE",
      visibility: 5,
      pressure: 1005,
      rainChance: 88,
      rainTrajectory: "Continued rainfall throughout day",
      uvIndex: 4,
    },
  ],
  Sofala: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 26,
      low: 20,
      condition: "cloudy",
      humidity: 70,
      windSpeed: 14,
      windDirection: "E",
      visibility: 9,
      pressure: 1012,
      rainChance: 50,
      rainTrajectory: "Scattered showers possible",
      uvIndex: 6,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 25,
      low: 19,
      condition: "rainy",
      humidity: 75,
      windSpeed: 16,
      windDirection: "SE",
      visibility: 7,
      pressure: 1010,
      rainChance: 70,
      rainTrajectory: "Moderate rainfall expected",
      uvIndex: 5,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 27,
      low: 21,
      condition: "cloudy",
      humidity: 65,
      windSpeed: 12,
      windDirection: "E",
      visibility: 10,
      pressure: 1013,
      rainChance: 40,
      rainTrajectory: "Clearing in afternoon",
      uvIndex: 6,
    },
    {
      date: "2024-01-29",
      day: "Thu",
      high: 28,
      low: 22,
      condition: "sunny",
      humidity: 60,
      windSpeed: 10,
      windDirection: "NE",
      visibility: 11,
      pressure: 1015,
      rainChance: 15,
      rainTrajectory: "Mostly clear",
      uvIndex: 8,
    },
    {
      date: "2024-01-30",
      day: "Fri",
      high: 29,
      low: 23,
      condition: "sunny",
      humidity: 55,
      windSpeed: 9,
      windDirection: "N",
      visibility: 12,
      pressure: 1016,
      rainChance: 5,
      rainTrajectory: "Clear skies",
      uvIndex: 8,
    },
  ],
  // Central Region
  Beira: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 26,
      low: 20,
      condition: "rainy",
      humidity: 72,
      windSpeed: 16,
      windDirection: "SE",
      visibility: 8,
      pressure: 1011,
      rainChance: 65,
      rainTrajectory: "Rain from south, moderate to heavy",
      uvIndex: 5,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 25,
      low: 19,
      condition: "rainy",
      humidity: 78,
      windSpeed: 18,
      windDirection: "SE",
      visibility: 6,
      pressure: 1009,
      rainChance: 80,
      rainTrajectory: "Continuing rainfall",
      uvIndex: 4,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 27,
      low: 21,
      condition: "cloudy",
      humidity: 68,
      windSpeed: 14,
      windDirection: "E",
      visibility: 9,
      pressure: 1012,
      rainChance: 40,
      rainTrajectory: "Clearing in afternoon",
      uvIndex: 6,
    },
    {
      date: "2024-01-29",
      day: "Thu",
      high: 28,
      low: 22,
      condition: "sunny",
      humidity: 62,
      windSpeed: 12,
      windDirection: "NE",
      visibility: 11,
      pressure: 1015,
      rainChance: 15,
      rainTrajectory: "Mostly clear",
      uvIndex: 8,
    },
    {
      date: "2024-01-30",
      day: "Fri",
      high: 29,
      low: 23,
      condition: "sunny",
      humidity: 57,
      windSpeed: 11,
      windDirection: "N",
      visibility: 12,
      pressure: 1016,
      rainChance: 5,
      rainTrajectory: "Clear skies",
      uvIndex: 8,
    },
  ],
  Chimoio: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 24,
      low: 18,
      condition: "cloudy",
      humidity: 65,
      windSpeed: 12,
      windDirection: "E",
      visibility: 9,
      pressure: 1013,
      rainChance: 40,
      rainTrajectory: "Scattered showers possible",
      uvIndex: 6,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 25,
      low: 19,
      condition: "rainy",
      humidity: 72,
      windSpeed: 15,
      windDirection: "SE",
      visibility: 7,
      pressure: 1011,
      rainChance: 65,
      rainTrajectory: "Moderate rainfall",
      uvIndex: 5,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 26,
      low: 20,
      condition: "cloudy",
      humidity: 60,
      windSpeed: 11,
      windDirection: "E",
      visibility: 10,
      pressure: 1014,
      rainChance: 35,
      rainTrajectory: "Clearing",
      uvIndex: 6,
    },
    {
      date: "2024-01-29",
      day: "Thu",
      high: 27,
      low: 21,
      condition: "sunny",
      humidity: 55,
      windSpeed: 9,
      windDirection: "NE",
      visibility: 11,
      pressure: 1015,
      rainChance: 10,
      rainTrajectory: "Clear",
      uvIndex: 7,
    },
    {
      date: "2024-01-30",
      day: "Fri",
      high: 28,
      low: 22,
      condition: "sunny",
      humidity: 52,
      windSpeed: 8,
      windDirection: "N",
      visibility: 12,
      pressure: 1016,
      rainChance: 5,
      rainTrajectory: "Clear",
      uvIndex: 8,
    },
  ],
  Quelimane: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 25,
      low: 19,
      condition: "rainy",
      humidity: 75,
      windSpeed: 14,
      windDirection: "E",
      visibility: 8,
      pressure: 1011,
      rainChance: 70,
      rainTrajectory: "Heavy rainfall from east",
      uvIndex: 5,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 24,
      low: 18,
      condition: "rainy",
      humidity: 80,
      windSpeed: 16,
      windDirection: "SE",
      visibility: 6,
      pressure: 1009,
      rainChance: 85,
      rainTrajectory: "Continuing rain",
      uvIndex: 4,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 26,
      low: 20,
      condition: "cloudy",
      humidity: 70,
      windSpeed: 12,
      windDirection: "E",
      visibility: 9,
      pressure: 1012,
      rainChance: 45,
      rainTrajectory: "Clearing in afternoon",
      uvIndex: 6,
    },
    {
      date: "2024-01-29",
      day: "Thu",
      high: 27,
      low: 21,
      condition: "sunny",
      humidity: 65,
      windSpeed: 10,
      windDirection: "NE",
      visibility: 11,
      pressure: 1014,
      rainChance: 15,
      rainTrajectory: "Mostly clear",
      uvIndex: 7,
    },
    {
      date: "2024-01-30",
      day: "Fri",
      high: 28,
      low: 22,
      condition: "sunny",
      humidity: 60,
      windSpeed: 9,
      windDirection: "N",
      visibility: 12,
      pressure: 1015,
      rainChance: 5,
      rainTrajectory: "Clear",
      uvIndex: 8,
    },
  ],
  // Northern Region
  Nampula: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 26,
      low: 20,
      condition: "cloudy",
      humidity: 70,
      windSpeed: 13,
      windDirection: "E",
      visibility: 9,
      pressure: 1012,
      rainChance: 50,
      rainTrajectory: "Scattered showers",
      uvIndex: 6,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 25,
      low: 19,
      condition: "rainy",
      humidity: 75,
      windSpeed: 15,
      windDirection: "SE",
      visibility: 7,
      pressure: 1010,
      rainChance: 70,
      rainTrajectory: "Moderate rainfall",
      uvIndex: 5,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 27,
      low: 21,
      condition: "cloudy",
      humidity: 65,
      windSpeed: 12,
      windDirection: "E",
      visibility: 10,
      pressure: 1013,
      rainChance: 40,
      rainTrajectory: "Clearing",
      uvIndex: 6,
    },
    {
      date: "2024-01-29",
      day: "Thu",
      high: 28,
      low: 22,
      condition: "sunny",
      humidity: 60,
      windSpeed: 10,
      windDirection: "NE",
      visibility: 11,
      pressure: 1015,
      rainChance: 15,
      rainTrajectory: "Mostly clear",
      uvIndex: 8,
    },
    {
      date: "2024-01-30",
      day: "Fri",
      high: 29,
      low: 23,
      condition: "sunny",
      humidity: 55,
      windSpeed: 9,
      windDirection: "N",
      visibility: 12,
      pressure: 1016,
      rainChance: 5,
      rainTrajectory: "Clear",
      uvIndex: 8,
    },
  ],
  Tete: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 32,
      low: 25,
      condition: "sunny",
      humidity: 55,
      windSpeed: 10,
      windDirection: "W",
      visibility: 12,
      pressure: 1015,
      rainChance: 15,
      rainTrajectory: "No significant rain",
      uvIndex: 9,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 31,
      low: 24,
      condition: "sunny",
      humidity: 58,
      windSpeed: 11,
      windDirection: "SW",
      visibility: 11,
      pressure: 1013,
      rainChance: 20,
      rainTrajectory: "Mostly sunny",
      uvIndex: 9,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 30,
      low: 23,
      condition: "cloudy",
      humidity: 62,
      windSpeed: 13,
      windDirection: "S",
      visibility: 10,
      pressure: 1011,
      rainChance: 35,
      rainTrajectory: "Scattered showers",
      uvIndex: 7,
    },
    {
      date: "2024-01-29",
      day: "Thu",
      high: 29,
      low: 22,
      condition: "cloudy",
      humidity: 65,
      windSpeed: 14,
      windDirection: "SE",
      visibility: 9,
      pressure: 1009,
      rainChance: 45,
      rainTrajectory: "Rain expected",
      uvIndex: 6,
    },
    {
      date: "2024-01-30",
      day: "Fri",
      high: 28,
      low: 21,
      condition: "rainy",
      humidity: 70,
      windSpeed: 15,
      windDirection: "SE",
      visibility: 8,
      pressure: 1007,
      rainChance: 65,
      rainTrajectory: "Continuous rainfall",
      uvIndex: 5,
    },
  ],
  // Additional Cities
  Lichinga: [
    { date: "2024-01-26", day: "Today", high: 22, low: 16, condition: "cloudy", humidity: 60, windSpeed: 10, windDirection: "E", visibility: 10, pressure: 1015, rainChance: 30, rainTrajectory: "Light showers possible", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 23, low: 17, condition: "rainy", humidity: 65, windSpeed: 12, windDirection: "SE", visibility: 8, pressure: 1013, rainChance: 50, rainTrajectory: "Moderate rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 24, low: 18, condition: "cloudy", humidity: 58, windSpeed: 9, windDirection: "E", visibility: 10, pressure: 1016, rainChance: 25, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 25, low: 19, condition: "sunny", humidity: 53, windSpeed: 8, windDirection: "NE", visibility: 11, pressure: 1017, rainChance: 10, rainTrajectory: "Clear", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 26, low: 20, condition: "sunny", humidity: 50, windSpeed: 7, windDirection: "N", visibility: 12, pressure: 1018, rainChance: 5, rainTrajectory: "Clear", uvIndex: 7 },
  ],
  Nacala: [
    { date: "2024-01-26", day: "Today", high: 27, low: 21, condition: "cloudy", humidity: 68, windSpeed: 14, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 45, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 26, low: 20, condition: "rainy", humidity: 74, windSpeed: 16, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 65, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 28, low: 22, condition: "cloudy", humidity: 66, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1014, rainChance: 35, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 29, low: 23, condition: "sunny", humidity: 61, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1016, rainChance: 15, rainTrajectory: "Mostly clear", uvIndex: 8 },
    { date: "2024-01-30", day: "Fri", high: 30, low: 24, condition: "sunny", humidity: 56, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1017, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Pemba: [
    { date: "2024-01-26", day: "Today", high: 28, low: 22, condition: "cloudy", humidity: 70, windSpeed: 15, windDirection: "E", visibility: 9, pressure: 1011, rainChance: 50, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 27, low: 21, condition: "rainy", humidity: 76, windSpeed: 17, windDirection: "SE", visibility: 7, pressure: 1009, rainChance: 70, rainTrajectory: "Heavy rain expected", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 29, low: 23, condition: "cloudy", humidity: 68, windSpeed: 13, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 40, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 30, low: 24, condition: "sunny", humidity: 63, windSpeed: 11, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 15, rainTrajectory: "Mostly clear", uvIndex: 8 },
    { date: "2024-01-30", day: "Fri", high: 31, low: 25, condition: "sunny", humidity: 58, windSpeed: 10, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  "Xai-Xai": [
    { date: "2024-01-26", day: "Today", high: 29, low: 23, condition: "sunny", humidity: 62, windSpeed: 12, windDirection: "SW", visibility: 11, pressure: 1013, rainChance: 20, rainTrajectory: "No significant rain", uvIndex: 8 },
    { date: "2024-01-27", day: "Tomorrow", high: 28, low: 22, condition: "cloudy", humidity: 67, windSpeed: 14, windDirection: "SW", visibility: 10, pressure: 1011, rainChance: 30, rainTrajectory: "Light rain possible", uvIndex: 7 },
    { date: "2024-01-28", day: "Wed", high: 29, low: 22, condition: "cloudy", humidity: 70, windSpeed: 16, windDirection: "S", visibility: 9, pressure: 1009, rainChance: 45, rainTrajectory: "Rain approaching", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 21, condition: "rainy", humidity: 78, windSpeed: 18, windDirection: "SE", visibility: 7, pressure: 1007, rainChance: 75, rainTrajectory: "Heavy rain", uvIndex: 5 },
    { date: "2024-01-30", day: "Fri", high: 26, low: 20, condition: "rainy", humidity: 82, windSpeed: 20, windDirection: "SE", visibility: 5, pressure: 1005, rainChance: 88, rainTrajectory: "Continued rain", uvIndex: 4 },
  ],
  Mocuba: [
    { date: "2024-01-26", day: "Today", high: 25, low: 19, condition: "cloudy", humidity: 68, windSpeed: 12, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 45, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 24, low: 18, condition: "rainy", humidity: 74, windSpeed: 14, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 65, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 66, windSpeed: 11, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 35, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 61, windSpeed: 9, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 56, windSpeed: 8, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Moatize: [
    { date: "2024-01-26", day: "Today", high: 31, low: 24, condition: "sunny", humidity: 55, windSpeed: 10, windDirection: "W", visibility: 12, pressure: 1015, rainChance: 15, rainTrajectory: "No significant rain", uvIndex: 9 },
    { date: "2024-01-27", day: "Tomorrow", high: 30, low: 23, condition: "sunny", humidity: 58, windSpeed: 11, windDirection: "SW", visibility: 11, pressure: 1013, rainChance: 20, rainTrajectory: "Mostly sunny", uvIndex: 8 },
    { date: "2024-01-28", day: "Wed", high: 29, low: 22, condition: "cloudy", humidity: 62, windSpeed: 13, windDirection: "S", visibility: 10, pressure: 1011, rainChance: 35, rainTrajectory: "Scattered showers", uvIndex: 7 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 21, condition: "cloudy", humidity: 65, windSpeed: 14, windDirection: "SE", visibility: 9, pressure: 1009, rainChance: 45, rainTrajectory: "Rain expected", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 27, low: 20, condition: "rainy", humidity: 70, windSpeed: 15, windDirection: "SE", visibility: 8, pressure: 1007, rainChance: 65, rainTrajectory: "Continuous rainfall", uvIndex: 5 },
  ],
  Milange: [
    { date: "2024-01-26", day: "Today", high: 24, low: 18, condition: "cloudy", humidity: 65, windSpeed: 11, windDirection: "E", visibility: 10, pressure: 1014, rainChance: 35, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 72, windSpeed: 14, windDirection: "SE", visibility: 7, pressure: 1011, rainChance: 60, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 60, windSpeed: 10, windDirection: "E", visibility: 10, pressure: 1015, rainChance: 30, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 55, windSpeed: 8, windDirection: "NE", visibility: 11, pressure: 1016, rainChance: 10, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 52, windSpeed: 7, windDirection: "N", visibility: 12, pressure: 1017, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Gurue: [
    { date: "2024-01-26", day: "Today", high: 23, low: 17, condition: "cloudy", humidity: 68, windSpeed: 11, windDirection: "E", visibility: 9, pressure: 1013, rainChance: 40, rainTrajectory: "Scattered showers", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 24, low: 18, condition: "rainy", humidity: 74, windSpeed: 13, windDirection: "SE", visibility: 7, pressure: 1011, rainChance: 65, rainTrajectory: "Moderate rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 25, low: 19, condition: "cloudy", humidity: 66, windSpeed: 10, windDirection: "E", visibility: 10, pressure: 1014, rainChance: 35, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 26, low: 20, condition: "sunny", humidity: 61, windSpeed: 8, windDirection: "NE", visibility: 11, pressure: 1016, rainChance: 15, rainTrajectory: "Clear", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 27, low: 21, condition: "sunny", humidity: 56, windSpeed: 7, windDirection: "N", visibility: 12, pressure: 1017, rainChance: 5, rainTrajectory: "Clear", uvIndex: 7 },
  ],
  Morrumbala: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "cloudy", humidity: 70, windSpeed: 13, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 50, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 76, windSpeed: 15, windDirection: "SE", visibility: 7, pressure: 1010, rainTrajectory: "Moderate rain", rainChance: 70, uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 68, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 40, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 63, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 58, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Montepuez: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "cloudy", humidity: 68, windSpeed: 13, windDirection: "E", visibility: 10, pressure: 1012, rainChance: 45, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 74, windSpeed: 15, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 65, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 66, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 35, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 61, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 56, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Catandica: [
    { date: "2024-01-26", day: "Today", high: 25, low: 19, condition: "cloudy", humidity: 65, windSpeed: 11, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 35, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 26, low: 20, condition: "rainy", humidity: 71, windSpeed: 13, windDirection: "SE", visibility: 8, pressure: 1011, rainChance: 55, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 63, windSpeed: 10, windDirection: "E", visibility: 10, pressure: 1014, rainChance: 30, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 58, windSpeed: 8, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 10, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 54, windSpeed: 7, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Dondo: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "rainy", humidity: 72, windSpeed: 15, windDirection: "SE", visibility: 8, pressure: 1011, rainChance: 65, rainTrajectory: "Moderate to heavy rain", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 78, windSpeed: 17, windDirection: "SE", visibility: 6, pressure: 1009, rainChance: 80, rainTrajectory: "Continuing rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 70, windSpeed: 13, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 45, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 65, windSpeed: 11, windDirection: "NE", visibility: 11, pressure: 1014, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 60, windSpeed: 10, windDirection: "N", visibility: 12, pressure: 1015, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Marromeu: [
    { date: "2024-01-26", day: "Today", high: 25, low: 19, condition: "rainy", humidity: 74, windSpeed: 14, windDirection: "E", visibility: 8, pressure: 1011, rainChance: 70, rainTrajectory: "Heavy rainfall", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 24, low: 18, condition: "rainy", humidity: 80, windSpeed: 16, windDirection: "SE", visibility: 6, pressure: 1009, rainChance: 85, rainTrajectory: "Continuing rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 72, windSpeed: 12, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 50, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 67, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1014, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 62, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1015, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Cuamba: [
    { date: "2024-01-26", day: "Today", high: 23, low: 17, condition: "cloudy", humidity: 62, windSpeed: 10, windDirection: "E", visibility: 10, pressure: 1014, rainChance: 30, rainTrajectory: "Light showers possible", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 24, low: 18, condition: "rainy", humidity: 68, windSpeed: 12, windDirection: "SE", visibility: 8, pressure: 1012, rainChance: 55, rainTrajectory: "Moderate rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 25, low: 19, condition: "cloudy", humidity: 60, windSpeed: 9, windDirection: "E", visibility: 10, pressure: 1015, rainChance: 25, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 26, low: 20, condition: "sunny", humidity: 55, windSpeed: 7, windDirection: "NE", visibility: 11, pressure: 1016, rainChance: 10, rainTrajectory: "Clear", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 27, low: 21, condition: "sunny", humidity: 52, windSpeed: 6, windDirection: "N", visibility: 12, pressure: 1017, rainChance: 5, rainTrajectory: "Clear", uvIndex: 7 },
  ],
  Maxixe: [
    { date: "2024-01-26", day: "Today", high: 28, low: 22, condition: "sunny", humidity: 64, windSpeed: 13, windDirection: "SW", visibility: 11, pressure: 1013, rainChance: 20, rainTrajectory: "No significant rain", uvIndex: 8 },
    { date: "2024-01-27", day: "Tomorrow", high: 27, low: 21, condition: "cloudy", humidity: 69, windSpeed: 15, windDirection: "SW", visibility: 10, pressure: 1011, rainChance: 30, rainTrajectory: "Light rain possible", uvIndex: 7 },
    { date: "2024-01-28", day: "Wed", high: 28, low: 22, condition: "cloudy", humidity: 72, windSpeed: 17, windDirection: "S", visibility: 9, pressure: 1009, rainChance: 45, rainTrajectory: "Rain approaching", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "rainy", humidity: 80, windSpeed: 19, windDirection: "SE", visibility: 7, pressure: 1007, rainChance: 80, rainTrajectory: "Heavy rain", uvIndex: 4 },
    { date: "2024-01-30", day: "Fri", high: 25, low: 20, condition: "rainy", humidity: 84, windSpeed: 21, windDirection: "SE", visibility: 5, pressure: 1005, rainChance: 90, rainTrajectory: "Continued rain", uvIndex: 3 },
  ],
  Chibuto: [
    { date: "2024-01-26", day: "Today", high: 30, low: 24, condition: "sunny", humidity: 60, windSpeed: 12, windDirection: "SW", visibility: 11, pressure: 1013, rainChance: 15, rainTrajectory: "No significant rain", uvIndex: 8 },
    { date: "2024-01-27", day: "Tomorrow", high: 29, low: 23, condition: "cloudy", humidity: 65, windSpeed: 14, windDirection: "SW", visibility: 10, pressure: 1011, rainChance: 25, rainTrajectory: "Light rain possible", uvIndex: 7 },
    { date: "2024-01-28", day: "Wed", high: 28, low: 22, condition: "cloudy", humidity: 68, windSpeed: 15, windDirection: "S", visibility: 9, pressure: 1009, rainChance: 40, rainTrajectory: "Rain approaching", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "rainy", humidity: 76, windSpeed: 17, windDirection: "SE", visibility: 7, pressure: 1007, rainChance: 70, rainTrajectory: "Heavy rain", uvIndex: 5 },
    { date: "2024-01-30", day: "Fri", high: 25, low: 20, condition: "rainy", humidity: 80, windSpeed: 19, windDirection: "SE", visibility: 5, pressure: 1005, rainChance: 85, rainTrajectory: "Continued rain", uvIndex: 4 },
  ],
  Nhamatanda: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "rainy", humidity: 73, windSpeed: 14, windDirection: "SE", visibility: 8, pressure: 1011, rainChance: 65, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 79, windSpeed: 16, windDirection: "SE", visibility: 6, pressure: 1009, rainChance: 80, rainTrajectory: "Continuing rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 71, windSpeed: 13, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 45, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 66, windSpeed: 11, windDirection: "NE", visibility: 11, pressure: 1014, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 61, windSpeed: 10, windDirection: "N", visibility: 12, pressure: 1015, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Mandimba: [
    { date: "2024-01-26", day: "Today", high: 22, low: 16, condition: "cloudy", humidity: 61, windSpeed: 9, windDirection: "E", visibility: 10, pressure: 1015, rainChance: 28, rainTrajectory: "Light showers", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 23, low: 17, condition: "rainy", humidity: 66, windSpeed: 11, windDirection: "SE", visibility: 8, pressure: 1013, rainChance: 50, rainTrajectory: "Moderate rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 24, low: 18, condition: "cloudy", humidity: 59, windSpeed: 8, windDirection: "E", visibility: 10, pressure: 1016, rainChance: 22, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 25, low: 19, condition: "sunny", humidity: 54, windSpeed: 7, windDirection: "NE", visibility: 11, pressure: 1017, rainChance: 8, rainTrajectory: "Clear", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 26, low: 20, condition: "sunny", humidity: 51, windSpeed: 6, windDirection: "N", visibility: 12, pressure: 1018, rainChance: 3, rainTrajectory: "Clear", uvIndex: 7 },
  ],
  Massinga: [
    { date: "2024-01-26", day: "Today", high: 29, low: 23, condition: "sunny", humidity: 61, windSpeed: 12, windDirection: "SW", visibility: 11, pressure: 1013, rainChance: 18, rainTrajectory: "No significant rain", uvIndex: 8 },
    { date: "2024-01-27", day: "Tomorrow", high: 28, low: 22, condition: "cloudy", humidity: 66, windSpeed: 14, windDirection: "SW", visibility: 10, pressure: 1011, rainChance: 28, rainTrajectory: "Light rain possible", uvIndex: 7 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 69, windSpeed: 15, windDirection: "S", visibility: 9, pressure: 1009, rainChance: 42, rainTrajectory: "Rain approaching", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 26, low: 20, condition: "rainy", humidity: 77, windSpeed: 17, windDirection: "SE", visibility: 7, pressure: 1007, rainChance: 72, rainTrajectory: "Heavy rain", uvIndex: 5 },
    { date: "2024-01-30", day: "Fri", high: 24, low: 19, condition: "rainy", humidity: 81, windSpeed: 19, windDirection: "SE", visibility: 5, pressure: 1005, rainChance: 87, rainTrajectory: "Continued rain", uvIndex: 4 },
  ],
  Vilanculos: [
    { date: "2024-01-26", day: "Today", high: 28, low: 22, condition: "sunny", humidity: 63, windSpeed: 12, windDirection: "SW", visibility: 11, pressure: 1013, rainChance: 20, rainTrajectory: "No significant rain", uvIndex: 8 },
    { date: "2024-01-27", day: "Tomorrow", high: 27, low: 21, condition: "cloudy", humidity: 68, windSpeed: 14, windDirection: "SW", visibility: 10, pressure: 1011, rainChance: 32, rainTrajectory: "Light rain possible", uvIndex: 7 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 71, windSpeed: 16, windDirection: "S", visibility: 9, pressure: 1009, rainChance: 48, rainTrajectory: "Rain approaching", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 25, low: 19, condition: "rainy", humidity: 79, windSpeed: 18, windDirection: "SE", visibility: 7, pressure: 1007, rainChance: 78, rainTrajectory: "Heavy rain", uvIndex: 4 },
    { date: "2024-01-30", day: "Fri", high: 23, low: 18, condition: "rainy", humidity: 83, windSpeed: 20, windDirection: "SE", visibility: 5, pressure: 1005, rainChance: 92, rainTrajectory: "Continued rain", uvIndex: 3 },
  ],
  Zóbue: [
    { date: "2024-01-26", day: "Today", high: 20, low: 14, condition: "cloudy", humidity: 58, windSpeed: 8, windDirection: "E", visibility: 10, pressure: 1016, rainChance: 25, rainTrajectory: "Light showers", uvIndex: 4 },
    { date: "2024-01-27", day: "Tomorrow", high: 21, low: 15, condition: "rainy", humidity: 63, windSpeed: 10, windDirection: "SE", visibility: 8, pressure: 1014, rainChance: 48, rainTrajectory: "Moderate rain", uvIndex: 3 },
    { date: "2024-01-28", day: "Wed", high: 22, low: 16, condition: "cloudy", humidity: 56, windSpeed: 7, windDirection: "E", visibility: 10, pressure: 1017, rainChance: 20, rainTrajectory: "Clearing", uvIndex: 4 },
    { date: "2024-01-29", day: "Thu", high: 23, low: 17, condition: "sunny", humidity: 51, windSpeed: 6, windDirection: "NE", visibility: 11, pressure: 1018, rainChance: 7, rainTrajectory: "Clear", uvIndex: 5 },
    { date: "2024-01-30", day: "Fri", high: 24, low: 18, condition: "sunny", humidity: 48, windSpeed: 5, windDirection: "N", visibility: 12, pressure: 1019, rainChance: 2, rainTrajectory: "Clear", uvIndex: 6 },
  ],
  Nicoadala: [
    { date: "2024-01-26", day: "Today", high: 25, low: 19, condition: "cloudy", humidity: 69, windSpeed: 12, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 48, rainTrajectory: "Scattered showers", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 24, low: 18, condition: "rainy", humidity: 75, windSpeed: 14, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 68, rainTrajectory: "Moderate rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 67, windSpeed: 11, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 38, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 62, windSpeed: 9, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 12, rainTrajectory: "Clear", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 57, windSpeed: 8, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 7 },
  ],
  Monapo: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "cloudy", humidity: 69, windSpeed: 13, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 48, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 75, windSpeed: 15, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 68, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 67, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 38, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 62, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 12, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 57, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Maganja: [
    { date: "2024-01-26", day: "Today", high: 25, low: 19, condition: "cloudy", humidity: 68, windSpeed: 11, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 45, rainTrajectory: "Scattered showers", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 24, low: 18, condition: "rainy", humidity: 74, windSpeed: 13, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 65, rainTrajectory: "Moderate rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 66, windSpeed: 10, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 35, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 61, windSpeed: 8, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 10, rainTrajectory: "Clear", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 56, windSpeed: 7, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 7 },
  ],
  Caia: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "cloudy", humidity: 70, windSpeed: 13, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 50, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 76, windSpeed: 15, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 70, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 68, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 40, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 63, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 58, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  "Mocímboa da Praia": [
    { date: "2024-01-26", day: "Today", high: 28, low: 22, condition: "cloudy", humidity: 71, windSpeed: 15, windDirection: "E", visibility: 9, pressure: 1011, rainChance: 52, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 27, low: 21, condition: "rainy", humidity: 77, windSpeed: 17, windDirection: "SE", visibility: 7, pressure: 1009, rainChance: 72, rainTrajectory: "Heavy rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 29, low: 23, condition: "cloudy", humidity: 69, windSpeed: 14, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 42, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 30, low: 24, condition: "sunny", humidity: 64, windSpeed: 12, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 15, rainTrajectory: "Clear", uvIndex: 8 },
    { date: "2024-01-30", day: "Fri", high: 31, low: 25, condition: "sunny", humidity: 59, windSpeed: 11, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Mopeia: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "cloudy", humidity: 71, windSpeed: 14, windDirection: "E", visibility: 8, pressure: 1011, rainChance: 55, rainTrajectory: "Scattered showers", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 77, windSpeed: 16, windDirection: "SE", visibility: 6, pressure: 1009, rainChance: 75, rainTrajectory: "Heavy rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 69, windSpeed: 13, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 45, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 64, windSpeed: 11, windDirection: "NE", visibility: 11, pressure: 1014, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 59, windSpeed: 10, windDirection: "N", visibility: 12, pressure: 1015, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Muala: [
    { date: "2024-01-26", day: "Today", high: 28, low: 22, condition: "sunny", humidity: 62, windSpeed: 12, windDirection: "SW", visibility: 11, pressure: 1013, rainChance: 18, rainTrajectory: "No significant rain", uvIndex: 8 },
    { date: "2024-01-27", day: "Tomorrow", high: 27, low: 21, condition: "cloudy", humidity: 67, windSpeed: 14, windDirection: "SW", visibility: 10, pressure: 1011, rainChance: 28, rainTrajectory: "Light rain possible", uvIndex: 7 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 70, windSpeed: 15, windDirection: "S", visibility: 9, pressure: 1009, rainChance: 44, rainTrajectory: "Rain approaching", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 25, low: 19, condition: "rainy", humidity: 78, windSpeed: 17, windDirection: "SE", visibility: 7, pressure: 1007, rainChance: 74, rainTrajectory: "Heavy rain", uvIndex: 5 },
    { date: "2024-01-30", day: "Fri", high: 23, low: 18, condition: "rainy", humidity: 82, windSpeed: 19, windDirection: "SE", visibility: 5, pressure: 1005, rainChance: 89, rainTrajectory: "Continued rain", uvIndex: 4 },
  ],
  "Chiure-Sede": [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "cloudy", humidity: 69, windSpeed: 13, windDirection: "E", visibility: 10, pressure: 1012, rainChance: 46, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 75, windSpeed: 15, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 66, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 67, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 36, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 62, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 13, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 57, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Namialo: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "cloudy", humidity: 68, windSpeed: 13, windDirection: "E", visibility: 10, pressure: 1012, rainChance: 44, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 74, windSpeed: 15, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 64, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 66, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 34, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 61, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 11, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 56, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Gondola: [
    { date: "2024-01-26", day: "Today", high: 24, low: 18, condition: "cloudy", humidity: 65, windSpeed: 11, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 35, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 71, windSpeed: 13, windDirection: "SE", visibility: 8, pressure: 1011, rainChance: 55, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 63, windSpeed: 10, windDirection: "E", visibility: 10, pressure: 1014, rainChance: 30, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 58, windSpeed: 8, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 10, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 54, windSpeed: 7, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Moma: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "cloudy", humidity: 68, windSpeed: 13, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 45, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 74, windSpeed: 15, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 65, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 66, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 35, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 61, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 56, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Pebane: [
    { date: "2024-01-26", day: "Today", high: 25, low: 19, condition: "rainy", humidity: 73, windSpeed: 14, windDirection: "E", visibility: 8, pressure: 1011, rainChance: 68, rainTrajectory: "Heavy rainfall", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 24, low: 18, condition: "rainy", humidity: 79, windSpeed: 16, windDirection: "SE", visibility: 6, pressure: 1009, rainChance: 83, rainTrajectory: "Continuing rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 71, windSpeed: 12, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 48, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 66, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1014, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 61, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1015, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Nametil: [
    { date: "2024-01-26", day: "Today", high: 25, low: 19, condition: "cloudy", humidity: 69, windSpeed: 12, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 48, rainTrajectory: "Scattered showers", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 24, low: 18, condition: "rainy", humidity: 75, windSpeed: 14, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 68, rainTrajectory: "Moderate rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 67, windSpeed: 11, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 38, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 62, windSpeed: 9, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 12, rainTrajectory: "Clear", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 57, windSpeed: 8, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 7 },
  ],
  Namacurra: [
    { date: "2024-01-26", day: "Today", high: 26, low: 20, condition: "cloudy", humidity: 70, windSpeed: 13, windDirection: "E", visibility: 9, pressure: 1012, rainChance: 50, rainTrajectory: "Scattered showers", uvIndex: 6 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 76, windSpeed: 15, windDirection: "SE", visibility: 7, pressure: 1010, rainChance: 70, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 68, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 40, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 63, windSpeed: 10, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 15, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 58, windSpeed: 9, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  "Alto Molócue": [
    { date: "2024-01-26", day: "Today", high: 24, low: 18, condition: "cloudy", humidity: 66, windSpeed: 11, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 38, rainTrajectory: "Scattered showers", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 72, windSpeed: 13, windDirection: "SE", visibility: 8, pressure: 1011, rainChance: 58, rainTrajectory: "Moderate rain", uvIndex: 4 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 64, windSpeed: 10, windDirection: "E", visibility: 10, pressure: 1014, rainChance: 32, rainTrajectory: "Clearing", uvIndex: 5 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 59, windSpeed: 8, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 12, rainTrajectory: "Clear", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 55, windSpeed: 7, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 7 },
  ],
  Chókwè: [
    { date: "2024-01-26", day: "Today", high: 31, low: 25, condition: "sunny", humidity: 58, windSpeed: 11, windDirection: "SW", visibility: 11, pressure: 1013, rainChance: 12, rainTrajectory: "No significant rain", uvIndex: 9 },
    { date: "2024-01-27", day: "Tomorrow", high: 30, low: 24, condition: "cloudy", humidity: 63, windSpeed: 13, windDirection: "SW", visibility: 10, pressure: 1011, rainChance: 22, rainTrajectory: "Light rain possible", uvIndex: 8 },
    { date: "2024-01-28", day: "Wed", high: 29, low: 23, condition: "cloudy", humidity: 66, windSpeed: 14, windDirection: "S", visibility: 9, pressure: 1009, rainChance: 38, rainTrajectory: "Rain approaching", uvIndex: 7 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "rainy", humidity: 74, windSpeed: 16, windDirection: "SE", visibility: 7, pressure: 1007, rainChance: 68, rainTrajectory: "Heavy rain", uvIndex: 5 },
    { date: "2024-01-30", day: "Fri", high: 26, low: 21, condition: "rainy", humidity: 78, windSpeed: 18, windDirection: "SE", visibility: 5, pressure: 1005, rainChance: 83, rainTrajectory: "Continued rain", uvIndex: 4 },
  ],
  Gorongosa: [
    { date: "2024-01-26", day: "Today", high: 25, low: 19, condition: "cloudy", humidity: 67, windSpeed: 12, windDirection: "E", visibility: 10, pressure: 1013, rainChance: 40, rainTrajectory: "Scattered showers", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 26, low: 20, condition: "rainy", humidity: 73, windSpeed: 14, windDirection: "SE", visibility: 8, pressure: 1011, rainChance: 60, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 27, low: 21, condition: "cloudy", humidity: 65, windSpeed: 11, windDirection: "E", visibility: 10, pressure: 1014, rainChance: 32, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 28, low: 22, condition: "sunny", humidity: 60, windSpeed: 9, windDirection: "NE", visibility: 11, pressure: 1015, rainChance: 11, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 29, low: 23, condition: "sunny", humidity: 55, windSpeed: 8, windDirection: "N", visibility: 12, pressure: 1016, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  Manica: [
    { date: "2024-01-26", day: "Today", high: 24, low: 18, condition: "cloudy", humidity: 64, windSpeed: 11, windDirection: "E", visibility: 10, pressure: 1014, rainChance: 33, rainTrajectory: "Scattered showers", uvIndex: 5 },
    { date: "2024-01-27", day: "Tomorrow", high: 25, low: 19, condition: "rainy", humidity: 70, windSpeed: 13, windDirection: "SE", visibility: 8, pressure: 1012, rainChance: 53, rainTrajectory: "Moderate rain", uvIndex: 5 },
    { date: "2024-01-28", day: "Wed", high: 26, low: 20, condition: "cloudy", humidity: 62, windSpeed: 10, windDirection: "E", visibility: 10, pressure: 1015, rainChance: 28, rainTrajectory: "Clearing", uvIndex: 6 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "sunny", humidity: 57, windSpeed: 8, windDirection: "NE", visibility: 11, pressure: 1016, rainChance: 10, rainTrajectory: "Clear", uvIndex: 7 },
    { date: "2024-01-30", day: "Fri", high: 28, low: 22, condition: "sunny", humidity: 53, windSpeed: 7, windDirection: "N", visibility: 12, pressure: 1017, rainChance: 5, rainTrajectory: "Clear", uvIndex: 8 },
  ],
  "Insaca (Mecanhelas)": [
    { date: "2024-01-26", day: "Today", high: 21, low: 15, condition: "cloudy", humidity: 59, windSpeed: 9, windDirection: "E", visibility: 10, pressure: 1016, rainChance: 26, rainTrajectory: "Light showers", uvIndex: 4 },
    { date: "2024-01-27", day: "Tomorrow", high: 22, low: 16, condition: "rainy", humidity: 64, windSpeed: 11, windDirection: "SE", visibility: 8, pressure: 1014, rainChance: 46, rainTrajectory: "Moderate rain", uvIndex: 3 },
    { date: "2024-01-28", day: "Wed", high: 23, low: 17, condition: "cloudy", humidity: 57, windSpeed: 8, windDirection: "E", visibility: 10, pressure: 1017, rainChance: 21, rainTrajectory: "Clearing", uvIndex: 4 },
    { date: "2024-01-29", day: "Thu", high: 24, low: 18, condition: "sunny", humidity: 52, windSpeed: 7, windDirection: "NE", visibility: 11, pressure: 1018, rainChance: 8, rainTrajectory: "Clear", uvIndex: 5 },
    { date: "2024-01-30", day: "Fri", high: 25, low: 19, condition: "sunny", humidity: 49, windSpeed: 6, windDirection: "N", visibility: 12, pressure: 1019, rainChance: 3, rainTrajectory: "Clear", uvIndex: 6 },
  ],
  Miézi: [
    { date: "2024-01-26", day: "Today", high: 30, low: 24, condition: "sunny", humidity: 56, windSpeed: 11, windDirection: "W", visibility: 12, pressure: 1015, rainChance: 16, rainTrajectory: "No significant rain", uvIndex: 9 },
    { date: "2024-01-27", day: "Tomorrow", high: 29, low: 23, condition: "sunny", humidity: 59, windSpeed: 12, windDirection: "SW", visibility: 11, pressure: 1013, rainChance: 21, rainTrajectory: "Mostly sunny", uvIndex: 8 },
    { date: "2024-01-28", day: "Wed", high: 28, low: 22, condition: "cloudy", humidity: 63, windSpeed: 14, windDirection: "S", visibility: 10, pressure: 1011, rainChance: 36, rainTrajectory: "Scattered showers", uvIndex: 7 },
    { date: "2024-01-29", day: "Thu", high: 27, low: 21, condition: "cloudy", humidity: 66, windSpeed: 15, windDirection: "SE", visibility: 9, pressure: 1009, rainChance: 46, rainTrajectory: "Rain expected", uvIndex: 6 },
    { date: "2024-01-30", day: "Fri", high: 26, low: 20, condition: "rainy", humidity: 71, windSpeed: 16, windDirection: "SE", visibility: 8, pressure: 1007, rainChance: 66, rainTrajectory: "Continuous rainfall", uvIndex: 5 },
  ],
};

export default function Weather() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState("Maputo");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allLocations = Object.keys(locationData);
  const filteredLocations = allLocations.filter((location) =>
    location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const weatherData = locationData[selectedRegion] || locationData.Inhambane;
  const todayWeather = weatherData[0];

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun size={48} className="text-yellow-500" />;
      case "cloudy":
        return <Cloud size={48} className="text-slate-400" />;
      case "rainy":
        return <CloudRain size={48} className="text-blue-500" />;
      default:
        return <Sun size={48} className="text-yellow-500" />;
    }
  };

  const handleLocationSelect = (location: string) => {
    setSelectedRegion(location);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen -mx-4 -my-8">
        {/* Header Section - Outside flex */}
        <div className="px-4 py-8 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Weather Forecast</h1>
              <p className="text-slate-600 mt-1">Detailed weather for Mozambique regions</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by city, region, or district..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Search Suggestions */}
            {showSuggestions && searchTerm && filteredLocations.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {filteredLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    <p className="font-medium text-slate-900">{location}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Flex layout with sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Fixed Left Sidebar */}
          <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col gap-4 p-4">
            {/* Region Selection Buttons */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Regions</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(locationData).map((region) => (
                  <button
                    key={region}
                    onClick={() => handleLocationSelect(region)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedRegion === region
                        ? "bg-primary text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Region Display */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
              <p className="text-sm opacity-90 mb-2">Currently viewing:</p>
              <h2 className="text-3xl font-bold">{selectedRegion}</h2>
            </div>

            {/* Today's Weather Details */}
            {todayWeather && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-4">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    {getWeatherIcon(todayWeather.condition)}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{todayWeather.day}</h3>
                  <p className="text-sm text-slate-600 mt-1">{todayWeather.date}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-slate-900">{todayWeather.high}°C</p>
                    <p className="text-sm text-slate-600">Low: {todayWeather.low}°C</p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-600 uppercase">Condition</p>
                      <p className="font-semibold text-slate-900 capitalize mt-1">{todayWeather.condition}</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-600 uppercase">Rain Chance</p>
                      <p className="font-semibold text-slate-900 mt-1">{todayWeather.rainChance}%</p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-600 uppercase">Humidity</p>
                      <p className="font-semibold text-slate-900 mt-1">{todayWeather.humidity}%</p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-600 uppercase">Wind</p>
                      <p className="font-semibold text-slate-900 mt-1">{todayWeather.windSpeed} km/h {todayWeather.windDirection}</p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-600 uppercase">📍 Rain Trajectory</p>
                      <p className="text-sm text-slate-800 mt-1 leading-relaxed">{todayWeather.rainTrajectory}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Weather Forecast Cards */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="space-y-4 max-w-4xl mx-auto pb-8">
              {weatherData.map((weather, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{weather.day}</h3>
                      <p className="text-sm text-slate-600">{weather.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(weather.condition)}
                      <div className="text-right">
                        <p className="text-3xl font-bold text-slate-900">{weather.high}°C</p>
                        <p className="text-sm text-slate-600">{weather.low}°C low</p>
                      </div>
                    </div>
                  </div>

                  {/* Main Details */}
                  <div className="px-6 py-6">
                    {/* Condition and Rain Trajectory */}
                    <div className="mb-6 pb-6 border-b border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-2">
                            Condition
                          </p>
                          <p className="text-lg font-semibold text-slate-900 capitalize">
                            {weather.condition}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-2">
                            Rain Probability
                          </p>
                          <p className="text-lg font-semibold text-slate-900">{weather.rainChance}%</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-2">
                          📍 Rain Trajectory
                        </p>
                        <p className="text-base text-slate-800 leading-relaxed">
                          {weather.rainTrajectory}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Humidity */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets size={18} className="text-blue-600" />
                          <p className="text-xs font-medium text-slate-600 uppercase">Humidity</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{weather.humidity}%</p>
                      </div>

                      {/* Wind */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind size={18} className="text-green-600" />
                          <p className="text-xs font-medium text-slate-600 uppercase">Wind</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{weather.windSpeed} km/h</p>
                        <p className="text-xs text-slate-600 mt-1">{weather.windDirection}</p>
                      </div>

                      {/* Visibility */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye size={18} className="text-purple-600" />
                          <p className="text-xs font-medium text-slate-600 uppercase">Visibility</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{weather.visibility} km</p>
                      </div>

                      {/* Pressure */}
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Gauge size={18} className="text-orange-600" />
                          <p className="text-xs font-medium text-slate-600 uppercase">Pressure</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{weather.pressure} mb</p>
                      </div>

                      {/* UV Index */}
                      <div className="bg-yellow-50 rounded-lg p-4 md:col-span-2">
                        <p className="text-xs font-medium text-slate-600 uppercase mb-2">UV Index</p>
                        <div className="flex items-center gap-3">
                          <p className="text-2xl font-bold text-slate-900">{weather.uvIndex}</p>
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                weather.uvIndex >= 8
                                  ? "bg-red-500"
                                  : weather.uvIndex >= 6
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                              }`}
                              style={{ width: `${(weather.uvIndex / 11) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-600">
                            {weather.uvIndex >= 8
                              ? "High"
                              : weather.uvIndex >= 6
                                ? "Moderate"
                                : "Low"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Weather Alert */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <p className="text-lg font-semibold text-orange-900 mb-2">⚠️ Regional Alert</p>
                <p className="text-orange-800">
                  Heavy rainfall is expected in southern and central regions. Please ensure disaster
                  relief operations account for difficult road conditions and increased risk of flooding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
