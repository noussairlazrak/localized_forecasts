$(document).ready(function() {
    $('body').on('click', '.nl_wave_routing', function() {
        var page = $(this).attr('href');
        $(".loading_div").fadeIn(10);
        var messages = ["please wait...", "connecting...."];
        setInterval(function() {
            var message = messages[Math.floor(Math.random() * messages.length)];
            $(".messages").html(message)
        }, 100);

        $(".forecasts_container").load("vues/" + page, function() {
            $(this).fadeOut(10);
            $(this).fadeIn(10);
            $(".forecasts_ container").addClass("noussair_animations zoom_in");
            $(".loading_div").fadeOut(10);
        });
        return false;
    });



});

mapboxgl.accessToken = 'pk.eyJ1IjoibGF6cmFrbiIsImEiOiJjanZodzV3OXUwNmEwNDRxdnVsZGhnaml4In0.-ES_Lt127Id6DEf8H9E3rg';

var deltaDegrees = 25;

function easing(t) {
    return t * (2 - t);
}


function pollutant_details(code) {
    var pollutant_details = [];
    if (code == "no2" || code == "1") {
        pollutant_details.name = "<b>Nitrogen Dioxide</b> (NO<sub>2</sub>)";
        pollutant_details.id= 1;
    }

    if (code == "so2" || code == "2") {
        pollutant_details.name = "<b>Sulfur Dioxide</b> (SO<sub>2</sub>)";
        pollutant_details.id= 2;
    }
    if (code == "pm25" || code == "3") {
        pollutant_details.name = "<b>Particulate Matter</b> (PM<sub>2.5</sub>)";
        pollutant_details.id= 3;
    }

    if (code == "o3" || code == "4") {
        pollutant_details.name = "<b>Ozone</b> (O<sub>3</sub>)";
        pollutant_details.id= 4;
    }

    return pollutant_details;
}



function add_marker(map, lat, long, open_aq_id, param, site) {

    var station_id = document.createAttribute("station_id");
    var parameter = document.createAttribute("parameter");
    var location_name = document.createAttribute("location_name");
    var observation_value = document.createAttribute("observation_value");
    var current_observation_unit = document.createAttribute("current_observation_unit");

    if(site.site_data.obs_source == 's3'){
        location_name.value = site.site_data.location.replace(/\s/g, '_');
        observation_value.value = '--';
        current_observation_unit.value = site.obs_options.pm25.unit;
    }
    else{
        if ($.isArray(site.latest_measurments)){
            $.each(site.latest_measurments, function(key, value) {
                if (value.parameter == param) {
                    location_name.value = site.site_data.location.replace(/\s/g, '_');
                    observation_value.value = value.value;
                    current_observation_unit.value = value.unit;
                }
        
            });
        }
    }
   
    

    station_id.value = open_aq_id;
    parameter.value = param;


    var site = [lat, long];
    var el_open_aq_id = document.createElement('div');

    el_open_aq_id.id = 'marker_' + open_aq_id;
    el_open_aq_id.className += " btn-floating pulse launch-local-forecasts";
    el_open_aq_id.setAttributeNode(station_id);
    el_open_aq_id.setAttributeNode(parameter);
    el_open_aq_id.setAttributeNode(location_name);
    el_open_aq_id.setAttributeNode(observation_value);
    el_open_aq_id.setAttributeNode(current_observation_unit);
    new mapboxgl.Marker(el_open_aq_id)
        .setLngLat(site)
        .addTo(map);
}




function get_forecasts(sites) {
    sites.forEach((element) => {
        add_marker(map, 30.417130, -9.599250, "739");
    });
}

function get_obeservation(openaq_id) {
    fetch('https://r6datuje8k.us-east-1.awsapprunner.com/noussair.lazrak/api/read_openaq_test', {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:8888',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers ': 'Origin, Content-Type, Accept',
                'Content-Type': 'application/json',
                'x-api-key': 'Al7sQWDKzXh3VK19eJ0f3s5Ed40'
            },
            body: JSON.stringify({
                "url": "https://api.openaq.org/v2//measurements?date_from=2019-01-01T00%3A00%3A00%2B00%3A00&date_to=2022-02-01T00%3A00%3A00%2B00%3A00&limit=10000&page=1&offset=0&sort=asc&radius=1000&location_id=10812&parameter=pm25&order_by=datetime"
            })
        }).then(res => res.json())
        .then(res => console.log(res));
}

function get_open_aq_observations(site_id, param) {
    var openaq = {};
    openaq.site_data = [];
    openaq.site_data.openaq_id = "";
    openaq.site_data.location = "";
    openaq.site_data.latitude = "";
    openaq.site_data.longitude = "";
    openaq.site_data.status = 'active';
    openaq.meta_data = "";
    openaq.latest_update = "";
    openaq.latest_n02 = "";
    openaq.latest_03 = "";
    openaq.latest_SO2 = "";
    openaq.latest_pm25 = "";
    openaq.latest_measurments = [];
    $.ajax({
        async: false,
        type: 'GET',
        url: 'https://api.openaq.org/v2/latest?limit=100&page=1&offset=0&sort=desc&radius=1000&order_by=lastUpdated&dumpRaw=false&location_id=' + site_id + '',

        success: function(data) {


            openaq.site_data.openaq_id = site_id;
            openaq.site_data.location = data.results[0].location;
            openaq.site_data.latitude = data.results[0].coordinates.latitude;
            openaq.site_data.longitude = data.results[0].coordinates.longitude;
            openaq.site_data.status = 'active';
            openaq.meta_data = "data is now updated";
            openaq.latest_n02 = data.results[0].measurements.longitude;
            openaq.latest_03 = "";
            openaq.latest_SO2 = "";
            openaq.latest_pm25 = "";
            openaq.latest_measurments = data.results[0].measurements;




        },
        error: function(data) {
            console.log(data);

        },
    });
    return Promise.resolve(openaq);
}

