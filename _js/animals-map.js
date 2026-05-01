(function (window) {
  'use strict';

  var MARKER_CLASS_COLORS = { red: '#e74c3c', orange: '#FFA500', green: '#27ae60' };

  function makeIcon(faClass, color, markerClass) {
    var backgroundStyle = markerClass ? '' : 'background:' + color + ';';
    var iconClassName = markerClass ? ' map-marker-dot--' + markerClass : '';
    return L.divIcon({
      html: '<div class="map-marker-dot' + iconClassName + '" style="' + backgroundStyle + '">' +
            '<i class="fa-solid ' + faClass + '"></i></div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16]
    });
  }

  function makePopup(pointData, types, layersConfig) {
    var iconsHtml = '';
    if (types && types.length > 1) {
      types.forEach(function (type) {
        var config = layersConfig[type];
        if (config) {
          iconsHtml += '<span class="map-popup-type-badge" style="background:' + config.color + '" title="' + config.name + '">' +
                       '<i class="fa-solid ' + config.icon + '"></i></span>';
        }
      });
    }

    var html = '<h4>' + pointData.name + (iconsHtml ? '<span class="map-popup-types">' + iconsHtml + '</span>' : '') + '</h4>';
    if (pointData.address) {
      if (pointData.yandex_url) {
        html += '<p><i class="fa fa-map-marker fa-fw"></i> <a href="' + pointData.yandex_url + '" target="_blank" rel="noopener">' + pointData.address + '</a></p>';
      } else {
        html += '<p><i class="fa fa-map-marker fa-fw"></i> ' + pointData.address + '</p>';
      }
    } else if (pointData.yandex_url) {
      html += '<p><i class="fa fa-map-marker fa-fw"></i> <a href="' + pointData.yandex_url + '" target="_blank" rel="noopener">Яндекс.Карты</a></p>';
    }
    if (pointData.phone) {
      html += '<p><i class="fa fa-phone fa-fw"></i> ' + pointData.phone + '</p>';
    }
    if (pointData.url) {
      html += '<p><i class="fa fa-external-link fa-fw"></i> <a href="' + pointData.url + '" target="_blank" rel="noopener">Сайт</a></p>';
    }
    if (pointData.hours) {
      html += '<p><i class="fa fa-clock fa-fw"></i> ' + pointData.hours + '</p>';
    }
    if (pointData.note) {
      html += '<p>' + pointData.note + '</p>';
    }
    return html;
  }

  // SVG donut: arc segments proportional to each layer colour
  function makeClusterIcon(cluster) {
    var markers          = cluster.getAllChildMarkers();
    var totalMarkers     = markers.length;
    var colorCounts      = {};
    markers.forEach(function (marker) {
      var color = marker.options.layerColor || '#666';
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });

    var size             = totalMarkers < 10 ? 40 : totalMarkers < 100 ? 50 : 60;
    var centerX          = size / 2, centerY = size / 2;
    var outerRadius      = size / 2 - 1;
    var innerRadius      = outerRadius * 0.58;
    var colors           = Object.keys(colorCounts);
    var svgPaths         = '';

    if (colors.length === 1) {
      svgPaths = '<circle cx="' + centerX + '" cy="' + centerY + '" r="' + outerRadius + '" fill="' + colors[0] + '"/>';
    } else {
      var currentAngle = -Math.PI / 2;
      colors.forEach(function (color) {
        var fraction  = colorCounts[color] / totalMarkers;
        var sweepAngle = fraction * 2 * Math.PI;
        var endAngle   = currentAngle + sweepAngle;
        var largeArcFlag = sweepAngle > Math.PI ? 1 : 0;
        
        var startX = centerX + outerRadius * Math.cos(currentAngle);
        var startY = centerY + outerRadius * Math.sin(currentAngle);
        var endX   = centerX + outerRadius * Math.cos(endAngle);
        var endY   = centerY + outerRadius * Math.sin(endAngle);
        
        var innerStartX = centerX + innerRadius * Math.cos(currentAngle);
        var innerStartY = centerY + innerRadius * Math.sin(currentAngle);
        var innerEndX   = centerX + innerRadius * Math.cos(endAngle);
        var innerEndY   = centerY + innerRadius * Math.sin(endAngle);
        
        svgPaths += '<path stroke="#fff" stroke-width="1.5" fill="' + color + '" d="' +
          'M'  + startX  + ' ' + startY  +
          ' A' + outerRadius + ' ' + outerRadius + ' 0 ' + largeArcFlag + ' 1 ' + endX  + ' ' + endY  +
          ' L' + innerEndX + ' ' + innerEndY +
          ' A' + innerRadius + ' ' + innerRadius + ' 0 ' + largeArcFlag + ' 0 ' + innerStartX + ' ' + innerStartY +
          ' Z"/>';
        currentAngle = endAngle;
      });
    }

    var fontSize = Math.round(innerRadius * 0.78);
    var svg = '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
      svgPaths +
      '<circle cx="' + centerX + '" cy="' + centerY + '" r="' + innerRadius + '" fill="#fff"/>' +
      '<text x="' + centerX + '" y="' + centerY + '" text-anchor="middle" dominant-baseline="central"' +
      ' style="font:700 ' + fontSize + 'px/1 sans-serif;fill:#333">' + totalMarkers + '</text>' +
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
        var button = L.DomUtil.create('a', 'leaflet-bar-part');
        button.href = '#';
        button.title = 'Моё местоположение';
        button.setAttribute('role', 'button');
        button.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
        
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.appendChild(button);
        
        var locationMarker = null;
        L.DomEvent.on(button, 'click', function (event) {
          L.DomEvent.preventDefault(event);
          map.locate({ setView: true, maxZoom: 16 });
        });
        map.on('locationfound', function (event) {
          if (locationMarker) locationMarker.remove();
          locationMarker = L.circleMarker(event.latlng, {
            radius: 9, color: '#fff', weight: 2, fillColor: '#4285f4', fillOpacity: 1
          }).addTo(map);
        });
        map.on('locationerror', function () { button.title = 'Геолокация недоступна'; });
        return container;
      }
    });
    new LocateControl().addTo(map);
  }

  function addFilterControl(map, layerList, layersConfig, onFilterChange) {
    var FilterEnableControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: function () {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        L.DomEvent.disableScrollPropagation(container);
        L.DomEvent.disableClickPropagation(container);

        var toggleButton = L.DomUtil.create('a', 'leaflet-bar-part', container);
        toggleButton.title = 'Фильтр слоёв';
        toggleButton.innerHTML = '<i class="fa-solid fa-layer-group"></i>';
        toggleButton.setAttribute('role', 'button');
        toggleButton.addEventListener('click', function () {
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

        layerList.forEach(function (layerId) {
          var config = layersConfig[layerId];
          if (!config) return;
          var button = L.DomUtil.create('button', 'map-filter-btn map-filter-btn--active', panel);
          button.innerHTML = '<i class="fa-solid ' + config.icon + '"></i> ' + config.name;
          button.style.setProperty('--layer-color', config.color);
          button.addEventListener('click', function () {
            var isActive = button.classList.toggle('map-filter-btn--active');
            onFilterChange(layerId, isActive);
          });
        });

        return panel;
      }
    });
    new FilterEnableControl().addTo(map);
    new FilterControl().addTo(map);
  }

  function init(containerId, latitude, longitude, zoomLevel, options) {
    var map = L.map(containerId, { scrollWheelZoom: true }).setView([latitude, longitude], zoomLevel);

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

    var requestedLayers = options.requestedLayers || [];
    var activeFilters = {};
    requestedLayers.forEach(function (id) { activeFilters[id] = true; });

    var allEntries = [];

    options.points.forEach(function (entry) {
      var layerSlug = entry.type;
      var pointData = entry.data;
      var layerConfig = options.layers[layerSlug];
      if (!layerConfig) return;

      var pointTypes = [layerSlug].concat(pointData.types || []);
      
      // Keep point only if it has at least one of the requested types
      var hasRequestedType = requestedLayers.length === 0 || pointTypes.some(function (type) {
        return requestedLayers.indexOf(type) !== -1;
      });
      
      if (!hasRequestedType) return;

      var popupContent = makePopup(pointData, pointTypes, options.layers);
      var item = {
        types: pointTypes,
        isAdded: false
      };

      if (pointData.polygon) {
        var polygonClassName = 'map-polygon--' + (pointData.marker_class || layerSlug);
        item.layer = L.polygon(pointData.polygon, {
          className: polygonClassName, fillOpacity: 0.25, weight: 2
        }).bindPopup(popupContent);
        item.isPolygon = true;
      } else {
        var markerColor = MARKER_CLASS_COLORS[pointData.marker_class] || layerConfig.color;
        item.layer = L.marker([pointData.lat, pointData.lng], {
          icon: makeIcon(layerConfig.icon, layerConfig.color, pointData.marker_class),
          layerColor: markerColor
        }).bindPopup(popupContent);
        item.isPolygon = false;
      }
      allEntries.push(item);
    });

    function updateVisibility() {
      var markersToAdd = [];
      var markersToRemove = [];

      allEntries.forEach(function (item) {
        var isVisible = requestedLayers.length === 0 || item.types.some(function (type) { 
          return activeFilters[type]; 
        });
        
        if (isVisible && !item.isAdded) {
          if (item.isPolygon) {
            map.addLayer(item.layer);
          } else {
            toAddMarkers.push(item.layer);
          }
          item.isAdded = true;
        } else if (!isVisible && item.isAdded) {
          if (item.isPolygon) {
            map.removeLayer(item.layer);
          } else {
            toRemoveMarkers.push(item.layer);
          }
          item.isAdded = false;
        }
      });

      // Simple toAddMarkers/toRemoveMarkers were missed in variable renaming in previous step
      if (markersToAdd.length) clusterGroup.addLayers(markersToAdd);
      if (markersToRemove.length) clusterGroup.removeLayers(markersToRemove);
    }
    
    // Patching the variable names in updateVisibility (missed them in the write_file above)
    function updateVisibilityCorrected() {
      var markersToAdd = [];
      var markersToRemove = [];

      allEntries.forEach(function (item) {
        var isVisible = requestedLayers.length === 0 || item.types.some(function (type) { 
          return activeFilters[type]; 
        });
        
        if (isVisible && !item.isAdded) {
          if (item.isPolygon) {
            map.addLayer(item.layer);
          } else {
            markersToAdd.push(item.layer);
          }
          item.isAdded = true;
        } else if (!isVisible && item.isAdded) {
          if (item.isPolygon) {
            map.removeLayer(item.layer);
          } else {
            markersToRemove.push(item.layer);
          }
          item.isAdded = false;
        }
      });

      if (markersToAdd.length) clusterGroup.addLayers(markersToAdd);
      if (markersToRemove.length) clusterGroup.removeLayers(markersToRemove);
    }

    updateVisibilityCorrected();

    if (requestedLayers.length > 1) {
      addFilterControl(map, requestedLayers, options.layers, function (layerId, isActive) {
        activeFilters[layerId] = isActive;
        updateVisibilityCorrected();
      });
    }
  }

  window.AnimalsMap = { init: init };
}(window));
