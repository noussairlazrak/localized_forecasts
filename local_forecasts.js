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
            var observation_value = value.value;
            var observation_unit = value.unit;
            if (observation_value === -999){
                observation_value = "N/A";
                observation_unit = "";
            }
            const obj = document.getElementsByClassName("observation_value");
            animateValue(obj, 100, 0, 5000);
            var html = '<div class="col-md-3 single-pollutant-card swiper-slide-desactivates"> <a class="launch-local-forecasts" parameter="' + param + '" station_id="' + site.site_data.openaq_id + '" location_name=' + site.site_data.location.replace(/\s/g, '_') + ' observation_value=' + observation_value.toString().substring(0, 6) + ' current_observation_unit=' + observation_unit + ' latitude="' + site.site_data.latitude + '" longitude="' + site.site_data.longitude + '" lastUpdated="' + value.lastUpdated + '"> <div class="item-inner"> ' + site.site_data.location + ' <div class="card shadow-none forecasts-item text-white"> <div class="card-body-desactivated"> <h5 class="location_name"> ' + pollutant_details(param).name + '</h5> <span class="last_update_widget"> Last update: ' + value.lastUpdated + '</span><h1 class="observation_value">' + observation_value.toString().substring(0, 6) + '<span class="observation_unit">' + observation_unit + '</span> </h1> <span class="source">Source: OpenAQ</span> </div> </div> </div> </a> </div>';
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
function combine_historical_and_forecasts(location_name, param, unit, forecasts_div){

    var file_name = location_name.replace(/\_/g, '').replace(/\./g, '') + '_' + param;

    var forecasts_url = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/forecast_latest_" + file_name+'.json';
    var historical_simulation = "https://www.noussair.com/fetch.php?url=https://gmao.gsfc.nasa.gov/gmaoftp/geoscf/forecasts/localized/00000000_latest/forecast_latest_" + file_name+'_historical.json';

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
    
    list_of_files.forEach(function(file_url, index){
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

                        //console.log(date_time);
                        
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
    
                        $.merge( master_datetime, date_time );
                        $.merge( master_observation, observation );
                        $.merge( master_observation_resample, observation_resample );
                        $.merge( master_localized, localized );
                        $.merge( master_localized_resample, localized_resample );
                        $.merge( master_uncorrected, uncorrected );
                        $.merge( master_uncorrected_resample, uncorrected_resample );

                        combined_dataset["forecast_initialization_date"] = forecast_initialization_date;
    
                        combined_dataset["master_datetime"] = master_datetime;
                        combined_dataset["master_observation"] = master_observation;
                        combined_dataset["master_observation_resample"] = master_observation_resample;
                        
                        combined_dataset["master_localized"] = master_localized;
                        combined_dataset["master_localized_resample"] = master_localized_resample;
                        
                        combined_dataset["master_uncorrected"] = master_uncorrected;
                        combined_dataset["master_uncorrected_resample"] = master_uncorrected_resample;

                        draw_plot(combined_dataset,param,unit,forecasts_div)
                    }
                    else {
                        $('.forecasts-view').html("Sorry, Forecasts not available for "+param+" in this location");
                    }
                    
                });
    
            },
            error: function(jqXHR, status, er) {
                if (jqXHR.status === 404) {
                    $('.forecasts-view').html("Sorry, forecasts not available for "+param+" in this location");
                }
    
            }
        });
        
    })
    
    combined_dataset["forecast_initialization_date"] = forecast_initialization_date;
    
    combined_dataset["master_datetime"] = master_datetime;
    combined_dataset["master_observation"] = master_observation;
    combined_dataset["master_observation_resample"] = master_observation_resample;
    
    combined_dataset["master_localized"] = master_localized;
    combined_dataset["master_localized_resample"] = master_localized_resample;
    
    combined_dataset["master_uncorrected"] = master_uncorrected;
    combined_dataset["master_uncorrected_resample"] = master_uncorrected_resample;

    return combined_dataset;
    
}

