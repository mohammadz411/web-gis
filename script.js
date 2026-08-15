const map = L.map('map').setView([32.4279, 53.6880], 5);


 const streetLayer = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
);

const satelliteLayer = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/' +
  'World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
  }
);

streetLayer.addTo(map);

const layerControl = L.control.layers(
  {
    'نقشه خیابانی': streetLayer,
    'تصویر ماهواره‌ای': satelliteLayer
  },
  null,
  { position: 'topleft' }
).addTo(map);


const places = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "برج میلاد",
        city: "تهران"
      },
      geometry: {
        type: "Point",
        coordinates: [51.3756, 35.7448]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "میدان نقش جهان",
        city: "اصفهان"
      },
      geometry: {
        type: "Point",
        coordinates: [51.6776, 32.6573]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "حافظیه",
        city: "شیراز"
      },
      geometry: {
        type: "Point",
        coordinates: [52.5511, 29.6219]
      }
    }
  ]
};

const placesLayer = L.geoJSON(places, {
  onEachFeature: (feature, layer) => {
    layer.bindPopup(
      `<b>${feature.properties.name}</b><br>شهر: ${feature.properties.city}`
    );
  }
}).addTo(map);

layerControl.addOverlay(placesLayer, 'مکان‌های گردشگری');

map.on('click', (event) => {
  const latitude = event.latlng.lat.toFixed(5);
  const longitude = event.latlng.lng.toFixed(5);

  L.popup()
  .setLatLng(event.latlng)
  .setContent(`مختصات: ${latitude}, ${longitude}`)
  .openOn(map);
})

let userMarker;
let accuracyCircle;

document.getElementById('locate-button').addEventListener('click', () => {
  map.locate({
    setView: true,
    maxZoom: 14,
    enableHighAccuracy: true 
  });
});

map.on('locationFound', (event) => {
  if(userMarker) map.removeLayer(userMarker);
  if(accuracyCircle) map.removeLayer(accuracyCircle);

  userMarker = L.marker(event.latlng)
  .addTo(map)
  .bindPopup('مکان فعلی شما')
  .openPopup();

  accuracyCircle = L.circle(event.latlng, {
    radius : event.accuracy,
    color: '#1976d2',
    fillColor: '#1976d2',
    fillOpacity: 0.15
  }).addTo(map);
});

map.on('locationerror' , () => {
  alert('دسترسی موقعیت مکانی فعای نیست');
});