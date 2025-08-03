import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import SunCalc from 'suncalc';
import { useEffect, useRef, useState } from 'react';

// Adds compass direction labels (N, S, E, W) over the map
function CompassOverlay() {
  const labelStyle = {
    position: 'absolute',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    padding: '2px 6px',
    borderRadius: '4px',
    pointerEvents: 'none',
    zIndex: 1000,
  };

  return (
    <>
      <div style={{ ...labelStyle, top: '5px', left: '50%', transform: 'translateX(-50%)' }}>N</div>
      <div style={{ ...labelStyle, bottom: '5px', left: '50%', transform: 'translateX(-50%)' }}>S</div>
      <div style={{ ...labelStyle, top: '50%', right: '5px', transform: 'translateY(-50%)' }}>E</div>
      <div style={{ ...labelStyle, top: '50%', left: '5px', transform: 'translateY(-50%)' }}>W</div>
    </>
  );
}

// Calculates and displays sun icon on map based on time and location
function SunIndicator({ hour }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    container.style.position = 'relative';

    const width = container.clientWidth;
    const height = container.clientHeight;
    const center = map.getCenter();

    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setMinutes(hour);

    const times = SunCalc.getTimes(date, center.lat, center.lng);
    const sunPos = SunCalc.getPosition(date, center.lat, center.lng);
    const isNight = sunPos.altitude < 0;

    // Apply or remove night overlay
    let overlay = container.querySelector('#night-overlay');
    if (isNight) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'night-overlay';
        Object.assign(overlay.style, {
          position: 'absolute',
          zIndex: '999',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.1)',
          pointerEvents: 'none'
        });
        container.appendChild(overlay);
      }
    } else {
      if (overlay) overlay.remove();
    }

    // Remove sun indicator if it's night
    if (isNight) {
      const el = container.querySelector('#sun-indicator');
      if (el) el.remove();
      return;
    }

    // Calculate sun's position on the curved path
    const sunrise = times.sunrise.getHours() * 60 + times.sunrise.getMinutes();
    const sunset = times.sunset.getHours() * 60 + times.sunset.getMinutes();
    const intervals = (sunset - sunrise) / 15;
    const progress = (hour - sunrise) / 15;
    const ratio = Math.min(Math.max(progress / intervals, 0), 1);

    const padding = 30;
    const startX = width - padding;
    const startY = height / 6;

    const path = [
      [width - padding, height - padding],
      [padding, height - padding],
      [padding, height / 6],
    ];

    const d1 = height - startY - padding;
    const d2 = width - 2 * padding;
    const d3 = height - startY - padding;
    const total = d1 + d2 + d3;
    let dist = total * ratio;

    let curX = startX;
    let curY = startY;
    for (const [nextX, nextY] of path) {
      const dx = nextX - curX;
      const dy = nextY - curY;
      const step = Math.abs(dx) + Math.abs(dy);
      if (dist <= step) {
        if (dx !== 0) curX += dx > 0 ? dist : -dist;
        else curY += dy > 0 ? dist : -dist;
        break;
      }
      curX = nextX;
      curY = nextY;
      dist -= step;
    }

    // Add or update sun icon on map
    let el = container.querySelector('#sun-indicator');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sun-indicator';
      Object.assign(el.style, {
        position: 'absolute',
        zIndex: '1001',
        pointerEvents: 'none',
        fontSize: '24px',
        transition: 'left 0.2s ease, top 0.2s ease',
        transform: 'translate(-50%, 0)'
      });
      container.appendChild(el);
    }

    el.innerText = '☀️';
    el.style.left = `${curX}px`;
    el.style.top = `${curY}px`;
  }, [map, hour]);

  return null;
}

// Main map view component
function MapView({ places, sunHour }) {
  const mapRef = useRef();
  const [zoomLevel, setZoomLevel] = useState(14); // Initial zoom level

  function ZoomListener() {
    useMapEvents({
      zoomend: (e) => {
        const zoom = e.target.getZoom();
        setZoomLevel(zoom);
      }
    });
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={[40.4168, -3.7038]} // Madrid
        zoom={14}
        style={{ height: '500px', width: '100%' }}
        whenCreated={(map) => {
          mapRef.current = map;
          const initialZoom = map.getZoom();
          setZoomLevel(initialZoom);
          map.on('zoomend', () => {
            const newZoom = map.getZoom();
            setZoomLevel(newZoom);
          });
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        />
        
        {/* Zoom event listener inside map */}
        <ZoomListener />

        {/* Render markers */}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.location.lat, place.location.lng]}
            icon={L.divIcon({
              className: 'custom-icon',
              html: zoomLevel < 14
                ? `<div style="
                    width: ${zoomLevel * 0.7}px;
                    height: ${zoomLevel * 0.7}px;
                    background: lightblue;
                    border-radius: 50%;
                  "></div>`
                : `<span style="font-size: 24px;">${place.isInSun ? '☀️' : '🌤️ '}</span>`,
              iconSize: zoomLevel < 14 ? [zoomLevel * 0.7, zoomLevel * 0.7] : [30, 30],
              iconAnchor: zoomLevel < 14 ? [zoomLevel * 0.35, zoomLevel * 0.35] : [15, 15]
            })}
          >
            {zoomLevel >= 14 && (
              <Popup>
                <div style={{ lineHeight: '1.4' }}>
                  <strong>{place.name}</strong><br />
                  {place.type && <div>{place.type}</div>}
                  {place.googleMapsLocation && (
                    <div>
                      <a href={place.googleMapsLocation} target="_blank" rel="noopener noreferrer">
                        📍 View on Google Maps
                      </a>
                    </div>
                  )}
                  {place.url && (
                    <div>
                      <a href={place.url} target="_blank" rel="noopener noreferrer">
                        🔗 Website
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}

        <SunIndicator hour={sunHour} />
      </MapContainer>

      <CompassOverlay />

      {zoomLevel < 14 && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#e6f2ff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontStyle: 'italic',
            color: '#003366',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
        >
          🔍 Zoom in to see sun/shade status
        </div>
      )}

    </div>
  );
}

export default MapView;

