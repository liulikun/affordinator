function initialize() {
    var secheltLoc = new google.maps.LatLng(-37.813581, 144.963226);

    var myMapOptions = {
        zoom: 8,
        center: secheltLoc,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    var theMap = new google.maps.Map(document.getElementById("map_canvas"), myMapOptions);

    var customMarker = 'img/icon.png';

    var marker = new google.maps.Marker({
        map: theMap,
        draggable: true,
        position: new google.maps.LatLng(-37.813581, 144.963226),
        visible: true,
        icon: customMarker
    });

    var boxText = document.createElement("div");
    boxText.style.cssText = "border: 1px solid #000; margin-top: 8px; color: #fff; background: rgba(0, 0, 0, 1); padding: 5px;";
    boxText.innerHTML = "<h1>Melbourne</h1>Victoria, Australia";

    var myOptions = {
        content: boxText
        ,disableAutoPan: false
        ,maxWidth: 0
        ,pixelOffset: new google.maps.Size(-140, -120)
        ,zIndex: null
        ,boxStyle: {
            background: "url('tipbox.gif') no-repeat"
            ,opacity: 0.75
            ,width: "280px"
        }
        ,closeBoxMargin: "10px 2px 2px 2px"
        ,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
        ,infoBoxClearance: new google.maps.Size(1, 1)
        ,isHidden: false
        ,pane: "floatPane"
        ,enableEventPropagation: false
    };

    google.maps.event.addListener(marker, "click", function (e) {
        ib.open(theMap, this);
    });

    var ib = new InfoBox(myOptions);
    ib.open(theMap, marker);

    initButton();

}

function initButton() {
    $('#submit').bind('click', function(e) {
        $.ajax({
            url: "subs?type=" + $('input[name=type]:checked').val() + '&min-price=' + $('#min-price').val() + '&max-price=' + $('#max-price').val(),
            success: function(subs) {
                if (subs) {
                    console.log(subs);
                }
            }
        });
        return false;
    });
}
