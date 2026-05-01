import L from 'leaflet';
import 'leaflet.markercluster';

// Пробрасываем L в window для animals-map.js
window.L = L;

// Подключаем логику карты
import './animals-map.js';

console.log('Map bundle loaded');
