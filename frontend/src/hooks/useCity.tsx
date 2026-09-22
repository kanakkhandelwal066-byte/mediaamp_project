import React, { createContext, useContext, useState, useEffect } from "react";
import { City } from "../types";
import { theatreService } from "../services/theatreService";

interface CityContextType {
  selectedCity: City | null;
  cities: City[];
  setCity: (city: City) => void;
  loading: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const cityList = await theatreService.getCities();
        setCities(cityList);
        
        const savedId = localStorage.getItem("cinebook_city_id");
        if (savedId) {
          const matched = cityList.find((c) => c.id === Number(savedId));
          if (matched) {
            setSelectedCity(matched);
            setLoading(false);
            return;
          }
        }
        if (cityList.length > 0) {
          setSelectedCity(cityList[0]);
          localStorage.setItem("cinebook_city_id", String(cityList[0].id));
        }
      } catch (err) {
        console.error("Failed to load cities", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const setCity = (city: City) => {
    setSelectedCity(city);
    localStorage.setItem("cinebook_city_id", String(city.id));
  };

  return (
    <CityContext.Provider value={{ selectedCity, cities, setCity, loading }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
};