function create_map(sites, param) {
    var deltaDistance = 100;
    var center_point = [30.1272444, -1.9297706];
    var map = new mapboxgl.Map({
        style: 'mapbox://styles/lazrakn/ck2g4kozj0q3w1cmx5tig3gnp',
        center: center_point,
        zoom: 2,
        pitch: 0,
        bearing: 0,
        container: 'map',
        cluster: true,
        clusterMaxZoom: 2, 
        clusterRadius: 2
    });
    map.on('load', () => {
        map.addSource('locations_dst', {
            type: 'geojson',
            data: 'https://www.noussair.com/get_data.php?type=location2&param=pm25',
            cluster: true,
            clusterMaxZoom: 10, 
            clusterRadius: 2 
        });
    
        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'locations_dst',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#51bbd6',
                    100,
                    '#f1f075',
                    750,
                    '#f28cb1'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,
                    100,
                    30,
                    750,
                    40
                ]
            }
        });
    
        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'locations_dst',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });
    
        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'locations_dst',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': [
                    'case',
                ["<=", ["get", "forecasted_value"], 20], "#fbb03b",
                [">=", ["get", "forecasted_value"], 20], "#e55e5e",
                [">", ["get", "forecasted_value"], 30], "#3bb2d0",
                "#ccc"

                    ],
                'circle-radius': 6,
                'circle-stroke-width': 0,
                'circle-stroke-color': 'black'
            }
        });
        // Add a heatmap layer to the map
        // Set up the Earth Engine API client
        var earthEngineApiScript = document.createElement('script');
        earthEngineApiScript.src = 'https://ajax.googleapis.com/ajax/libs/earthengine/0.1.343/earthengine-api.min.js';
        
        // Append the script element to the head of the document
        document.head.appendChild(earthEngineApiScript);
        
        // Wait for the Earth Engine API to load and initialize
        earthEngineApiScript.onload = function() {
          ee.initialize();
          var collection = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
          .filterDate('2022-01-01', '2022-01-31')
          .select('NO2_column_number_density')
          .mean();

          // Once the map has loaded, add the heatmap layer
        map.on('load', function () {
            // Convert the Earth Engine image to a raster tileset using the Earth Engine API
            var url = collection.getThumbURL({
                dimensions: '512',
                region: '-180,-90,180,90'
            });
    
            // Add the raster tileset to the map as a raster source
            map.addSource('no2', {
                'type': 'raster',
                'tiles': [url],
                'tileSize': 512,
                'maxzoom': 12
            });
    
            // Add a heatmap layer to the map using the raster source
            map.addLayer({
                'id': 'no2-heatmap',
                'type': 'heatmap',
                'source': 'no2',
                'maxzoom': 12,
                'paint': {
                // Increase the heatmap weight based on frequency and property magnitude
                'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['get', 'heatmapDensity'],
                    0, 0,
                    1, 1
                ],
                // Increase the heatmap color weight weight by zoom level
                // heatmap-intensity is a multiplier on top of heatmap-weight
                'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 1,
                    12, 3
                ],
                // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                // Begin color ramp at 0-stop with a 0-transparancy color
                // to create a blur-like effect.
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(33,102,172,0)',
                    0.2, 'rgb(103,169,207)',
                    0.4, 'rgb(209,229,240)',
                    0.6, 'rgb(253,219,199)',
                    0.8, 'rgb(239,138,98)',
                    1, 'rgb(178,24,43)'
                ],
                // Adjust the heatmap radius by zoom level
                'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 2,
                    12, 20
                ],
                // Transition from heatmap to circle layer by zoom level
                'heatmap-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    7, 1,
                    9, 0
                ]
                }
            });
            });
          // Your Earth Engine code goes here...
        }

        // Define the Earth Engine image collection and date range of interest
      
    
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('locations_dst').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;
    
                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: 10
                    });
                }
            );
        });
        
            
    })

    

    var list_in = [];
    map.on("sourcedata", function(e) {
        if (map.getSource('locations_dst') && map.isSourceLoaded('locations_dst')) {
            var features = map.querySourceFeatures('locations_dst');
            $.each(features, function(index, site) {
                if(site.properties.location_id){
                    var l_id =site.properties.location_id;
                    if (!~$.inArray(l_id,list_in))  {
                        add_the_banner(site.properties, 'pm25')
                        list_in.push(l_id);
                       
                    }
                }
               
            });  
        }
    });
    



    map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const location_id = e.features[0].properties.location_id;
        const location_name = e.features[0].properties.location_name.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-')
        const status = e.features[0].properties.status;
        const observation_source = e.features[0].properties.observation_source;
        const observation_value = e.features[0].properties.forecasted_value;
        

        const precomputed_forecasts = $.parseJSON(e.features[0].properties.precomputed_forecasts);
        const obs_option =  $.parseJSON( e.features[0].properties.obs_options);
        const observation_unit= obs_option[0].pm25.unit;
        console.log(observation_unit);
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                `location_id: ${location_id}<br>Was there a location_name?: ${location_name}`
            ).on('open', e => {

                open_forecats_window (["Loading", "Please hold"], location_id, 'pm25', location_name, observation_value, observation_unit, observation_source, precomputed_forecasts[0].pm25.forecasts)

                //open_forecats_window (messages, st_id, param, location_name, observation_value, current_observation_unit, obs_src,precomputer_forecasts)
       
            })
           
            .addTo(map);


            
        
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });


    return map;
}

function add_the_banner(site, param) {
    
    precomputed_forecasts = $.parseJSON(site.precomputed_forecasts)
    obs_options =  $.parseJSON(site.obs_options)
    if(site.observation_source){
        
        const obj = document.getElementsByClassName("observation_value");
        animateValue(obj, 100, 0, 5000);
        var html = '<div class="col-md-3 single-pollutant-card swiper-slide-desactivates"> <a class="launch-local-forecasts" obs_src ="s3" parameter="' + param + '" station_id="' + site.location_id + '" location_name="' + site.location_name.replace(/ /g,"_") + '" observation_value= "' + site.forecasted_value + '" current_observation_unit= "' + obs_options[0].pm25.unit+ ' " latitude="' + site.location_name + '" longitude="' + site.location_name + '" lastUpdated="--" precomputed_forecasts = '+precomputed_forecasts[0].pm25.forecasts+'> <div class="item-inner"> ' + site.location_name.replace(/\_/g, ' ').replace(/\./g, ' ')    + ' <div class="card shadow-none forecasts-item text-white"> <div class="card-body-desactivated"> <h5 class="location_name"> ' + pollutant_details(param).name + '</h5> <span class="last_update_widget"> Last model update: '+(new Date()).toISOString().split('T')[0]+' </span><h1 class="observation_value">----<span class="observation_unit">' + obs_options[0].pm25.unit+ ' </span> </h1> <span class="source">Forecasts Source: '+site.observation_source+'</span> </div> </div> </div> </a> </div>';
        $(".pollutant-banner-o").prepend(html);

        

    }

}

