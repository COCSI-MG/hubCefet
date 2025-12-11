import { Circle, MapContainer, Popup, TileLayer, Marker } from 'react-leaflet'

interface EventMapProps {
  lat: number;
  long: number;
  radius: number;
}

export function EventMap({ lat, long, radius }: EventMapProps) {

  const handleClick = () => {
    const url = `https://www.google.com/maps?q=${lat},${long}`;
    window.open(url, "_blank");
  };

  return (
    <MapContainer center={[lat, long]} zoom={17} className="h-full w-full rounded-xl">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, long]} eventHandlers={{ click: handleClick }}>
        <Popup >Clique para abrir no Google Maps</Popup>
      </Marker>

      <Circle center={[lat, long]} radius={radius} />
    </MapContainer >
  );
} 
