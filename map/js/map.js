var Map = Map || {};
(function(window, _, exports, undefined) {
    'use strict';

    var map;
    var data = null;
    var currentMarkersOnMap = [];

    exports.init = function () {
        if (typeof Data != 'undefined') {
            data = Data.getData();
            console.log('Number of data points: ' + data.length);

            // convert data
            data = _.map(data, function (d) {
                return [d[1], d[2], Math.abs(d[3])];
            });

        } else {
            console.log('Data object not defined');
        }

        if (data != null) {
            loadMap();
        }
    };


    var loadMap = function() {
        var baseLayerMapBox = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoiY29ydGV4bWVkaWEiLCJhIjoiY2l3ZjNyNmR1MDA2cjJ5dW1tN2o0eHRyeiJ9.6BEJDEUBuZQzkxgStBoM8w'
        });

        map = L.map('map', {
            center: new L.LatLng(48.399, 9.981),
            zoom: 15,
            layers: [baseLayerMapBox],
            scrollWheelZoom: true
        });

        map.on('zoomend', function () {
            checkIfMarkerCanBeDrawn();
        });
        map.on('moveend', function () {
            checkIfMarkerCanBeDrawn();
        });


        // render it
        renderHeatmap(data);
    };


    var renderHeatmap = function () {
        var heatLayer =  L.heatLayer(data, {
            radius: 50,
            blur: 100,
            max: 130
        });
        heatLayer.addTo(map);
    };


    var checkIfMarkerCanBeDrawn = function() {
        if (map.getZoom() > 17) {
            removeMarkersFromMap();
            renderMarkerInBounds();
        } else {
            removeMarkersFromMap();
        }
    };


    var renderMarkerInBounds = function () {
        var bounds = map.getBounds();

        _.forEach(data, function (d) {
            if (bounds.contains(L.latLng(d[0], d[1]))) {
                var marker = L.marker([d[0], d[1]]);
                marker.bindPopup(
                    d[0] + ', ' + d[1] + '<br>RSSI: ' + d[2]*-1 + ' dBm'
                );
                marker.addTo(map);
                currentMarkersOnMap.push(marker);
            }
        });
    };


    var removeMarkersFromMap = function () {
        _.forEach(currentMarkersOnMap, function (marker) {
            marker.removeFrom(map);
        });
    };

})(window, _, Map);


// native ready callback
if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    Map.init();
} else {
    document.addEventListener("DOMContentLoaded", Map.init());
}