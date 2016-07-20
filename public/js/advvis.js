$(function() {

  var ticketurl= '/getticket';
  $.ajax({
      url: ticketurl
  })
  .then( function ( ticket ) {
    //visOSMKort(ticket);
    visKort(ticket);
    visData();
  })
  .fail(function( jqXHR, textStatus, errorThrown ) {
    alert('Ingen ticket: ' + jqXHR.statusCode() + ", " + textStatus + ", " + jqXHR.responseText);
  }); 

  var visData= function() {
    var værdi= getQueryVariable('lag');
    værdi= decodeURIComponent(værdi);
    console.log('lag: %s', værdi); 

    var urls= værdi.split('@');

    var promises = [];
    for (var i = 0; i < urls.length; i++) {
      console.log(urls[i]);
      var parametre= {format: 'geojson'};
      var datatype=  corssupported()?"json":"jsonp";
      promises.push($.ajax({url: urls[i], dataType: datatype, data: parametre}));
    };
    $.when.apply($, promises).then(function() {
      var layers = [];
      for (var i = 0; i < arguments.length; i++) {
        var geojsonlayer= L.geoJson(arguments[i], {style: getStyle, onEachFeature: eachFeature, pointToLayer: pointToLayer});
        layers.push(geojsonlayer);
        geojsonlayer.addTo(map);
      } 
      var layergroup= L.featureGroup(layers);     
      map.fitBounds(layergroup.getBounds());
    }, function() {
      for (var i = 0; i < arguments.length; i++) {
        alert(arguments[i]);
      }
    });
  }

  var pointstyle = {
    "color": "red",
    "fillColor": 'red',
    "fillOpacity": 1.,
    "opacity": 1.0,
    "stroke": false, 
    "radius": 5
  };

  var linestyle = {
    "color": "blue",
    "weight": 2,
    "fillOpacity": 0.2
  };

  var eachFeature= function (feature, layer) {
    if ("ejerlavkode" in feature.properties && "matrikelnr" in feature.properties && !("vejnavn" in feature.properties)) {      
      layer.bindPopup("Jordstykke: " + feature.properties.ejerlavkode + " " + feature.properties.matrikelnr);
    }
    else if ("type" in feature.properties && "navn" in feature.properties) {  
      layer.bindPopup(feature.properties.navn + " (" + feature.properties.type + ")");
    }
    else if ("kode" in feature.properties && "navn" in feature.properties) {  
      layer.bindPopup(feature.properties.kode + " " + feature.properties.navn);
    }
     else if ("nr" in feature.properties && "navn" in feature.properties) {  
      layer.bindPopup(feature.properties.nr + " " + feature.properties.navn);
    }
    else if ("vejnavn" in feature.properties && "husnr" in feature.properties) {  
      layer.bindPopup(feature.properties.vejnavn + " " + feature.properties.husnr + ", " + (feature.properties.supplerendebynavn?feature.properties.supplerendebynavn+", ":"") + feature.properties.postnr + " " + feature.properties.postnrnavn);
    }
  }

  var pointToLayer= function(featureData, latlng) {
    return L.circleMarker(latlng, pointstyle);
  }

  var getStyle= function(featureData) {
    var style;
    if (featureData.geometry.type==='Point') {
      style= pointstyle;
    }
    else {
      style= linestyle;
    }
    return style;
  }

});