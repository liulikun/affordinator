
function initialize() {
    var secheltLoc = new google.maps.LatLng(-37.813581, 144.963226);

    var myMapOptions = {
        zoom: 12,
        center: secheltLoc,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        panControl: true,
        panControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        }
    };
    var theMap = new google.maps.Map(document.getElementById("map_canvas"), myMapOptions);

//    var customMarker = 'img/icon.png';
//
//    var marker = new google.maps.Marker({
//        map: theMap,
//        draggable: true,
//        position: new google.maps.LatLng(-37.813581, 144.963226),
//        visible: true,
//        icon: customMarker
//    });
//
//    var boxText = document.createElement("div");
//    boxText.style.cssText = "border: 1px solid #000; border-radius: 4px; margin-top: 8px; color: #fff; background: rgba(0, 0, 0, 1); padding: 5px;";
//    boxText.innerHTML = "<h1>Melbourne</h1>Victoria, Australia";
//
//    var myOptions = {
//        content: boxText,
//        disableAutoPan: false,
//        maxWidth: 0,
//        pixelOffset: new google.maps.Size(-140, -120),
//        zIndex: null,
//        boxStyle: {
//            background: "url('tipbox.gif') no-repeat",
//            opacity: 0.75,
//            width: "280px"
//        },
//        closeBoxMargin: "10px 2px 2px 2px",
//        closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
//        infoBoxClearance: new google.maps.Size(1, 1),
//        isHidden: true,
//        pane: "floatPane",
//        enableEventPropagation: false
//    };
//
//    var ib = new InfoBox(myOptions);
//
//    google.maps.event.addListener(marker, "click", function (e) {
//        ib.open(theMap, this);
//    });
//    ib.open(theMap, marker);

    initButton(theMap);

}

if (!google.maps.Polygon.prototype.getBounds) {

        google.maps.Polygon.prototype.getBounds = function(latLng) {

                var bounds = new google.maps.LatLngBounds();
                var paths = this.getPaths();
                var path;

                for (var p = 0; p < paths.getLength(); p++) {
                        path = paths.getAt(p);
                        for (var i = 0; i < path.getLength(); i++) {
                                bounds.extend(path.getAt(i));
                        }
                }

                return bounds;
        }

}


function initButton(theMap) {
    var polygons = [];
    var infoBoxes = [];
    $('#submit').bind('click', function(e) {
        $.ajax({
            url: "subs?type=" + $('input[name=type]:checked').val() + '&min-price=' + $('#min-price').val() + '&max-price=' + $('#max-price').val(),
            success: function(suburbs) {
                if (suburbs) {
                    clearPolygons(polygons);
                    clearInfoBoxes(infoBoxes);
                    var subs = JSON.parse(suburbs);
                    for (var j = 0; j < subs.length; j++) {
                        var points = subs[j].boundary.split(',');
                        var latLongs = [];
                        for (var i = 0; i < points.length; i++) {
                            var latLong = points[i].replace(/^\s+|\s+$/g, '').split(' ');
                            var lat = latLong[1] * 1;
                            var long = latLong[0] * 1;
                            latLongs.push(new google.maps.LatLng(lat, long));
                        }

                        console.log(latLongs);
                        var polygon = new google.maps.Polygon({
                            paths: latLongs,
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#FF0000",
                            fillOpacity: 0.35
                        });
                        polygon.setMap(theMap);
                        polygons.push(polygon);

                        var center = polygon.getBounds().getCenter();
                        var marker = new google.maps.Marker({
                            map: theMap,
                            draggable: true,
                            position: center,
                            visible: false
                        });

                        
                        var formattedPrice = $('input[name=type]:checked').val() == 'house' ? Math.round(subs[j]['house_price']/1000) + 'k' : Math.round(subs[j]['unit_price']/1000) + 'k';
                        var boxText = document.createElement("div");
                        boxText.style.cssText = "border: 1px solid #000; border-radius: 4px; font-size: 11px; text-align: center; margin-top: 8px; color: #fff; background: rgba(0, 0, 0, 1); padding: 5px;";
                        //boxText.innerHTML = "<strong>" + subs[j]['suburb'] + "</strong><br /><span>$" + formattedPrice + "</span>";
                        boxText.innerHTML = "<span>$" + formattedPrice + "</span>";

                        var myOptions = {
                            content: boxText,
                            disableAutoPan: true,
                            maxWidth: 0,
                            pixelOffset: new google.maps.Size(-22, -18),
                            zIndex: null,
                            boxStyle: {
                                opacity: 0.75
                            },
                            closeBoxMargin: "2px 2px 2px 2px",
                            closeBoxURL: "",
                            infoBoxClearance: new google.maps.Size(1, 1),
                            isHidden: false,
                            pane: "floatPane",
                            enableEventPropagation: false
                        };

                        var ib = new InfoBox(myOptions);
                        ib.open(theMap, marker);
                        infoBoxes.push(ib);
                    }
                }
            }
        });
        return false;
    });
}

function clearPolygons(polygons) {
    while (polygons.length > 0) {
        var polygon = polygons.pop();
        polygon.setMap(null);
    }
}

function clearInfoBoxes(infoBoxes) {
    while (infoBoxes.length > 0) {
        var infoBox = infoBoxes.pop();
        infoBox.close();
    }
}
