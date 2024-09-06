import React, { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Circle } from "./circle.tsx";

import "./Modal.css";
import { useTranslation } from "react-i18next";

const Maps = ({ locationURI }) => {
  const [lng, setLng] = useState();
  const [lat, setLat] = useState();
  const [cityName, setCityName] = useState("");
  const [countryName, setCountryName] = useState("");

  const [markerRef, marker] = useAdvancedMarkerRef();

  const [temp, setTemp] = useState("");
  const [humid, setHumid] = useState("");
  const [desc, setDesc] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {t} = useTranslation();

  const locations = [{ key: cityName }, { location: { lat: lat, lng: lng } }];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${locationURI}&key=AIzaSyADravS22uqcS5uF6WsnHKHCyN9us_oKJk`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        
        const jsonData = await response.json();
        console.log(jsonData)
        const lat = jsonData.results[0].geometry.location.lat;
        const lng = jsonData.results[0].geometry.location.lng;
        const cityName = jsonData.results[0].address_components[0].long_name;

        setLat(lat);
        setLng(lng);
        setCityName(cityName);

        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=92d1583934ac3a50ea89c671d0514ee9&units=metric`
        );
        if (!weatherResponse.ok) {
          throw new Error("Weather data request failed");
        }
        const weatherDataResponse = await weatherResponse.json();
        // console.log(weatherDataResponse);
        setDesc(weatherDataResponse.weather[0].main);
        setWindSpeed(weatherDataResponse.wind.speed);
        setHumid(weatherDataResponse.main.humidity);
        setTemp(weatherDataResponse.main.temp);
        setCountryName(jsonData.results[0].formatted_address)
      } catch (error) {
        setError(error);
        console.error("Error fetching data:", error); // Console log the error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <APIProvider apiKey={"AIzaSyADravS22uqcS5uF6WsnHKHCyN9us_oKJk"}>
      <Map
        style={{ width: "100vw", height: "100vh" }}
        defaultCenter={{ lat: lat, lng: lng }}
        defaultZoom={11}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId={"21d4fa74d741a664"}
      >
        <Circle
          radius={10000}
          center={{ lat: lat, lng: lng }}
          strokeColor={"#0c4cb3"}
          strokeOpacity={1}
          strokeWeight={1}
          fillColor={"#3b82a1"}
          fillOpacity={0.3}
        />

        <AdvancedMarker
          ref={markerRef}
          key={locations[0].key}
          position={locations[1].location}
        >
          <Pin background={"orange"} glyphColor={"#000"} borderColor={"#000"} />
        </AdvancedMarker>
        <InfoWindow anchor={marker} position={{ lat: lat, lng: lng }}>
         <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
         <h2 style={{ marginBottom: "12px" }}>{t("weatherMap.weatherConditions")}</h2>
         <p style={{fontWeight:"300", marginBottom:"5px"}}>{countryName}</p>
         </div>
          <div className="weather-container">
            <div className="weather-data">
              <div className="weather-details">
                <p>{t("weatherMap.temp")}: {temp} °C</p>
                <p>{t("weatherMap.desc")}: {desc}</p>
                <p>{t("weatherMap.hum")}: {humid}%</p>
                <p>{t("weatherMap.windSpeed")}: {windSpeed} km/h</p>
                <h4
                  style={{
                    textAlign: "center",
                    marginBottom: "10px",
                    textDecoration: "underline",
                  }}
                >
                {t("weatherMap.weather")}
                </h4>{" "}
                {desc === "Clear" ? (
                  <div className="weatherImg">
                    <span>Clear</span>
                    <img src="/sun.svg" width={15} alt="" />
                  </div>
                ) : desc === "Clouds" ? (
                  <div className="weatherImg">
                    <span>Cloudy</span>
                    <img src="/cloud.svg" width={15} alt="" />
                  </div>
                ) : desc === "Mist" ? (
                  <div className="weatherImg">
                    <span>Mist</span>
                    <img src="/mist.svg" width={15} alt="" />
                  </div>
                ) : desc === "Snow" ? (
                  <div className="weatherImg">
                    <span>Snow</span>
                    <img src="/snow.svg" alt="" width={15} />
                  </div>
                ) : desc === "Rain" ? (
                  <div className="weatherImg">
                    <span>Rainy</span>
                    <img src="/rain.svg" width={15} alt="" />
                  </div>
                ) : (
                  <div className="weatherImg">
                    <span>Clear</span>
                    <img src="/sun.svg" width={15} alt="" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </InfoWindow>
      </Map>
    </APIProvider>
  );
};

export default Maps;
