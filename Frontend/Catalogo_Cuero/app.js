const map = L.map('map').setView([6.2442, -75.5812], 12); // Medellín

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Ejemplo: marcador de tu casa y un proveedor
L.marker([6.2442, -75.5812]).addTo(map).bindPopup("Casa");
L.marker([6.2700, -75.5600]).addTo(map).bindPopup("Proveedor 1");

// Aquí haces fetch a tu backend /route para dibujar la línea