function add_locations_banner(site, param) {
    console.log('site');
    console.log(site);
    if(site.site_data.obs_source == 's3'){
        const obj = document.getElementsByClassName("observation_value");
        animateValue(obj, 100, 0, 5000);
        console.log(site);
        var html = '<div class="col-md-3 single-pollutant-card swiper-slide-desactivates"> <a class="launch-local-forecasts" obs_src ="s3" parameter="' + param + '" station_id="' + site.site_data.openaq_id + '" location_name=' + site.site_data.location + ' observation_value= "--" current_observation_unit= "--" latitude="' + site.site_data.latitude + '" longitude="' + site.site_data.longitude + '" lastUpdated="--"> <div class="item-inner"> ' + site.site_data.location.replace(/\_/g, ' ').replace(/\./g, ' ')    + ' <div class="card shadow-none forecasts-item text-white"> <div class="card-body-desactivated"> <h5 class="location_name"> ' + pollutant_details(param).name + '</h5> <span class="last_update_widget"> Last update: '+(new Date()).toISOString().split('T')[0]+' </span><h1 class="observation_value">--<span class="observation_unit">' + site.obs_options.pm25.unit+ ' </span> </h1> <span class="source">Source: S3 Local Data</span> </div> </div> </div> </a> </div>';
        $(".pollutant-banner-o").append(html);
    }
    else{
        if ($.isArray(site.latest_measurments)){
            $.each(site.latest_measurments, function(key, value) {
                if (value.parameter == param) {
                    var observation_value = value.value;
                    var observation_unit = value.unit;
                    if (observation_value === -999 || observation_value < 0){
                        observation_value = "--";
                        observation_unit = "";
                    }
                    const obj = document.getElementsByClassName("observation_value");
                    animateValue(obj, 100, 0, 5000);
                    var html = '<div class="col-md-3 single-pollutant-card swiper-slide-desactivates"> <a class="launch-local-forecasts" obs_src ="openaq" parameter="' + param + '" station_id="' + site.site_data.openaq_id + '" location_name=' + site.site_data.location.replace(/\s/g, '_') + ' observation_value=' + observation_value.toString().substring(0, 6) + ' current_observation_unit=' + observation_unit + ' latitude="' + site.site_data.latitude + '" longitude="' + site.site_data.longitude + '" lastUpdated="' + value.lastUpdated + '"> <div class="item-inner"> ' + site.site_data.location + ' <div class="card shadow-none forecasts-item text-white"> <div class="card-body-desactivated"> <h5 class="location_name"> ' + pollutant_details(param).name + '</h5> <span class="last_update_widget"> Last update: ' + value.lastUpdated + '</span><h1 class="observation_value">' + observation_value.toString().substring(0, 6) + '<span class="observation_unit">' + observation_unit + '</span> </h1> <span class="source">Source: OpenAQ</span> </div> </div> </div> </a> </div>';
                    $(".pollutant-banner-o").append(html);
                }
        
            });
        }
    }
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}


function get_all_sites_data(sites, param) {
    let all_sites = [];
            
        $.each(sites, function(index, site) {
            if (site.observation_source == 'openaq'){

                console.log("this is openaq data: " + index)
                
                get_open_aq_observations(index, param).then((site_data) => all_sites.push(site_data));
            }
            else{
                var location = {};
                location.site_data = [];
    
                location.site_data.openaq_id = index;
                location.site_data.location = site.location_name;
                location.site_data.latitude = site.lat;
                location.site_data.longitude = site.lon;
                location.site_data.status = site.status;
                location.site_data.obs_source = site.observation_source;
                location.obs_options = site.obs_options;
                location.meta_data = "data is now updated";
                location.latest_n02 = "---";
                location.latest_03 = "---";
                location.latest_SO2 = "---";
                location.latest_pm25 = "---";
                
                location.latest_measurments = "---";
                all_sites.push(location)
            }           

    });



    return Promise.resolve(all_sites);
}