function draw_plot(combined_dataset,param,unit,forecasts_div){
    console.log("----- date data ------");
    console.log(combined_dataset.master_datetime);
    console.log(combined_dataset.master_localized);
    console.log("latest date time");
    console.log(combined_dataset.master_datetime.slice(-2, -1).toString());
    var master_localized = {
        type: "scatter",
        mode: "lines",
        x: combined_dataset.master_datetime,
        y: combined_dataset.master_localized,
        line: {
            color: 'green'
        },
        name: 'Localized ' + param
    }

    var master_uncorrected = {
        type: "scatter",
        mode: "lines",
        x: combined_dataset["master_datetime"],
        y: combined_dataset["master_uncorrected"],
        line: {
            color: 'red'
        },
        name: 'Uncorrected ' + param
    }

    var master_observation = {
        type: "scatter",
        mode: "lines",
        x: combined_dataset["master_datetime"],
        y: combined_dataset["master_observation"],
        line: {
            color: 'blue'
        },
        name: 'Observation',
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

    var layout = {
        title: 'Bias Corrected Model Comparaison',
        font: {
            family: 'Helvetica, sans-serif',
            size: 18,
            color: '#7f7f7f'
        },
        xaxis: {
            type: 'date',
            automargin: true,
            rangebreaks: [
                {
                  //bounds: ['2022-1', '2022-11'],
                  values: getDates("2021-12-23", "2022-12-12"),
                  //dvalue: 86400000  * 365 * 1 ,
                }
            ]
        },

        yaxis: {
            autorange: true,
            type: 'linear',
            title: param+' ' +'[ '+ unit +']'

        },
        shapes: [
            {
              type: 'rect',
              x0: "2021-12-14T11:30:00Z",
              y0: 0,
              x1: "2021-12-23T11:30:00Z",
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
                x0: "2022-12-12T11:30:00Z",
                y0: 0,
                x1: "2022-12-21T11:30:00Z",
                y1: 1,
                yref: 'paper',
                fillcolor: '#00ffa973',
                line: {
                  color: 'green',
                  width: 0.5
                }
              },
        ]
    };

    if(master_observation.length === 0){
       alert("array is empty");
    }else{
        var plot = [master_observation, master_uncorrected, master_localized];

        Plotly.newPlot(forecasts_div, plot, layout);
        $('.plot_additional_features').prepend('<button type="button" class="btn btn-outline-primary change_plot" change_to="main_plot_for_comparaison" href="#"> Historical Comparaison</button>');
    }
    
}



function get_plot(location_name, param, unit, forecasts_div, forecasts_resample_div,historical,merge){
    if(historical=="historical"){
        ext_name="_historical.json";
    }
    else{
        ext_name=".json";
    }
    var file_name = location_name.replace(/\_/g, '').replace(/\./g, '') + '_' + param +ext_name;
    if(merge){
        historical_file_name = location_name.replace(/\_/g, '').replace(/\./g, '') + '_' + param +'_historical.json';
    }
    if (file_name == "USDiplomaticPost:Kampala_pm25"+ext_name) {
        file_name = "Kampala_USDiplomaticPost_pm25"+ext_name
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
                            color: 'green'
                        },
                        name: 'Localized ' + param
                    }

                    var trace2 = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: uncorrected,
                        line: {
                            color: 'red'
                        },
                        name: 'Uncorrected ' + param
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

                    var observation_resample_trace = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: observation_resample,
                        line: {
                            color: 'blue'
                        },
                        name: 'Observation'
                    }
                    var localized_resample_trace = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: localized_resample,
                        line: {
                            color: 'green'
                        },
                        name: 'Localized '+param
                    }
                    var uncorrected_resample_trace = {
                        type: "scatter",
                        mode: "lines",
                        x: date_time,
                        y: uncorrected_resample,
                        line: {
                            color: 'red'
                        },
                        name: 'Uncorrected '+param
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
                        }]
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
                        }]
                    };

                    Plotly.newPlot(forecasts_div, pred, layout);
                    Plotly.newPlot(forecasts_resample_div, plot_resample, layout_resample);
                    $(document).on("click", ".download_forecats_data", function() {
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

                    $('.plot_additional_features').append('<button type="button" class="btn btn-outline-primary download_forecats_data" href="#">'+downlaod_label_text+'</button>');
                    


                    $('.lf-operations_1').prepend('| <a class="change_plot" change_to ="main_plot_'+historical+'" href="#"> Raw '+historical+' data</a> | <a change_to ="resample_main_plot_'+historical+'" class=" change_plot resample'+'_'+historical+'" href="#">'+historical+' '+resample_window+'H Rolling averages</a> ');
                    
                    $('.change_plot').on("click", function() {
                        var change_to_val = $(this).attr("change_to");
                           $('.model_plots').hide();
                            $('.'+change_to_val).show(); 
                       });
               
                    if (Plotly.newPlot('observations_only', pred_obs, layout)) {


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
        
        //console.log(combine_historical_and_forecasts(location_name, param));   
    get_plot(location_name, param,current_observation_unit,'plot_model_','plot_resample_','');
    get_plot(location_name, param,current_observation_unit,'plot_model_historical','plot_resample_historical','historical');

       combine_historical_and_forecasts(location_name, param,current_observation_unit,'test_plot');
        
        d3.csv("./vues/10812-intervals.csv", function(err, rows) {

            function unpack(rows, key) {
                return rows.map(function(row) {
                    return row[key];
                });
            }


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
                title: 'Bias Corrected Model',
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