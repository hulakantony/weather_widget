;(function($) {

	$.fn.openWeather  = function(options) {

		// return if no element was bound
		// so chained events can continue
		if(!this.length) {
			return this;
		}

		// define default parameters
		var defaults = {						
			units: 'c',
			city: null,
			lat: null,
			lng: null,			
			lang: 'en',
			success: function() {},
			error: function(message) {}
		}

		
		var plugin = this;		
		var el = $(this);		
		var apiURL;		
		plugin.settings = {};		
		plugin.settings = $.extend({}, defaults, options);		
		var s = plugin.settings;
		s.key = '1d116b536241d6598ce05b34c44408a9';		
		apiURL = 'http://api.openweathermap.org/data/2.5/weather?lang='+s.lang;
		
		if(s.city == null){	
			var location = 'http://ip-api.com/json';	
			$.getJSON(location, function(data){
				localStorage.setItem('lon', data.lon) ;
				localStorage.setItem('lat', data.lat);	
		    })		
		    var	long = localStorage.getItem('lon');
		    var latt = localStorage.getItem('lat');	
			apiURL += '&lat='+ latt +'&lon='+ long;
			localStorage.clear();
		}		
		if(s.city != null) {		
		apiURL += '&q='+s.city.replace(' ', '');

		} else if(s.lat != null && s.lng != null) {			
			apiURL += '&lat='+s.lat+'&lon='+s.lng;
		} 
			
		apiURL += '&appid=' + s.key;

		function formatDate(){
			var now = new Date(),
				day = now.getDay(),
				month = now.getMonth(),
				date = now.getDate(),
				year = now.getFullYear();
			return {
				day: day,
				month: month,
				date: date,
				year: year
			}
		}
		function getNameOfDay(today){
			var days  = ['Sunday','Monday','Tuesday','Wednesday', 'Thursday','Friday', 'Saturday'];
			return days[today];
		}
		function getNameOfMonth(todayMonth){
			var months = ['Jan.','Feb.','Mar.','Apr.','May','Jun','July','Aug.','Sept.','Oct.','Nov.','Dec.'];
			return months[todayMonth];
		}	
		$.ajax({
			type: 'GET',
			url: apiURL,
			dataType: 'jsonp',
			success: function(data) {				
				if(s.units == 'f') {					
					var temperature = Math.round(((data.main.temp - 273.15) * 1.8) + 32) + '°F';					
				} else {					
					var temperature = Math.round(data.main.temp - 273.15) + '°C';				
				}
				
				$('.weather-temp').html(temperature);			

				// set weather description
				$('.weather-info-descr').text(data.weather[0].main);

				var iconURL = 'http://openweathermap.org/img/w/'+data.weather[0].icon+'.png';						
				$('.weather-icon').attr('src', iconURL);
				if(s.units === 'c'){
					$('.metric-switcher').html('F');
				} else {
					$('.metric-switcher').html('C');
				}
				
				$('.weather-place').text(data.name + ', ' + data.sys.country);				
				$('.weather-wind').text(Math.round(data.wind.speed) + ' mph');
				$('.weather-day').html(getNameOfDay(formatDate().day));
				$('.weather-date').html(formatDate().date);
				$('.weather-month').html(getNameOfMonth(formatDate().month));
				$('.weather-year').html(formatDate().year);
				$('.metric-switcher').on('click', function(e){
					e.preventDefault();
					var target = $(e.target);					
					var currentTemp = document.querySelector('.weather-temp').innerHTML;
					if(currentTemp.indexOf('C') !== -1){
						var temperature = Math.round(((data.main.temp - 273.15) * 1.8) + 32) + '°F';
						$('.weather-temp').html(temperature);
						target.html('C')
					} else {
						var temperature = Math.round(data.main.temp - 273.15) + '°C';
						$('.weather-temp').html(temperature);
						target.html('F')
					}
				})		
				s.success.call(this);
			},

			error: function(jqXHR, textStatus, errorThrown) {

				// run error callback
				s.error.call(this, textStatus);
			}
		});
	}
		
})(jQuery);