function csvToArray(str, delimiter = ",") {
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
    const arr = rows.map(function(row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function(object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });

    return arr;
}


function read_api_baker(location,param,unit,forecasts_div,button_option=false, historical=2, reinforce_training=2,hpTunning=2 ){
    var title = 'Near Realtime Forecasts';
    if (button_option){
        $('.plot_additional_features').append('<button type="button" change_to="'+forecasts_div+'" class="btn btn-outline-primary change_plot '+forecasts_div+'_color"  href="#">'+title+'</button>');
    }
   
    $("."+forecasts_div).empty();
    $(".overlay-api-baker").fadeIn(10);
    var messages = ["Generating data", "Connecting to SMCE", "Fetching the data from API Baker", "Fetching data from GMAO FTP", "Fetching observations", "Getting the forecasts", "Please wait...", "Connecting...."];
    setInterval(function() {
        var message = messages[Math.floor(Math.random() * messages.length)];
        $(".overlay-api-baker").html(message)
    }, 4000);
    
    var param_code = pollutant_details(param).id
    var file_url = "https://www.noussair.com/get_data.php?type=apibaker&st="+location+"&param="+param_code+"&historical="+historical+"&reinforce_training="+reinforce_training+"&hpTunning="+hpTunning+"&latest_forecat=2";
    console.log(file_url);
    $.ajax({
        url: file_url, 
        success: function() { 
            d3.json(file_url, function(error, data) {
                if (error) {
                    alert(error);
                }
                
                if(data){

                    master_datetime = []
                    master_observation = []
                    master_localized = []
                    master_uncorrected = []
                    residuals = []
                    master_data = []

                    data_str = data.replace(/NaN/g, '""')
                    data_str = JSON.parse(data_str);
                    
                    

                    master_data.master_datetime_2023 = data_str.forecasts.time;
                    master_data.master_observation_2023 = data_str.forecasts.value;
                    master_data.master_localized_2023 = data_str.forecasts.prediction;
                    master_data.master_uncorrected_2023 = data_str.forecasts.pm25_rh35_gcc;
                    draw_plot(master_data,param,unit,forecasts_div,title,false, button = false,[2023] )



                    $('.retrain_model').attr("param",param);
                    $('.retrain_model').attr("site",location);
                    $('.retrain_model').attr("unit",unit);
                    
                    
                    $('.model_data').html('<h1>Model information</h1> <ul><li>Total observations: '+data_str.metrics.total_observation+'</li><li>Last model update: '+data_str.metrics.latest_training.substring(0, 19)+'</li><li>Mean Square Error:  <b> Before training</b> -> '+data_str.metrics["mse before training"]+' | <b>After training </b> -> '+data_str.metrics["mse after training"]+' </li><li>Mean Absolute Error: <b> Before training</b> -> '+data_str.metrics["mae before training"]+' | <b>After training </b> -> '+data_str.metrics["mae after training"]+' </li><li>R2 Score: <b> Before training</b> -> '+data_str.metrics["r2 before training"]+' | <b>After training </b> -> '+data_str.metrics["r2 after training"]+' </li></ul><span class="model_general_info">Bias-corrected model is provided for dates between '+data_str.metrics.start_date.substring(0, 10)+' and '+data_str.metrics.end_date.substring(0, 10)+' </span>');

                }
                else {
                   console.log("ERROR");
                }
                
            });
            $(".overlay-api-baker").fadeOut(10);
        },
    });
}



function combine_historical_and_forecasts(location_name, param, unit, forecasts_div){

    var file_name = location_name + '_' + param;
    
    
    var historical_simulation = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/forecast_latest_" + file_name+'_historical.json';

    var forecasts_url = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/forecast_latest_" + file_name+'.json';
    

    var list_of_files = [historical_simulation, forecasts_url];
    var forecast_initialization_date = "";
    var master_datetime =[]; 
    var master_observation =[];
    var master_observation_resample =[];
    var master_localized =[]; 
    var master_localized_resample =[]; 
    var master_uncorrected =[];
    var master_uncorrected_resample =[];

    var combined_dataset = {};
    var dataset_year1 = {};
    var dataset_year2 = {};
    var combined_dataset = {};
    var dates_ranges = [];
    var activate_number = 0;
    var year = new Date().getFullYear()
    list_of_files.forEach(function(file_url, index){
        console.log("year: " +year)
        $.ajax({
            url: file_url, 
            async: false,
            timeout: 30000,
            success: function() { 
                d3.json(file_url, function(error, data) {
                    if (error) {
                        alert(error);
                    }
                    
                    if(data){
                        var pure_data = csvToArray(data.latest_forecast.data);
    
    
                        var date_time = $(pure_data).map(function() {
                            return this.forecast_datetime;
                        }).get()


                        var date_time_uncorrected = $(pure_data).map(function() {
                            return this.forecast_datetime;
                        }).get()
          
                        forecast_initialization_date = data.latest_forecast.forecast_initialization_date;
    
                        var localized = $(pure_data).map(function() {
                            if (param == "no2") {
                                return this.localized_no2
                            }
                            if (param == "o3") {
                                return this.localized_o3
                            }
                            if (param == "pm25") {
                                return this.localized_pm25
                            }
    
                        }).get()

                        
                        
                       
                        var uncorrected = $(pure_data).map(function() {
                            if (param == "no2") {
                                return this.uncorrected_no2
                            }
                            if (param == "o3") {
                                return this.uncorrected_o3
                            }
                            if (param == "pm25") {
                                return this.luncorrected_pm25
                            }
                        }).get()
    
                        var observation_resample = $(pure_data).map(function() {
                            if (param == "no2") {
                                return this.observation_24H
                            }
                            if (param == "o3") {
                                return this.observation_8H
                            }
                            if (param == "pm25") {
                                return this.observation_24H
                            }
    
                        }).get()
                       

                        var resample_window = 24;
                        var localized_resample = $(pure_data).map(function() {
                            if (param == "no2") {
                                resample_window = 24;
                                return this.localized_no2_24H
                            }
                            if (param == "o3") {
                                resample_window = 8;
                                return this.localized_o3_8H
                            }
                            if (param == "pm25") {
                                resample_window = 24;
                                return this.localized_pm25_24H
                            }
    
                        }).get()
    
                        var uncorrected_resample = $(pure_data).map(function() {
                            if (param == "no2") {
                                return this.uncorrected_no2_24H
                            }
                            if (param == "o3") {
                                return this.uncorrected_o3_8H
                            }
                            if (param == "pm25") {
                                return this.uncorrected_pm25_24H
                            }
    
                        }).get()
    
                        var observation = $(pure_data).map(function() {
                            return this.observation;
                        }).get()
    



                       // combined_dataset["forecast_initialization_date_"+year] = forecast_initialization_date;
    
                        combined_dataset["master_datetime_"+year] = date_time;
                        combined_dataset["master_observation_"+year] = observation;
                        combined_dataset["master_observation_resample_"+year] = observation_resample;
                        combined_dataset["master_localized_"+year] = localized;
                        combined_dataset["master_uncorrected_"+year] = uncorrected;
      
                        activate_number = activate_number + 1;
                        year = year + 1;



                        dates_ranges.push(date_time[0].toString());
                        dates_ranges.push(date_time.slice(-2, -1).toString());
                        
                        if(activate_number == 2){
                            draw_plot(combined_dataset,param,unit,forecasts_div,'Historical Simulation Comparison',false, button= true,  [2022,2023])
                        }
                        
                      
                    }
                    else {
                        $('.forecasts-view').html("Sorry, data not available for "+param+" in this location");
                    }
                    
                });
    
            },
            error: function(jqXHR, status, er) {
                if (jqXHR.status === 404) {
                    $('.forecasts-view').html("Sorry, PLOT ISSUE, please retry");
                }
    
            }
        });
        
    })
    


    return combined_dataset;
    
}

function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
}

