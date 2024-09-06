import axios from 'axios';
export const getWeatherData = async (lat, lng) => {
  try {
    if (lat && lng) {
      const { data } = await axios.get('https://community-open-weather-map.p.rapidapi.com/find', {
        params: { lat, lon: lng },
        headers: {
          'x-rapidapi-key': '3e5d1a1539mshf3b94ec751edd80p171edajsn35fd4d10e6c5',
          'x-rapidapi-host': 'open-weather-map27.p.rapidapi.com',
        },
      });

      return data;
    }
  } catch (error) {
    console.log(error);
  }
};
