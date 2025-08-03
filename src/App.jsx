// Routing
import { Routes, Route } from 'react-router-dom';
// React hooks
import { useEffect, useState } from 'react';
// Firestore
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // Make sure db is exported from firebase.js
// Sun‐shade logic util
import { isPlaceInSun } from './utils/sunlightCheck';
// Map component
import MapView from './MapView';
import sunnyLogo from './assets/sunnySideMap_Logo.png';

function App() {

  // Fetch places from Firestore
  const [places, setPlaces] = useState([]);
 
  // Slider: minutes since midnight
  const now = new Date();
  const initialMinutes = now.getHours() * 60 + now.getMinutes();
  const [sunMinutes, setSunMinutes] = useState(initialMinutes);

  useEffect(() => {
      async function fetchPlaces() {
        const snapshot = await getDocs(collection(db, "places"));
        
        // Build current Date with only minutes offset
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        now.setMinutes(sunMinutes);

        const data = snapshot.docs.map(doc => {
          const place = { id: doc.id, ...doc.data() };
          place.isInSun = isPlaceInSun(place, now);
          return place;
        });

        setPlaces(data);
      }
      fetchPlaces();
      }, [sunMinutes]);

  // Helper: format slider value as "HH:MM - DD / Mon / YYYY"
  function formatTime(totalMinutes) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setMinutes(totalMinutes);

    const timeStr = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const dateStr = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return `${timeStr} — ${dateStr}`;
  }

  return (
    <div>

      {/* ── Routes ── */}
      <Routes>
        <Route
            path="/"
            element={
              <div className="map-container">
                <div className="logo-container">
                  <img src={sunnyLogo} alt="Sunny Side Logo" className="sunny-logo" />
                  <div className="logo-underline" />
                </div>
                <label className="slider-label">
                  <div className="slider-info">
                    Time of Day: {formatTime(sunMinutes)}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1439"
                    step="15"
                    value={sunMinutes}
                    onChange={(e) => setSunMinutes(Number(e.target.value))}
                  />
                </label>

                <MapView places={places} sunHour={sunMinutes} />
              </div>
            }
          />
      </Routes>
    </div>
  );
}

export default App;