function draw_plot(combined_dataset,param,unit,forecasts_div,title, dates_ranges = ["2021-04-20","2023-02-10"], button=false, years=false){
    var plot = []
    var line_type = ""
   if(years){
    
    years.forEach(function(year, index){
        var title = " "
        if(years.length > 2){
            var title = year
        }
        
       
        // define the range of dates you are interested in
        var start_date = new Date('2020-01-01');
        var end_date = new Date('2023-03-08');

        // create a list of all the dates in the range
        var all_dates = [];
        var current_date = start_date;
        while (current_date <= end_date) {
        all_dates.push(current_date.toISOString().split('T')[0]);
        current_date.setDate(current_date.getDate() + 1);
        }

        // get the data from your JSON file
        var localized_data = combined_dataset["master_localized_"+year];
        var uncorrected_data = combined_dataset["master_uncorrected_"+year];
        var observation_data = combined_dataset["master_observation_"+year];
        var datetime_data = combined_dataset["master_datetime_"+year];

        // check which dates are missing
        var missing_dates = all_dates.filter(function(date) {
        return datetime_data.indexOf(date) === -1;
        });

        // remove the data points for the missing dates
        missing_dates.forEach(function(date) {
        var index = datetime_data.indexOf(date);
        if (index >= 0) {
            localized_data.splice(index, 1);
            uncorrected_data.splice(index, 1);
            observation_data.splice(index, 1);
            datetime_data.splice(index, 1);
        }
        });

        // create the plotly traces
        var master_localized = {
        type: "scatter",
        mode: "lines",
        connectgaps: false,
        x: datetime_data,
        y: localized_data,
        line: {
            color: 'rgba(59, 59, 59, 0.8)',
            width: 3
        },
        name: 'ML + Model '
        };

        var master_uncorrected = {
        type: "scatter",
        mode: "lines",
        connectgaps: false,
        x: datetime_data,
        y: uncorrected_data,
        line: {
            color: 'rgba(142, 142, 142, 0.8)',
            width: 3
        },
        name: 'Model'
        };

        var master_observation = {
        type: "scatter",
        mode: "lines",
        connectgaps: false,
        x: datetime_data,
        y: observation_data,
        line: {
            color: 'rgba(255, 0, 0, 0.8)',
            width: 3
        },
        name: 'Observation'
        };

        if (index == 1) {
        master_observation.line = {dash: 'dashdot', width: 4};
        master_localized.line = {dash: 'dashdot', width: 4};
        master_uncorrected.line = {dash: 'dashdot', width: 4};
        }

        // add the traces to the plot
        plot.push(master_localized);
        plot.push(master_uncorrected);
        plot.push(master_observation);

    });
   }
   

        var layout = {
            title: title,
            legend: {
                orientation: 'h',
                y: 1.2
              },
            font: {
                family: 'Manrope, sans-serif',
                size: 18,
                color: 'rgb(0 0 0)'
            },
            xaxis: {
                type: 'date'
            },
    
            yaxis: {
                autorange: true,
                type: 'linear',
                title: param+' ' +'[ '+ unit +']',
    
            }
        };


    if(dates_ranges){
        layout.shapes = [
            {
            type: 'rect',
            x0: dates_ranges[0],
            y0: 0,
            x1: dates_ranges[1],
            y1: 1,
            yref: 'paper',
            fillcolor: '#00ffff2e',
            line: {
                color: 'rgb(55, 128, 191)',
                width: 0.5
            }
            },
            {
                type: 'rect',
                x0: dates_ranges[2],
                y0: 0,
                x1: dates_ranges[3],
                y1: 1,
                yref: 'paper',
                fillcolor: '#00ffa973',
                line: {
                color: 'green',
                width: 0.5
                }
            }
        ]
    }


    

        Plotly.newPlot(forecasts_div, plot, layout);
        
        if(button){
            $('.plot_additional_features').append('<button type="button" change_to="'+forecasts_div+'" class="btn btn-outline-primary change_plot '+forecasts_div+'"  href="#">'+title+'</button>');
        }
       
        

    
}

function side_by_side_plots(param, unit, title, precomputer_forecasts){
    $(document).ready(function() {

        var year1_file = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/" + precomputer_forecasts;
        var year2_file = year1_file.replace('.json', '_historical.json');
        
        
        $.getJSON(year1_file, function(data) {
          var currentYearData = data.latest_forecast.data.split('\n').slice(1,-1);
          var currentYearUncorrected = currentYearData.map(function(row) {
            return row.split(',')[1];
          });
          var currentYearLocalized = currentYearData.map(function(row) {
            return row.split(',')[2];
          });
          var currentYearObservation = currentYearData.map(function(row) {
            return row.split(',')[3];
          });
          var currentYearUncorrectedTrace = {
            name: 'Current Year Model',
            y: currentYearUncorrected,
            type: 'scatter'
          };
          var currentYearLocalizedTrace = {
            name: 'Current Year Model + ML',
            y: currentYearLocalized,
            type: 'scatter'
          };
          var currentYearObservationTrace = {
            name: 'Current Year Observation',
            y: currentYearObservation,
            type: 'scatter'
          };
          $.getJSON(year2_file, function(data) {
            var previousYearData = data.latest_forecast.data.split('\n').slice(1,-1);
            var previousYearUncorrected = previousYearData.map(function(row) {
              return row.split(',')[1];
            });
            var previousYearLocalized = previousYearData.map(function(row) {
              return row.split(',')[2];
            });
            var previousYearObservation = previousYearData.map(function(row) {
              return row.split(',')[3];
            });
            var previousYearUncorrectedTrace = {
              name: 'Previous Year Model',
              y: previousYearUncorrected,
              type: 'scatter'
            };
            var previousYearLocalizedTrace = {
              name: 'Previous Year Model + ML',
              y: previousYearLocalized,
              type: 'scatter'
            };
            var previousYearObservationTrace = {
              name: 'Previous Year Observation',
              y: previousYearObservation,
              type: 'scatter'
            };
            var data = [
              currentYearUncorrectedTrace,
              currentYearLocalizedTrace,
              currentYearObservationTrace,
              previousYearUncorrectedTrace,
              previousYearLocalizedTrace,
              previousYearObservationTrace
            ];
            var layout = {
              title: title,
              xaxis: {
                title: 'Datetime'
              },
              yaxis: {
                title: param+ ' Concentration ('+unit+')'
              },
              legend: {
                x: 1,
                y: 1
              }
            };
            Plotly.newPlot('comparaison_plot_js', data, layout);
          });
        });

        $('.plot_additional_features').append('<button type="button" change_to="comparaison_plot_js" class="btn btn-outline-primary change_plot comparaison_plot_js"  href="#">'+title+'</button>');
      });
      
}

