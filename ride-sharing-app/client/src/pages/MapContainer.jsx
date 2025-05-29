import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import { initializeMap } from '../utils/mapUtils';

const MAPBOX_TOKEN = "pk.eyJ1IjoieWFzd2FudGgyMDA3IiwiYSI6ImNtOHp2Y2pmcTA4ZjUyc3E3bG9qd3QzN2EifQ.-o4c1vzZup3s8JMYdBtvxw";
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapContainer = ({ setMapInstance, from, to }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainerRef.current) {
      const map = initializeMap(mapContainerRef.current);
      mapRef.current = map;
      
      map.on('load', () => {
        setMapInstance(map);
      });
      
      // Clean up on unmount
      return () => map.remove();
    }
  }, [setMapInstance]);
  
  // Update map with route when from/to change
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.loaded() && from && to) {
      // Here we would add code to:
      // 1. Geocode the locations
      // 2. Draw a route between them
      // 3. Add markers for start/end points
      
      // This is a placeholder for that functionality
      console.log("Would draw route on map between", from, "and", to);
    }
  }, [from, to]);

  return (
    <div 
      ref={mapContainerRef} 
      className="h-80 w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50"
    />
  );
};

export default MapContainer;