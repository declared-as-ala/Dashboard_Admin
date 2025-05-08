"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Store } from "@/lib/types";

// Define custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapComponentProps {
  stores: Store[];
  selectedMarker: Store | null;
  onMarkerClick: (store: Store) => void;
  onClosePopup: () => void;
  zoom?: number;
}

const MapComponent = ({ 
  stores, 
  selectedMarker, 
  onMarkerClick, 
  onClosePopup,
  zoom = 7 
}: MapComponentProps) => {
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if (selectedMarker && mapRef.current) {
      mapRef.current.setView(
        [selectedMarker.latitude, selectedMarker.longitude],
        zoom
      );
    }
  }, [selectedMarker, zoom]);

  const center = stores.length > 0
    ? [stores[0].latitude, stores[0].longitude]
    : [36.8065, 10.1815];

  return (
    <MapContainer
      center={center as L.LatLngExpression}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={[store.latitude, store.longitude]}
          icon={customIcon}
          eventHandlers={{
            click: () => onMarkerClick(store),
          }}
        >
          {selectedMarker?.id === store.id && (
            <Popup onClose={onClosePopup}>
              <div className="p-2">
                <h3 className="font-bold">{store.nom}</h3>
                <p>{store.adresse}</p>
                <p>{store.ville}, {store.pays}</p>
                <p>{store.telephone}</p>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;