function get_plot(location_name, param, unit, forecasts_div, forecasts_resample_div,merge,precomputer_forecasts,historical){

    var file_url = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/" + precomputer_forecasts;
    $(".loading_forecasts").fadeIn(10);
    if(merge){
        file_url.replace('.json', '_historical.json');
    }
    if(historical == "historical"){
        file_url = file_url.replace('.json', '_historical.json');
    }
   
 
    $.ajax({
        url: file_url, 
        success: function() { 
            d3.json(file_url, function(error, data) {
                if (error) {
                    alert(error);
                }
                
                if(data){
                    var pure_data = csvToArray(data.latest_forecast.data);


                    var date_time = $(pure_data).map(function() {
                        return this.forecast_datetime;
                    }).get()

                    var localized = $(pure_data).map(function() {
                        if (param == "no2") {
                            return this.localized_no2
                        }
                        if (param == "o3") {
                            return this.localized_o3
                        }
                        if (param == "pm25") {
                            return this.localized_pm25
                        }

                    }).get()
                    
                   
                    var uncorrected = $(pure_data).map(function() {
                        if (param == "no2") {
                            return this.uncorrected_no2
                        }
                        if (param == "o3") {
                            return this.uncorrected_o3
                        }
                        if (param == "pm25") {
                            return this.luncorrected_pm25
                        }
                    }).get()

                    var observation_resample = $(pure_data).map(function() {
                        if (param == "no2") {
                            return this.observation_24H
                        }
                        if (param == "o3") {
                            return this.observation_8H
                        }
                        if (param == "pm25") {
                            return this.observation_24H
                        }

                    }).get()
                    var resample_window = 24;
                    var localized_resample = $(pure_data).map(function() {
                        if (param == "no2") {
                            resample_window = 24;
                            return this.localized_no2_24H
                        }
                        if (param == "o3") {
                            resample_window = 8;
                            return this.localized_o3_8H
                        }
                        if (param == "pm25") {
                            resample_window = 24;
                            return this.localized_pm25_24H
                        }

                    }).get()

                    var uncorrected_resample = $(pure_data).map(function() {
                        if (param == "no2") {
                            return this.uncorrected_no2_24H
                        }
                        if (param == "o3") {
                            return this.uncorrected_o3_8H
                        }
                        if (param == "pm25") {
                            return this.uncorrected_pm25_24H
                        }

                    }).get()

                    var observation = $(pure_data).map(function() {
                        return this.observation;
                    }).get()




                    var trace1 = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: localized,
                        line: {
                            color: 'rgba(59, 59, 59, 0.8)',
                            width: 3
                        },
                        name: 'ML + Model '
                    }

                    var trace2 = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: uncorrected,
                        line: {
                            color: 'rgba(142, 142, 142, 0.8)',
                            width: 3
                        },
                        name: 'Model'
                    }

                    var trace3 = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: observation,
                        line: {
                            color: 'rgba(255, 0, 0, 0.8)',
                            width: 3
                        },
                        name: 'Observation'
                    }

                    var observation_resample_trace = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: observation_resample,
                        line: {
                            color: 'rgba(255, 0, 0, 0.8)',
                            width: 3
                        },
                        name: 'Observation'
                    }
                    var localized_resample_trace = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: localized_resample,
                        line: {
                            color: 'rgba(59, 59, 59, 0.8)',
                            width: 3
                        },
                        name: 'ML + Model'
                    }
                    var uncorrected_resample_trace = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: uncorrected_resample,
                        line: {
                            color: 'rgba(142, 142, 142, 0.8)',
                            width: 3
                        },
                        name: 'Model'
                    }

                    var pred = [trace3, trace1, trace2];

                    var pred_obs = [observation_resample_trace];
                    
                    var plot_resample = [observation_resample_trace,localized_resample_trace,uncorrected_resample_trace];

                    var layout = {
                        title: 'Bias Corrected Model',
                        font: {
                            family: 'Helvetica, sans-serif',
                            size: 18,
                            color: '#7f7f7f'
                        },
                        xaxis: {
                            type: 'date'
                        },

                        yaxis: {
                            autorange: true,
                            type: 'linear',
                            title: param+' ' +'[ '+ unit +']'

                        },
                        shapes: [{
                            type: 'line',
                            x0: String(data.latest_forecast.forecast_initialization_date),
                            y0: 0,
                            x1: String(data.latest_forecast.forecast_initialization_date),
                            yref: 'paper',
                            y1: 1,
                            line: {
                                color: 'green',
                                width: 2,
                                dash: 'dot'
                            }
                        }],
                        legend: {
                            orientation: 'h',
                            y: 1.2
                        }
                    };

                    var layout_resample = {
                        title: 'Bias Corrected Model '+ historical +' '+ resample_window+"H Rolling Averages",
                        font: {
                            family: 'Helvetica, sans-serif',
                            size: 18,
                            color: '#7f7f7f'
                        },
                        xaxis: {
                            type: 'date',
                           
                        },

                        yaxis: {
                            autorange: true,
                            type: 'linear',
                            title: param+' ' +'[ '+ unit +']'

                        },
                        shapes: [{
                            type: 'line',
                            x0: String(data.latest_forecast.forecast_initialization_date),
                            y0: 0,
                            x1: String(data.latest_forecast.forecast_initialization_date),
                            yref: 'paper',
                            y1: 1,
                            line: {
                                color: 'green',
                                width: 2,
                                dash: 'dot'
                            }
                        }],
                        legend: {
                            orientation: 'h',
                            y: 1.2
                        }
                    };

                    Plotly.newPlot(forecasts_div, pred, layout);
                    Plotly.newPlot(forecasts_resample_div, plot_resample, layout_resample);
                    $(document).on("click", ".download_forecasts_data", function() {
                        var csv_file_name = location_name.replace(/\_/g, '').replace(/\./g, '') + '_' + param + '('+'_'+historical+').csv';
                        let csvContent = "data:text/csv;charset=utf-8," + data.latest_forecast.data;
                        var encodedUri = encodeURI(csvContent);
                        var link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", csv_file_name);
                        document.body.appendChild(link); 
                        link.click();
                    });
                    $('.resample').text(resample_window+"H Rolling Averages");
                    
                    $('.modebar').prepend('<div class="modebar-group"><a rel="tooltip" class="modebar-btn change_plot" data-title="'+historical+ ' '+resample_window+'H Rolling Average" change_to ="main_plot_'+historical+'"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16"> <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/> <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/> <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/> </svg></div>');

                    if(historical){
                        var label_text = "historical simulation";
                        var label_text_rolling_average = "historical simulation ("+resample_window+" H rolling average)";
                        var downlaod_label_text = "download historical simulation data";

                    }else{
                        var label_text = "Forecasts";
                        var label_text_rolling_average = "Forecasts ("+resample_window+" H rolling average)";
                        var downlaod_label_text = "download forecast data";
                    }
                    
                    $('.plot_additional_features').prepend('<button type="button" class="btn btn-outline-primary change_plot" change_to="main_plot_'+historical+'" href="#"> '+label_text+'</button><button type="button" change_to="resample_main_plot_'+historical+'" change_to ="resample_main_plot_'+historical+'" class="btn btn-outline-primary change_plot change_plot resample'+'_'+historical+'" href="#">'+label_text_rolling_average+'</button>');

                    $('.lf-downloads').append('<a class="download_forecasts_data" href="#">| '+downlaod_label_text+' </button>');
                    


                    $('.lf-operations_1').prepend('| <a class="change_plot" change_to ="main_plot_'+historical+'" href="#"> Raw '+historical+' data</a> | <a change_to ="resample_main_plot_'+historical+'" class=" change_plot resample'+'_'+historical+'" href="#">'+historical+' '+resample_window+'H Rolling averages</a> ');
                    
                    $(document).on("click", '.change_plot', function() {

                        var change_to_val = $(this).attr("change_to");
                           $('.model_plots').hide();
                            $('.'+change_to_val).show(); 

                            if (change_to_val == "main_plot_for_api_baker"){
                                $('.form-check').show()
                            }else{
                                $('.form-check').hide()
                            }
                       });
                       

                       

                   
               
                    if (Plotly.newPlot('observations_only', pred_obs, layout)) {


                    } 
                }
               
                $(".loading_forecasts").fadeOut(10);
                
            });

        },
        error: function(jqXHR, status, er) {
            if (jqXHR.status === 404) {
                $('.forecasts-view').html("Sorry, forecasts not available for "+param+" in this location");
            }

        }
    });
}


