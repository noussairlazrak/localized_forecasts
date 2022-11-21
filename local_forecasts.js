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
            $(".forecasts_container").addClass("noussair_animations zoom_in");
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
    if (code == "no2") {
        pollutant_details.name = "<b>Nitrogen Dioxide</b> (NO<sub>2</sub>)";
    }

    if (code == "so2") {
        pollutant_details.name = "<b>Sulfur Dioxide</b> (SO<sub>2</sub>)";
    }
    if (code == "pm25") {
        pollutant_details.name = "<b>Particulate Matter</b> (PM<sub>2.5</sub>)";
    }

    if (code == "o3") {
        pollutant_details.name = "<b>Ozone</b> (O<sub>3</sub>)";
    }

    return pollutant_details;
}



function add_marker(map, lat, long, open_aq_id, param, site) {

    var station_id = document.createAttribute("station_id");
    var parameter = document.createAttribute("parameter");
    var location_name = document.createAttribute("location_name");
    var observation_value = document.createAttribute("observation_value");
    var current_observation_unit = document.createAttribute("current_observation_unit");

    $.each(site.latest_measurments, function(key, value) {
        if (value.parameter == param) {
            location_name.value = site.site_data.location.replace(/\s/g, '_');
            observation_value.value = value.value;
            current_observation_unit.value = value.unit;
        }

    });

    station_id.value = open_aq_id;
    parameter.value = parameter;


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
    console.log("done");
}

function get_open_aq_observations(site_id, param) {
    var openaq = {};
    openaq.site_data = [];
    openaq.site_data.openaq_id = "";
    openaq.site_data.location = "";
    openaq.site_data.latitude = "";
    openaq.site_data.longitude = "";
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
    console.log(openaq);
    return Promise.resolve(openaq);
}

function create_map(sites, param) {

    var deltaDistance = 100;
    var center_point = [30.1272444, -1.9297706];
    var map = new mapboxgl.Map({
        style: 'mapbox://styles/lazrakn/clakch8ed006h14pdbqup69x7',
        center: center_point,
        zoom: 2,
        pitch: 0,
        bearing: 0,
        container: 'map'
    });
    $(".pollutants-banner").html($('<div class="pollutant-banner-o row gx-md-8 gy-8  swiper-desactivated"> </div>'));
    sites.forEach((element) => {

        add_marker(map, element.site_data.longitude, element.site_data.latitude, element.site_data.openaq_id, param, element);
        add_locations_banner(element, param);
    });

    return map;
}


//get_forecasts(sites);
function add_locations_banner(site, param) {



    $.each(site.latest_measurments, function(key, value) {
        if (value.parameter == param) {
            const obj = document.getElementsByClassName("observation_value");
            animateValue(obj, 100, 0, 5000);
            var html = '<div class="col-md-3 single-pollutant-card swiper-slide-desactivates"> <a class="launch-local-forecasts" parameter="' + param + '" station_id="' + site.site_data.openaq_id + '" location_name=' + site.site_data.location.replace(/\s/g, '_') + ' observation_value=' + value.value.toString().substring(0, 6) + ' current_observation_unit=' + value.unit + ' latitude="' + site.site_data.latitude + '" longitude="' + site.site_data.longitude + '" lastUpdated="' + value.lastUpdated + '"> <div class="item-inner"> ' + site.site_data.location + ' <div class="card shadow-none forecasts-item text-white"> <div class="card-body-desactivated"> <h5 class="location_name"> ' + pollutant_details(param).name + '</h5> <span class="last_update_widget"> Last update: ' + value.lastUpdated + '</span><h1 class="observation_value">' + value.value.toString().substring(0, 6) + '<span class="observation_unit">' + value.unit + '</span> </h1> <span class="source">Source: OpenAQ</span> </div> </div> </div> </a> </div>';
            $(".pollutant-banner-o").append(html);
        }

    });



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
    $.each(sites, function(index, val) {

        get_open_aq_observations(val, param).then((site_data) => all_sites.push(site_data));

    });

    return Promise.resolve(all_sites);
}




