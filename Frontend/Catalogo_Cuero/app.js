const map = L.map('map').setView([7.0728, -73.0500], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let routeLayer = null;
let startMarker = null;
let endMarker = null;
let startPoint = null;
let endPoint = null;
const infoDiv = document.getElementById('info');

map.on('click', async function(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  if (!startPoint) {
    startPoint = [lat, lng];
    if (startMarker) map.removeLayer(startMarker);
    startMarker = L.marker([lat, lng]).addTo(map).bindPopup("Inicio").openPopup();
    infoDiv.innerHTML = "Ahora haz click en el destino";

  } else if (!endPoint) {
    endPoint = [lat, lng];
    if (endMarker) map.removeLayer(endMarker);
    endMarker = L.marker([lat, lng]).addTo(map).bindPopup("Destino").openPopup();
    await calculateRoute(startPoint, endPoint);
  }
});

async function getRouteFromInput() {
  const startAddr = document.getElementById('start').value;
  const endAddr = document.getElementById('end').value;
  
  if (!startAddr || !endAddr) {
    alert("Ingresa ambas direcciones");
    return;
  }
  
  try {
    const start = await geocode(startAddr);
    const end = await geocode(endAddr);
    
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    
    startMarker = L.marker(start).addTo(map).bindPopup("Inicio").openPopup();
    endMarker = L.marker(end).addTo(map).bindPopup("Destino");
    map.fitBounds([start, end]);
    
    await calculateRoute(start, end);
  } catch (err) {
    infoDiv.innerHTML = `<span style="color:red">Error: ${err.message}</span>`;
  }
}

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Piedecuesta, Santander, Colombia')}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.length === 0) throw new Error(`No encontré: ${address}`);
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

async function calculateRoute(start, end) {
  infoDiv.innerHTML = "Calculando ruta...";

  try {
    const res = await fetch(`http://127.0.0.1:8000/route?start_lat=${start[0]}&start_lon=${start[1]}&end_lat=${end[0]}&end_lon=${end[1]}`);
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      infoDiv.innerHTML = "No se encontró ruta. Verifica que el backend tenga la API key de OpenRouteService.";
      return;
    }

    const route = data.routes[0];
    const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);

    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.polyline(coords, { color: '#8d6e63', weight: 5 }).addTo(map);
    map.fitBounds(routeLayer.getBounds());

    const distance = formatDistance(route.distance);
    const duration = formatDuration(route.duration);

    infoDiv.innerHTML = `
      <strong>Distancia:</strong> ${distance} <br>
      <strong>Tiempo estimado:</strong> ${duration} <br>
      <button onclick="resetRoute()">Nueva ruta</button>
    `;

  } catch (err) {
    infoDiv.innerHTML = `<span style="color:red">Error: ${err.message}. ¿Está el backend corriendo?</span>`;
  }
}

function resetRoute() {
  startPoint = null;
  endPoint = null;
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);
  if (routeLayer) map.removeLayer(routeLayer);
  infoDiv.innerHTML = "Haz click en el mapa para poner el punto de inicio";
  document.getElementById('start').value = '';
  document.getElementById('end').value = '';
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs > 0) return `${hrs}h ${remMins}min`;
  return `${mins} min`;
}