function open_forecats_window (messages, st_id, param, location_name, observation_value, current_observation_unit, obs_src,precomputer_forecasts){
    $(".loading_div").fadeIn(10);
    console.log(location_name);
    console.log('st_id : '+st_id);
    $(".forecasts_container").load("vues/location.html?st=" + st_id + '&param=' + param + '&location_name=' + location_name +'&obs_src='+obs_src, function() {
        $(this).fadeOut(10);
        $(this).fadeIn(10);
        setInterval(function() {
            var message = messages[Math.floor(Math.random() * messages.length)];
            $(".messages").html(message)
        }, 100);
        $('.current_location_name').html(location_name.replace(/\_/g, ' ').replace(/\./g, ' ') );
        $('.current_param').html(pollutant_details(param)).name;
        $('.current_param_1').html(pollutant_details(param).name);
        $('.current_observation_value').html(observation_value);
        $('.current_observation_unit_span').html(current_observation_unit);
        $(".forecasts_container").addClass("noussair_animations zoom_in");
        $(".loading_div").fadeOut(10);
        $("button").css({ "button": "animation: intro 2s cubic-bezier(0.03, 1.08, 0.56, 1); animation-delay: 2s;" });

        try {
            side_by_side_plots(param, current_observation_unit, 'Model comparison', precomputer_forecasts);
        }catch (error) {
            console.error('An error occurred while running the side_by_side_plots function:', error);
          }
        try {
            get_plot(location_name, param, current_observation_unit, 'plot_model_', 'plot_resample_', false, precomputer_forecasts, '');
            get_plot(location_name, param, current_observation_unit, 'plot_model_historical', 'plot_resample_historical', false, precomputer_forecasts, 'historical');
          } catch (error) {
            console.error('An error occurred while running the get_plot function:', error);
          }
       
        read_api_baker(st_id,param,current_observation_unit,'main_plot_for_api_baker', true, historical=2, reinforce_training=2,hpTunning=2);
        
    });
}

$(document).on("click", ".launch-local-forecasts", function(param) {
    var messages = ["Connecting to OpenAQ", "Connecting to GMAO", "fetching data from OpenAQ", "fetching data from GMAO FTP", "fetching observations", "getting the forecasts", "please wait...", "connecting...."];
    var location_id = $(this).attr("station_id");
    //var param = $('.g-lf-params').attr('param');
    var param = $(this).attr('parameter');
    var location_name = $(this).attr("location_name");
    var observation_source = $(this).attr("observation_source");
    var precomputed_forecasts = $(this).attr("precomputed_forecasts");
    var observation_value = $(this).attr("observation_value");
    var current_observation_unit = $(this).attr("current_observation_unit");
    var obs_src = $(this).attr("obs_src");
    open_forecats_window (["Loading", "Please hold"], location_id, 'pm25', location_name, observation_value, current_observation_unit, observation_source, precomputed_forecasts)






 
});

