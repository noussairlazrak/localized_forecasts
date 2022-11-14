


mapboxgl.accessToken = 'pk.eyJ1IjoibGF6cmFrbiIsImEiOiJjanZodzV3OXUwNmEwNDRxdnVsZGhnaml4In0.-ES_Lt127Id6DEf8H9E3rg';

var deltaDegrees = 25;
 
function easing(t) {
return t * (2 - t);
}


function pollutant_details(code){
	var pollutant_details = [];
	if (code == "no2"){
		pollutant_details.name = "<b>Nitrogen Dioxide</b> (NO<sub>2</sub>)";
	}

	if (code == "so2"){
		pollutant_details.name = "<b>Sulfur Dioxide</b> (SO<sub>2</sub>)";
	}
	if (code == "pm25"){
		pollutant_details.name = "<b>Particulate Matter</b> (PM<sub>2.5</sub>)";
	}

	if (code == "o3"){
		pollutant_details.name = "<b>Ozone</b> (O<sub>3</sub>)";
	}
	
	return pollutant_details;
}



function add_marker(map,lat,long,open_aq_id,param,site){
	console.log("adding marker for OpenAQ cite id "+open_aq_id+' coordinates'+lat+' '+long)
	var station_id = document.createAttribute("station_id");  
	var parameter = document.createAttribute("parameter");       
	var location_name = document.createAttribute("location_name");       
	var observation_value = document.createAttribute("observation_value");       
	var current_observation_unit = document.createAttribute("current_observation_unit");       
	station_id.value = open_aq_id;
	parameter.value = param;
	var site = [lat, long];
	var el_open_aq_id = document.createElement('div');
	el_open_aq_id.id = 'marker_'+open_aq_id;
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





function get_forecasts(sites){
	sites.forEach((element) => {
		add_marker(map,30.417130,-9.599250,"739");
	});
}

function get_obeservation(openaq_id){
	console.log("working on it");
	fetch('https://r6datuje8k.us-east-1.awsapprunner.com/noussair.lazrak/api/read_openaq_test', {
		method: 'POST',
		headers: {
			'Access-Control-Allow-Origin' : 'http://localhost:8888',
			'Access-Control-Allow-Credentials' : 'true',
			'Access-Control-Allow-Methods' : 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers ': 'Origin, Content-Type, Accept',
			'Content-Type': 'application/json',
			'x-api-key':'Al7sQWDKzXh3VK19eJ0f3s5Ed40'
		},
		body: JSON.stringify({"url": "https://api.openaq.org/v2//measurements?date_from=2019-01-01T00%3A00%3A00%2B00%3A00&date_to=2022-02-01T00%3A00%3A00%2B00%3A00&limit=10000&page=1&offset=0&sort=asc&radius=1000&location_id=10812&parameter=pm25&order_by=datetime"})
		}).then(res => res.json())
		.then(res => console.log(res));
		console.log("done");
}

function get_open_aq_observations(site_id,param){
	var openaq = {};
	openaq.site_data = [];
	openaq.site_data.openaq_id = "";
	openaq.site_data.location = "";
	openaq.site_data.latitude = "";
	openaq.site_data.longitude= "";
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
			url: 'https://api.openaq.org/v2/latest?limit=100&page=1&offset=0&sort=desc&radius=1000&order_by=lastUpdated&dumpRaw=false&location_id='+site_id+'',
			
            success: function (data) {
				
			
				openaq.site_data.openaq_id = site_id;
				openaq.site_data.location = data.results[0].location;
				openaq.site_data.latitude = data.results[0].coordinates.latitude;
				openaq.site_data.longitude = data.results[0].coordinates.longitude;
				openaq.meta_data = "data is now updated" ;
				openaq.latest_n02 = data.results[0].measurements.longitude;
				openaq.latest_03 = "";
				openaq.latest_SO2 = "";
				openaq.latest_pm25 = "";
				openaq.latest_measurments = data.results[0].measurements;

				
				
				
            },
            error: function(data){
				console.log(data);
				
		   },
		});
		console.log(openaq);
		return Promise.resolve(openaq);
}

