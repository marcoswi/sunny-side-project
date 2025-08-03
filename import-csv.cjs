const fs = require('fs');
const csv = require('csv-parser');
const admin = require('firebase-admin');

// Path to your Firebase service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const results = [];

fs.createReadStream('places.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    for (const place of results) {
      const cleaned = {
        name: place.name,
        description: place.description,
        phone: Number(place.phone),
        type: place.type,
        url: place.url,
        googleMapsLocation: place.googleMapsLocation,
        dateAdded: new Date(place.dateAdded),

        hours: {
          openingHours: Number(place['hours.openingHours']),
          closingHours: Number(place['hours.closingHours'])
        },

        location: {
          lat: Number(place['location.lat']),
          lng: Number(place['location.lng'])
        },

        surroundingHeights: {
          N: Number(place['surroundingHeights.N']),
          NE: Number(place['surroundingHeights.NE']),
          E: Number(place['surroundingHeights.E']),
          SE: Number(place['surroundingHeights.SE']),
          S: Number(place['surroundingHeights.S']),
          SW: Number(place['surroundingHeights.SW']),
          W: Number(place['surroundingHeights.W']),
          NW: Number(place['surroundingHeights.NW'])
        }
      };

      // Use your custom ID column if you added one
      const docId = place.id;

      try {
        await db.collection('places').doc(docId).set(cleaned);
        console.log(`✅ Imported: ${cleaned.name}`);
      } catch (error) {
        console.error(`❌ Error importing ${cleaned.name}:`, error);
      }
    }

    console.log('🎉 Import complete!');
  });