$(document).on("click", ".upload-your-data", function() {
    $(".loading_div").fadeIn(10);
    var messages = ["Connecting to OpenAQ", "Connecting to GMAO", "fetching data from OpenAQ", "fetching data from GMAO FTP", "fetching observations", "getting the forecasts", "please wait...", "connecting...."];
    setInterval(function() {
        var message = messages[Math.floor(Math.random() * messages.length)];
        $(".messages").html(message)
    }, 100);
    var st_id = $(this).attr("station_id");
    var param = $(this).attr("parameter");
    $(".forecasts_container").load("vues/data-handle.html?st=" + st_id + '&param=' + param, function() {
        $(this).fadeOut(10);
        $(this).fadeIn(10);
        $(".forecasts_container").addClass("noussair_animations zoom_in");
        $(".loading_div").fadeOut(10);
    });
});


function save_data_to_csv(data) {
    var blob = new Blob(data, {
        type: "text/csv;charset=utf-8"
    });
    saveAs(blob, "file.csv");
}

function update_api_baker(location,param,unit,forecasts_div){

    var file_url = "https://www.noussair.com/api_baker.php?st="+location;
   // $(".loading_forecasts").fadeIn(10);
    $.ajax({
        url: file_url, 
        success: function() { 
            d3.json(file_url, function(error, data) {
                if (error) {
                    alert(error);
                }
                
                if(data){
                    master_datetime = []
                    master_observation = []
                    master_localized = []
                    residuals = []
                    master_data = []

                    
                    
                    data_str = data.split('} {').join('},{');
                    data_str = '['+data_str+']';
                    data_str = JSON.parse(data_str);
                    
                    console.log(data_str[0].time);

                    $.each(data_str,function(key,value){
                        master_datetime.push(data_str[key]["time"])
                        master_observation.push(data_str[key]["value"])
                        master_localized.push(data_str[key]["prediction"])
                        residuals.push(data_str[key]["residuals"])
                    });
                    master_data.master_datetime = master_datetime;
                    master_data.master_observation = master_observation;
                    master_data.master_localized = master_localized;
                    //console.log(master_data);
                    draw_plot(master_data,param,unit,forecasts_div,'Localized forecasts (Pretrained model)',false)

                    $('.retrain_model').attr("param",param);
                    $('.retrain_model').attr("site",location);
                    $('.retrain_model').attr("unit",unit);

                }
                else {
                   console.log("ERROR");
                }
                
            });

        },
    });
}



$(document).on("click", '.retrain_model', function() {
    current_param = $(this).attr("param");
    current_site = $(this).attr("site");
    current_unit = $(this).attr("unit");
    
    //read_api_baker(current_site,current_param,current_unit,'main_plot_for_api_baker', false);
    
   });

   Pusher.logToConsole = true;
   var pusher = new Pusher('66c4558c3fed9445e375', {
     cluster: 'eu'
   });

   var channel = pusher.subscribe('my-channel');
   channel.bind('my-event', function(data) {
     alert(JSON.stringify(data));
   });


   $(document).on("change", '.form-check-input', function() {
       var auto_refresh = 2;
       var reinforce_training = 2;
       var hpTunning = 2;
       var historical = 2;
    if($(this).prop("checked") == true){
        var item_checked = $(this).attr('id');

        if(item_checked == "auto_refresh"){
            auto_refresh = 1
        }
        else if(item_checked == "model_update"){
            reinforce_training = 1
        }

        else if(item_checked == "model_update_hp"){
            hpTunning = 1
        }
        
        else if(item_checked == "display_historical"){
            historical = 1
        }

        current_param = $(this).attr("param");
        current_site = $(this).attr("site");
        current_unit = $(this).attr("unit");

        
        
        
    }
    read_api_baker(current_site,current_param,current_unit,'main_plot_for_api_baker', false, historical=historical, reinforce_training= reinforce_training,hpTunning=hpTunning)
    });
    
   




// MAIN APP

const location_modules = "https://www.noussair.com/get_data.php?type=ftp&url=https://www.noussair.com/global.json";

$.ajax({
    type: "Get",
    url: location_modules,
    dataType: "json",
    success: function(sites) {

        var param = "pm25";
        //get_all_sites_data(sites).then((all_sites) => map = create_map(all_sites, param))
    },
    error: function(){
        alert("WARNING: LOCATION FILE NOT CONNECTING");
    }
});

create_map('test','pm25')
//const sites = ["3995", "8645", "739", "5282"];

//get_all_sites_data(sites).then((all_sites) => map = create_map(all_sites, param));


$(document).on('click', '.routing_pollutant_param', function(e) {
    $(".loading_div").fadeIn(100);
    const param = $(this).attr('lf-param');
    $(".g-lf-params").attr("param", param);
    $.ajax({
        type: "Get",
        url: location_modules,
        dataType: "json",
        success: function(sites) {
            var param = $(".g-lf-params").attr('param');
            get_all_sites_data(sites).then((all_sites) => map = create_map(all_sites, param))
        },
        error: function(){
            alert("WARNING: LOCATION FILE NOT CONNECTING");
        }
    });
    $(".loading_div").fadeOut(100);

});


    // Bind a click event to the filter button
    $(document).on('keyup', '#filter-input', function() {
      // Get the user input
      var locationName = $('#filter-input').val().toLowerCase();
  
      // Loop through each forecast item
      $('.launch-local-forecasts').each(function() {
        var item = $(this);
        var item_parent = $(this).parent();
        var itemName = item.attr('location_name').toLowerCase();
  
        // If the item name contains the user input, show it, else hide it
        if (itemName.includes(locationName)) {
            item_parent.show();
        } else {
            item_parent.hide();
        }
      });
    });

  
