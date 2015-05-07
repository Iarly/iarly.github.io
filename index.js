(function () {

    var viewport = {
        width : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    }

    doSetMinHeight();
    doAnchors();
    doThumbs();
    doMap();
    doMyLocation();

    function doSetMinHeight() {
        iterate(document.querySelectorAll("div[background]"), function (section) {
            section.style.minHeight = viewport.height + "px";
        });
    }

    function whereAmI() {
        var now = new Date();
        var hour = now.getHours();

        var casa = { text: "em casa", query: "Belo Horizonte-MG" };
        var cefet = { text: "no CEFET-MG", query: "CEFET-MG Campus 2, Belo Horizonte - MG" };
        var trabalho = { text: "na ControlCorp", query: "Avenida Brasil, 1052, Belo Horizonte - MG" };
        var bandeijao = { text: "no bandeijão", query: "CEFET-MG Campus 2, Belo Horizonte - MG" };

        if (now.getDay() == 0 || now.getDay() == 6)
            return casa;
        if (hour < 7) 
            return casa;
        if (hour < 11) 
            return cefet;
        if (hour < 13)
            return bandeijao;
        if (hour < 18)
            return trabalho;   
        return casa;
    }

    function doMyLocation() {
        document.getElementById("myLocation").innerHTML = whereAmI().text;        
    }

    function doMap() {
        var map;
        var actualPosition = null;
        var directionsDisplay;
        var directionsService = new google.maps.DirectionsService();

        function initialize() {
            directionsDisplay = new google.maps.DirectionsRenderer();
            var mapOptions = {
                draggable: false,
                zoom: 15,
                center: new google.maps.LatLng(-34.397, 150.644)
            };
            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

            var watch = navigator.geolocation.watchPosition(function(position) {
                navigator.geolocation.clearWatch(watch);
                
                var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map.setCenter(latLng);
                actualPosition = latLng;

                /*var marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    title: 'Você'
                });*/

                calcRoute();

            });
            
            directionsDisplay.setMap(map);
        }

        function calcRoute() {
            var start = actualPosition;
            var end = whereAmI().query;
            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                  directionsDisplay.setDirections(response);
                }
            });
        }

        google.maps.event.addDomListener(window, 'load', initialize);
    }

    function doThumbs() {
        var fullscreen_image = document.getElementById("fullscreen_image");
        fullscreen_image.style.display = 'none';
        fullscreen_image.addEventListener('click', function () {
            fullscreen_image.style.display = 'none';
        });

        iterate(document.querySelectorAll("img[thumb]"), function (element) {
            element.addEventListener('click', function () {
                fullscreen_image.style.display = 'inline';
                fullscreen_image.children[0].src = element.src;
            })
        });
    }

    function doAnchors() {
        var anchors = [];

        iterate(document.querySelectorAll("li[anchor]"), function (element) {
            var anchorId = element.getAttribute("anchor");
            element.addEventListener('click', function () {
                location.hash = anchorId;
            })
            anchors.push(anchorId);
        });

        document.addEventListener('scroll', function () {

            iterate(document.querySelectorAll("li[anchor]"), function (element) {
                element.classList.remove('selected');
            });     

            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)      
            
            var nearAnchorId = getNearAnchor(document.body.scrollTop);

            if (nearAnchorId) {
                document.querySelector('li[anchor='+nearAnchorId+']')
                    .classList.add("selected");
            }

            function getNearAnchor(y) {
                var anchorId = null;
                var anchorY = Number.MAX_VALUE;
                for (var i = 0; i < anchors.length; i++) {
                    var anchor = document.getElementById(anchors[i]);
                    if (!anchor) continue;
                    
                    var relativeDistance = y - anchor.offsetTop;
                    var distance = Math.abs(relativeDistance);

                    // Se o objeto ancorado estiver vindo de baixo, o efeito de opacidade deve ser maior...
                    if (relativeDistance < 0)
                        anchor.style.opacity = 1 - distance / viewport.height * 1.2;
                    // De forma contrária, se objeto vier de cima, ele deve demorar mais para sumir, uma vez
                    // que o usuário ainda poderá estar lendo o conteúdo.
                    else 
                        anchor.style.opacity = 1 - distance / viewport.height / 10;

                    if (anchorY > distance) {
                        anchorY = distance;
                        anchorId = anchors[i];
                    }
                }
                return anchorId;
            }

        });

    }

    function iterate(arrayOfElements, fn) {
        for (var i = 0; i < arrayOfElements.length; i++) {
            fn(arrayOfElements[i]);
        }
    }

})();