function create_map(sites,param){
	
	var deltaDistance = 100;
	var monument = [30.1272444, -1.9297706];
	var map = new mapboxgl.Map({
		style: 'mapbox://styles/lazrakn/ck2g4kozj0q3w1cmx5tig3gnp',
		center: monument,
		zoom: 2,
		pitch: 0,
		bearing: 0,
		container: 'map'
	});
	$( ".pollutants-banner" ).html( $('<div class="pollutant-banner-o row gx-md-8 gy-8  swiper-desactivated"> </div>') );
	sites.forEach((element) => {

		add_marker(map,element.site_data.longitude,element.site_data.latitude,element.site_data.openaq_id,param,element);
		add_locations_banner(element,param);
	});

		return map;
}


//get_forecasts(sites);
function add_locations_banner(site, param){

	

	$.each( site.latest_measurments, function( key, value ) {
		if (value.parameter == param){
			const obj = document.getElementsByClassName("observation_value");
			animateValue(obj, 100, 0, 5000);
			var html = '<div class="col-md-2 single-pollutant-card swiper-slide-desactivates"> <a class="launch-local-forecasts" parameter="'+param+'" station_id="'+site.site_data.openaq_id+'" location_name='+site.site_data.location.substring(0, 25)+' observation_value='+value.value.toString().substring(0, 6)+' current_observation_unit='+value.unit+'> <div class="item-inner"> '+site.site_data.location.substring(0, 25)+' <div class="card shadow-none bg-forecasts text-white"> <div class="card-body-desactivated"> <h5 class="location_name"> '+pollutant_details(param).name+'</h5> <h1 class="observation_value">'+value.value.toString().substring(0, 6)+'<span class="observation_unit">'+value.unit +'</span> </h1> <span class="source">Source: OpenAQ</span> </div> </div> </div> </a> </div>';
			$( ".pollutant-banner-o" ).append(html);
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
  

function get_all_sites_data(sites,param){
	let all_sites = [];
	$.each(sites , function(index, val) { 	
		
		get_open_aq_observations(val,param).then((site_data) => all_sites.push(site_data));
	
	});

	return Promise.resolve(all_sites);
}

	const sites = ["3995", "8645", "739","5282"];
	const param = "no2";
	get_all_sites_data(sites).then((all_sites) => map = create_map(all_sites,param));
	$(document).on('click','.routing_pollutant_param', function (e) {
	$(".loading_div").fadeIn(100);
	const param = $(this).attr('lf-param');
	const sites_2 = ["3995", "8645", "739","5282"];
	get_all_sites_data(sites_2).then((all_sites) => map = create_map(all_sites,param));
	$(".loading_div").fadeOut(100);
	
});





	$(document).on("click",".launch-local-forecasts", function(){
		$(".loading_div").fadeIn(10);
		var messages = ["Connecting to OpenAQ", "Connecting to GMAO", "fetching data from OpenAQ", "fetching data from GMAO FTP", "fetching observations", "getting the forecasts","please wait...","connecting...."];
		setInterval(function () {
			var message = messages[Math.floor(Math.random()*messages.length)];
			$(".messages").html(message)}, 100);
		var st_id=$(this).attr("station_id");
		var param=$(this).attr("parameter");
		var location_name=$(this).attr("location_name");
		var observation_value=$(this).attr("observation_value");
		var current_observation_unit=$(this).attr("current_observation_unit");

		$(".forecasts_container").load("vues/location.html?st="+st_id+'&param='+param, function(){
			$(this).fadeOut(10);
			$(this).fadeIn(10);
			$('.current_location_name').html(location_name);
			$('.current_param').html(pollutant_details(param));
			$('.current_observation_value').html(observation_value);
			$('.current_observation_unit_span').html(current_observation_unit);
			$(".forecasts_container").addClass("noussair_animations zoom_in");
			$(".loading_div").fadeOut(10);
		});
	});

	$(document).on("click",".upload-your-data", function(){
		$(".loading_div").fadeIn(10);
		var messages = ["Connecting to OpenAQ", "Connecting to GMAO", "fetching data from OpenAQ", "fetching data from GMAO FTP", "fetching observations", "getting the forecasts","please wait...","connecting...."];
		setInterval(function () {
			var message = messages[Math.floor(Math.random()*messages.length)];
			$(".messages").html(message)}, 100);
		var st_id=$(this).attr("station_id");
		var param=$(this).attr("parameter");
		$(".forecasts_container").load("vues/data-handle.html?st="+st_id+'&param='+param, function(){
			$(this).fadeOut(10);
			$(this).fadeIn(10);
			$(".forecasts_container").addClass("noussair_animations zoom_in");
			$(".loading_div").fadeOut(10);
		});
	});




