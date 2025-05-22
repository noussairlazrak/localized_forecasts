function loadScript(url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
	alert("script loaded"+url);
}

$( document ).ready(function() {
    	$('body').on('click','.nl_wave_routing',function(){
			var page=$(this).attr('href');
			window.location.hash = $(this).attr("href");
			$(window).scrollTop(0);
			return false; 
			
		});
		
		$('body').on('click','.WaveModal',function(){
			var project=$(this).attr('ProjectName');
			$(".WaveInsideContent").load("vues/work?p="+project, function(){
			$(".WaveContentContainer").show();
			$('.WaveInsideContent').removeClass('do-anim-modern animated');
			$('.WaveInsideContent').addClass('do-anim-modern animated');
			$('.WaveInsideContent').removeClass('noussair_animations zoom_out');
			$('.WaveInsideContent').addClass('noussair_animations zoom_in');
			$('.do-anim-modern').addClass('animated');
			});
			
			return false; 
			
		});
		
	$('body').on('click','.WaveCloseModal',function(){
			$('.WaveInsideContent').removeClass('do-anim-modern animated');
			$('.WaveInsideContent').addClass('do-anim-modern animated');
			$('.WaveInsideContent').removeClass('noussair_animations zoom_in');
			$('.WaveInsideContent').addClass('noussair_animations zoom_out');
			$('.do-anim-modern').addClass('animated');
			$(".WaveContentContainer").fadeOut(1000);
			
			return false; 
			
		});
	
	$('body').on('click','.LoadMore',function(){
			var LoadedProject=$(this).attr('ProjectName');
			$(".LoadImages").load("triggers/external?resource=loadimages&p="+LoadedProject, function(){
			$(".LoadImages").addClass('do-anim-modern animated');	
			});
			
		});
	window.onhashchange = function(){
		
		var hash = window.location.hash.substr(1);
			$('.w_loader').toggle();
			$(document).prop('title', 'It\'s Noussair ::'+hash.toUpperCase().replace(/[_\W]+/g, " "));
			$('.header-left').removeClass('menu-is-open');
			$('body').removeClass('windows loaded loading-end');
			$('.main_wave_js').removeClass('noussair_animations zoom_in');
			$('.main_wave_js').addClass('noussair_animations zoom_out');
			$('.main_wave_js').load("vues/"+hash,function() {
				$('.gmao_libs_clean').html("");
				
				$('.main_wave_js').removeClass('noussair_animations zoom_out');
				$('.main_wave_js').addClass('noussair_animations zoom_in');
				$('body').addClass('windows loaded loading-end');
				setTimeout(function() {
					setTimeout(function() {
					}, 500);
				}, 500);
				setTimeout(function() {
					jQuery("body").addClass("loading-end");
					if (window.location.hash) {
						var filter = window.location.hash.substr(1);
						if (jQuery('.grid-filter li a[data-slug=' + filter + ']').length > 0) {
							jQuery('.grid-filter li a[data-slug=' + filter + ']').trigger("click")
						}
					}
					$('.ShowFirst').addClass('animated');
				}, 500);
				$('.w_loader').toggle();
				
				$(window).scrollTop(0);
				});
			$('.WaveAnalytics').load("vues/analytics.html");
		
	}		
	var hash = window.location.hash.substr(1);
	$('.w_loader').toggle();
			$('.main_wave_js').removeClass('noussair_animations zoom_in');
			$('.main_wave_js').addClass('noussair_animations zoom_out');
			$('.main_wave_js').load("vues/"+hash,function() {
				$('.gmao_libs_clean').html("");
				
				$('.main_wave_js').removeClass('noussair_animations zoom_out');
				$('.main_wave_js').addClass('noussair_animations zoom_in');
				$('.w_loader').toggle();
				});
	
	$(document).mouseup(function(e) 
		{
			var container = $(".WaveInsideContent");

			// if the target of the click isn't the container nor a descendant of the container
			if (!container.is(e.target) && container.has(e.target).length === 0) 
			{
				$(".WaveContentContainer").hide();
			}
		});
});	
