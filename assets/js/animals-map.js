(function (window) {
  'use strict';

  var MARKER_CLASS_COLORS = { red: '#e74c3c', orange: '#FFA500', green: '#27ae60' };

  function makeIcon(faClass, color, markerClass) {
    var bgStyle = markerClass ? '' : 'background:' + color + ';';
    var cls = markerClass ? ' map-marker-dot--' + markerClass : '';
    return L.divIcon({
      html: '<div class="map-marker-dot' + cls + '" style="' + bgStyle + '">' +
            '<i class="fa-solid ' + faClass + '"></i></div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16]
    });
  }

  function makePopup(p) {
    var html = '<b>' + p.name + '</b>';
    if (p.address)   html += '<br>' + p.address;
    if (p.phone)     html += '<br>' + p.phone;
    if (p.note)      html += '<br><small>' + p.note + '</small>';
    if (p.yandex_url) html += '<br><a href="' + p.yandex_url + '" target="_blank" rel="noopener">Яндекс.Карты</a>';
    if (p.url)       html += '<br><a href="' + p.url + '" target="_blank" rel="noopener">Сайт</a>';
    return html;
  }

  // SVG donut: arc segments proportional to each layer colour
  function makeClusterIcon(cluster) {
    var markers     = cluster.getAllChildMarkers();
    var total       = markers.length;
    var colorCounts = {};
    markers.forEach(function (m) {
      var c = m.options.layerColor || '#666';
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    });

    var size   = total < 10 ? 40 : total < 100 ? 50 : 60;
    var cx     = size / 2, cy = size / 2;
    var outerR = size / 2 - 1;
    var innerR = outerR * 0.58;
    var colors = Object.keys(colorCounts);
    var paths  = '';

    if (colors.length === 1) {
      paths = '<circle cx="' + cx + '" cy="' + cy + '" r="' + outerR + '" fill="' + colors[0] + '"/>';
    } else {
      var angle = -Math.PI / 2;
      colors.forEach(function (color) {
        var frac  = colorCounts[color] / total;
        var sweep = frac * 2 * Math.PI;
        var end   = angle + sweep;
        var large = sweep > Math.PI ? 1 : 0;
        var x1 = cx + outerR * Math.cos(angle), y1 = cy + outerR * Math.sin(angle);
        var x2 = cx + outerR * Math.cos(end),   y2 = cy + outerR * Math.sin(end);
        var ix1 = cx + innerR * Math.cos(angle), iy1 = cy + innerR * Math.sin(angle);
        var ix2 = cx + innerR * Math.cos(end),   iy2 = cy + innerR * Math.sin(end);
        paths += '<path stroke="#fff" stroke-width="1.5" fill="' + color + '" d="' +
          'M'  + x1  + ' ' + y1  +
          ' A' + outerR + ' ' + outerR + ' 0 ' + large + ' 1 ' + x2  + ' ' + y2  +
          ' L' + ix2 + ' ' + iy2 +
          ' A' + innerR + ' ' + innerR + ' 0 ' + large + ' 0 ' + ix1 + ' ' + iy1 +
          ' Z"/>';
        angle = end;
      });
    }

    var fs  = Math.round(innerR * 0.78);
    var svg = '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
      paths +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + innerR + '" fill="#fff"/>' +
      '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central"' +
      ' style="font:700 ' + fs + 'px/1 sans-serif;fill:#333">' + total + '</text>' +
      '</svg>';

    return L.divIcon({
      html: svg, className: 'map-cluster-icon',
      iconSize: [size, size], iconAnchor: [size / 2, size / 2]
    });
  }

  function addLocateControl(map) {
    var LocateControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        var btn = L.DomUtil.create('a', 'leaflet-bar-part');
        btn.href = '#';
        btn.title = 'Моё местоположение';
        btn.setAttribute('role', 'button');
        btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.appendChild(btn);
        var locMarker = null;
        L.DomEvent.on(btn, 'click', function (e) {
          L.DomEvent.preventDefault(e);
          map.locate({ setView: true, maxZoom: 16 });
        });
        map.on('locationfound', function (e) {
          if (locMarker) locMarker.remove();
          locMarker = L.circleMarker(e.latlng, {
            radius: 9, color: '#fff', weight: 2, fillColor: '#4285f4', fillOpacity: 1
          }).addTo(map);
        });
        map.on('locationerror', function () { btn.title = 'Геолокация недоступна'; });
        return container;
      }
    });
    new LocateControl().addTo(map);
  }

  function addFilterControl(map, layerConfig, clusterGroup, layerMarkers, layerPolygons) {
    var FilterEnableControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: function () {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        L.DomEvent.disableScrollPropagation(container);
        L.DomEvent.disableClickPropagation(container);

        var toggleBtn = L.DomUtil.create('a', 'leaflet-bar-part', container);
        toggleBtn.title = 'Фильтр слоёв';
        toggleBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i>';
        toggleBtn.setAttribute('role', 'button');
        toggleBtn.addEventListener('click', function () {
          container.parentElement.classList.toggle('map-filter-wrap--open');
        });

        return container;
      }
    });
    var FilterControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: function () {
        var panel = L.DomUtil.create('div', 'map-filter-panel');
        L.DomEvent.disableScrollPropagation(panel);
        L.DomEvent.disableClickPropagation(panel);

        layerConfig.forEach(function (cfg) {
          var btn = L.DomUtil.create('button', 'map-filter-btn map-filter-btn--active', panel);
          btn.innerHTML = '<i class="fa-solid ' + cfg.icon + '"></i> ' + cfg.name;
          btn.style.setProperty('--layer-color', cfg.color);
          btn.addEventListener('click', function () {
            var active = btn.classList.toggle('map-filter-btn--active');
            if (active) {
              clusterGroup.addLayers(layerMarkers[cfg.id]);
              map.addLayer(layerPolygons[cfg.id]);
            } else {
              clusterGroup.removeLayers(layerMarkers[cfg.id]);
              map.removeLayer(layerPolygons[cfg.id]);
            }
          });
        });

        return panel;
      }
    });
    new FilterEnableControl().addTo(map);
    new FilterControl().addTo(map);
  }

  function init(containerId, lat, lng, zoom, layerConfig) {
    var map = L.map(containerId, { scrollWheelZoom: true }).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    addLocateControl(map);

    var clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      iconCreateFunction: makeClusterIcon
    }).addTo(map);

    var layerMarkers  = {};
    var layerPolygons = {};

    layerConfig.forEach(function (cfg) {
      layerMarkers[cfg.id]  = [];
      layerPolygons[cfg.id] = L.layerGroup().addTo(map);

      cfg.points.forEach(function (p) {
        var popup = makePopup(p);
        if (p.polygon) {
          var polyCls = 'map-polygon--' + (p.marker_class || cfg.id);
          L.polygon(p.polygon, {
            className: polyCls, fillOpacity: 0.25, weight: 2
          }).bindPopup(popup).addTo(layerPolygons[cfg.id]);
        } else {
          var markerColor = MARKER_CLASS_COLORS[p.marker_class] || cfg.color;
          var marker = L.marker([p.lat, p.lng], {
            icon: makeIcon(cfg.icon, cfg.color, p.marker_class),
            layerColor: markerColor
          }).bindPopup(popup);
          layerMarkers[cfg.id].push(marker);
          clusterGroup.addLayer(marker);
        }
      });
    });

    if (layerConfig.length > 1) {
      addFilterControl(map, layerConfig, clusterGroup, layerMarkers, layerPolygons);
    }
  }

  window.AnimalsMap = { init: init };
}(window));