$(document).on("click", ".launch-local-forecasts", function(param) {
    $(".loading_div").fadeIn(10);
    var messages = ["Connecting to OpenAQ", "Connecting to GMAO", "fetching data from OpenAQ", "fetching data from GMAO FTP", "fetching observations", "getting the forecasts", "please wait...", "connecting...."];
    setInterval(function() {
        var message = messages[Math.floor(Math.random() * messages.length)];
        $(".messages").html(message)
    }, 100);
    var st_id = $(this).attr("station_id");
    var param = $('.g-lf-params').attr('param');
    var location_name = $(this).attr("location_name");
    var observation_value = $(this).attr("observation_value");
    var current_observation_unit = $(this).attr("current_observation_unit");

    $(".forecasts_container").load("vues/location.html?st=" + st_id + '&param=' + param + '&location_name=' + location_name, function() {
        $(this).fadeOut(10);
        $(this).fadeIn(10);
        $('.current_location_name').html(location_name);
        $('.current_param').html(pollutant_details(param)).name;
        $('.current_param_1').html(pollutant_details(param).name);
        $('.current_observation_value').html(observation_value);
        $('.current_observation_unit_span').html(current_observation_unit);
        $(".forecasts_container").addClass("noussair_animations zoom_in");
        $(".loading_div").fadeOut(10);



        var file_name = location_name.replace(/\_/g, '').replace(/\./g, '') + '_' + param + '.json';
        console.log(file_name);
        if (file_name == "USDiplomaticPost:Kampala_pm25.json") {
            file_name = "Kampala_USDiplomaticPost_pm25.json"
        }
        
        var file_url = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/forecast_latest_" + file_name;
		$(".loading_forecasts").fadeIn(10);
        $.ajax({
            url: file_url, 
            success: function() { 
                d3.json(file_url, function(error, data) {
                    if (error) {
                        alert(error);
                    }
					console.log(data);
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
	
						var observation = $(pure_data).map(function() {
							return this.observation;
						}).get()
	
						console.log(observation);
	
	
	
						var trace1 = {
							type: "scatter",
							mode: "lines",
							x: date_time,
							y: localized,
							line: {
								color: 'green'
							},
							name: 'Localized_' + param
						}
	
						var trace2 = {
							type: "scatter",
							mode: "lines",
							x: date_time,
							y: uncorrected,
							line: {
								color: 'red'
							},
							name: 'Uncorrected_' + param
						}
	
						var trace3 = {
							type: "scatter",
							mode: "lines",
							x: date_time,
							y: observation,
							line: {
								color: 'blue'
							},
							name: 'Observation'
						}
	
	
						var pred = [trace1, trace2, trace3];
	
						var pred_obs = [trace3];
	
						var layout = {
							// title: 'Bias Corrected Model',
							font: {
								family: 'Helvetica, sans-serif',
								size: 18,
								color: '#7f7f7f'
							},
							xaxis: {
								// range: ['2021-06-10', '2021-06-30'],
								type: 'date'
							},
	
							yaxis: {
								autorange: true,
								type: 'linear',
	
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
							}]
						};
	
						Plotly.newPlot('myDiv', pred, layout);
						if (Plotly.newPlot('observations_only', pred_obs, layout)) {
							console.log("done");
						} else {
							$('.forecasts-view').html("Sorry, forecasts not available for "+param+" in this location");
						}
					}
					else {
						$('.forecasts-view').html("Sorry, Forecasts not available for "+param+" in this location");
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

        d3.csv("./vues/10812-intervals.csv", function(err, rows) {

            function unpack(rows, key) {
                return rows.map(function(row) {
                    return row[key];
                });
            }

            console.log(unpack(rows, 'timestamp'));


            var trace1 = {
                type: "scatter",
                mode: "lines",
                x: unpack(rows, 'timestamp'),
                y: unpack(rows, 'value'),
                line: {
                    color: 'red'
                },
                name: 'Observation',
                type: "scatter",
                fill: "tonexty",
                fillcolor: "white",
            }

            var trace2 = {
                type: "scatter",
                mode: "lines",
                x: unpack(rows, 'timestamp'),
                y: unpack(rows, 'upper'),
                line: {
                    color: 'blue'
                },
                name: 'Upper Quantile',
                type: "scatter",
                fill: "tonexty",
                fillcolor: "rgba(68, 68, 68, 0.3)",
            }

            var trace3 = {
                type: "scatter",
                mode: "lines",
                x: unpack(rows, 'timestamp'),
                y: unpack(rows, 'lower'),
                line: {
                    color: 'green'
                },
                name: 'Lower Quantile',
                type: "scatter",
                fill: "tonexty",
                fillcolor: "rgba(68, 68, 68, 0.3)",
            }

            var pred = [trace1];

            var intervals = [trace1, trace2, trace3];

            var layout = {
                // title: 'Bias Corrected Model',
                font: {
                    family: 'Helvetica, sans-serif',
                    size: 18,
                    color: '#7f7f7f'
                },
                xaxis: {
                    // range: ['2021-06-10', '2021-06-30'],
                    type: 'date'
                },

                yaxis: {
                    autorange: true,
                    range: [86.8700008333, 138.870004167],
                    type: 'linear',

                }
            };

            Plotly.newPlot('intervals', intervals, layout);
        });
    });

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

const sites = ["3995", "8645", "739", "5282"];
var param = "pm25";
get_all_sites_data(sites).then((all_sites) => map = create_map(all_sites, param));
$(document).on('click', '.routing_pollutant_param', function(e) {
    $(".loading_div").fadeIn(100);
    const param = $(this).attr('lf-param');
    $(".g-lf-params").attr("param", param);
    const sites_2 = ["3995", "8645", "739", "5282"];
    get_all_sites_data(sites_2).then((all_sites) => map = create_map(all_sites, param));
    $(".loading_div").fadeOut(100);

});