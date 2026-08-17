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
 
fetch('assest/places.geojson')
.then((response) => {
  if(!response.ok) {
    throw new Error('فایل داده یافت نشد');
  }

  return response.json();
})
.then((place) => {
  const placeLayer = L.geoJSON(place, {
    onEachFeature: (feature, layer ) => {
      layer.bindPopup(
        `<b>${feature.properties.name}</b><br>
          شهر: ${feature.properties.city}`
      );
    }
  }).addTo(map);

  layerControl.addOverlay(placeLayer, 'مکان‌های گردشگری');
})
.catch((error) => {
  console.error(error);
});

const userPointLayer = L.layerGroup().addTo(map);

layerControl.addOverlay(userPointLayer,'نقاط ثبت شده');

const savedPoints = JSON.parse(
  localStorage.getItem('userPoints') || '[]');

function showUserPoint(point){
  return L.marker([point.lat, point.lng])
  .addTo(userPointLayer)
  .bindPopup(`
      <b>${point.name}</b><br>
      عرض جغرافیایی: ${point.lat.toFixed(5)}<br>
      طول جغرافیایی: ${point.lng.toFixed(5)}
    `);
}

savedPoints.forEach(showUserPoint);

map.on('click', (event) => {
  const name = prompt('نام مکان را وارد کن')

  if(!name || !name.trim()){
    return;
  }

  const point = {
    name: name.trim(),
    lat: event.latlng.lat,
    lng: event.latlng.lng,
  };

  savedPoints.push(point);

  localStorage.setItem(
    'userPoints',
    JSON.stringify(savedPoints)
  );

  showUserPoint(point).openPopup();
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

map.on('locationfound', (event) => {
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