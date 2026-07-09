import thunderstorms from './weather-icons/thunderstorms.svg'
import thunderstormsDay from './weather-icons/thunderstorms-day.svg'
import thunderstormsNight from './weather-icons/thunderstorms-night.svg'
import thunderstormsDayRain from './weather-icons/thunderstorms-day-rain.svg'
import thunderstormsNightRain from './weather-icons/thunderstorms-night-rain.svg'
import thunderstormsDayExtremeRain from './weather-icons/thunderstorms-day-extreme-rain.svg'
import thunderstormsNightExtremeRain from './weather-icons/thunderstorms-night-extreme-rain.svg'
import drizzle from './weather-icons/drizzle.svg'
import partlyDayDrizzle from './weather-icons/partly-cloudy-day-drizzle.svg'
import partlyNightDrizzle from './weather-icons/partly-cloudy-night-drizzle.svg'
import overcastDayDrizzle from './weather-icons/overcast-day-drizzle.svg'
import overcastNightDrizzle from './weather-icons/overcast-night-drizzle.svg'
import extremeDayDrizzle from './weather-icons/extreme-day-drizzle.svg'
import extremeNightDrizzle from './weather-icons/extreme-night-drizzle.svg'
import rain from './weather-icons/rain.svg'
import extremeDayRain from './weather-icons/extreme-day-rain.svg'
import extremeNightRain from './weather-icons/extreme-night-rain.svg'
import partlyDayRain from './weather-icons/partly-cloudy-day-rain.svg'
import partlyNightRain from './weather-icons/partly-cloudy-night-rain.svg'
import overcastDayRain from './weather-icons/overcast-day-rain.svg'
import overcastNightRain from './weather-icons/overcast-night-rain.svg'
import sleet from './weather-icons/sleet.svg'
import hail from './weather-icons/hail.svg'
import snow from './weather-icons/snow.svg'
import overcastDaySnow from './weather-icons/overcast-day-snow.svg'
import overcastNightSnow from './weather-icons/overcast-night-snow.svg'
import extremeDaySnow from './weather-icons/extreme-day-snow.svg'
import extremeNightSnow from './weather-icons/extreme-night-snow.svg'
import mist from './weather-icons/mist.svg'
import smoke from './weather-icons/smoke.svg'
import haze from './weather-icons/haze.svg'
import dust from './weather-icons/dust.svg'
import hurricane from './weather-icons/hurricane.svg'
import cloudy from './weather-icons/cloudy.svg'
import thermometer from './weather-icons/thermometer.svg'
import fogDay from './weather-icons/fog-day.svg'
import fogNight from './weather-icons/fog-night.svg'
import clearDay from './weather-icons/clear-day.svg'
import clearNight from './weather-icons/clear-night.svg'
import cloudyDay from './weather-icons/partly-cloudy-day.svg'
import cloudyNight from './weather-icons/partly-cloudy-night.svg'

export function getWeatherIcon(weatherCode: number): string {
  let hour = new Date().getHours()
  let isDay = hour >= 6 && hour < 18

  if (weatherCode >= 200 && weatherCode < 300) {
    switch (weatherCode) {
      case 200:
      case 210:
      case 201:
      case 202:
        return isDay ? thunderstormsDayRain : thunderstormsNightRain
      case 211:
      case 212:
        return isDay ? thunderstormsDay : thunderstormsNight
      case 221:
      case 231:
      case 232:
        return isDay
          ? thunderstormsDayExtremeRain
          : thunderstormsNightExtremeRain
      default:
        return thunderstorms
    }
  }

  if (weatherCode >= 300 && weatherCode < 400) {
    switch (weatherCode) {
      case 300:
      case 301:
      case 302:
        return isDay ? partlyDayDrizzle : partlyNightDrizzle
      case 310:
      case 311:
        return isDay ? overcastDayDrizzle : overcastNightDrizzle
      case 312:
      case 313:
      case 314:
      case 321:
        return isDay ? extremeDayDrizzle : extremeNightDrizzle
      default:
        return drizzle
    }
  }

  if (weatherCode >= 500 && weatherCode < 600) {
    switch (weatherCode) {
      case 500:
      case 501:
        return isDay ? partlyDayRain : partlyNightRain
      case 502:
      case 503:
      case 504:
        return isDay ? overcastDayRain : overcastNightRain
      case 511:
        return sleet
      case 520:
      case 521:
      case 522:
      case 531:
        return isDay ? extremeDayRain : extremeNightRain
      default:
        return rain
    }
  }

  if (weatherCode >= 600 && weatherCode < 700) {
    switch (weatherCode) {
      case 600:
        return hail
      case 601:
      case 602:
        return isDay ? overcastDaySnow : overcastNightSnow
      case 611:
      case 612:
      case 613:
        return sleet
      case 615:
      case 616:
        return sleet
      case 620:
      case 621:
      case 622:
        return isDay ? extremeDaySnow : extremeNightSnow
      default:
        return snow
    }
  }

  switch (weatherCode) {
    case 701:
      return mist
    case 711:
      return smoke
    case 721:
      return haze
    case 731:
    case 751:
    case 761:
    case 762:
      return dust
    case 741:
      return isDay ? fogDay : fogNight
    case 771:
    case 781:
      return hurricane
    case 800:
      return isDay ? clearDay : clearNight
    case 801:
    case 802:
      return isDay ? cloudyDay : cloudyNight
    case 803:
    case 804:
      return cloudy
    default:
      return thermometer
  }
}
