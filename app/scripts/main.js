;(function( $, window, document, undefined ) {
	var widgetHtml = 
	`<div class="weather-widget-wrap">
      <div class="weather-date-place-wrap">
        <p class="weather-day"></p>
        <p class="weather-date-wrap">
          <span class="weather-date"></span>
          <span class="weather-month"></span>
          <span class="weather-year"></span>
        </p>
        <p class="weather-place"></p>
      </div>
      <div class="weather-info-wrap">
        <div class="weather-info-img-wrap">
          <img src="" alt="" class="weather-icon">
          <p class="weather-info-descr"></p>
        </div>

        <div class="weather-temp-wind-wrap">
          <a class="metric-switcher" href="#"></a>
          <p class="weather-temp"></p>
          <p class="weather-wind"></p>
        </div>  
      </div>
    </div>`;
    const cityInput = `<input type="text" class="get-city" placeholder="Type city name">`
	const pluginName = 'myWeather';
	const KEY = '1d116b536241d6598ce05b34c44408a9';
	let apiURL = 'http://api.openweathermap.org/data/2.5/weather?lang=en';
	var defaults = {
		position: {						
			units: 'c',
			city: null,
			lat: null,
			lng: null		
			}				
		};	
	function Plugin(element, options){	
		this.element = element;			
		this.settings = $.extend({}, defaults, options, this.element);		
		this.init();
	}
	var self = this;
	console.log(self)
	$.fn[ pluginName ] = function( options ) {
		var self = this;
		console.log(self)
		return self.each( function() {
			if ( !$.data( self, "plugin_" + pluginName ) ) {
				$.data( self, "plugin_" +
					pluginName, new Plugin( this, options ) );
			}
		} );
	};
	$.extend(Plugin.prototype, {
		init: function(){			
			this.execute();
			apiURL = 'http://api.openweathermap.org/data/2.5/weather?lang=en';	
		},

		execute: function(){					
			var set = this.settings;
			var def = set.position;										
			if(!def.city){
				this.getCurrentLocation();	
				return;		
			}
			else{
				if(def.city != null) {		
					apiURL += '&q='+def.city.replace(' ', '');

				} else if(def.lat && def.lng) {			
					apiURL += '&lat='+def.lat+'&lon='+def.lng;
				} 
				
				apiURL += '&appid=' + KEY;			
				this.run.bind(this)();
			}
		},
		getCurrentLocation: function(){
			var location = 'http://ip-api.com/json';			

			fetch(location).then(data => {
				return data.json();
			}
			).then(we => {						
				apiURL += '&lat='+ we.lat +'&lon='+ we.lon +'&appid='+ KEY;
				this.run.bind(this)();
			})				
		},

		run: function (){
			var self = this;
			fetch(apiURL).then((data)=>{				
				return data.json();
			}).then((we)=>{

				self.renderElements.bind(this)(self.parseData.bind(this)(we));
			});			
		},		
		parseData: function(data){
	      if (data.cod == 404){
	        return null;
	      }
	     //console.log(data.name);
	      var u ;
	      if(this.settings){
	      	u = this.settings.position.units;
	      } else {
	      	u = 'c';
	      }
	      var parsedData = {};
	      var KELVIN = 273;	 	      
	      if(!u || u === 'c'){
	      	parsedData.temp = (Math.round(data.main.temp) - KELVIN) + '°C';
	      } else {
	      	parsedData.temp = ((Math.round(data.main.temp) - KELVIN) * 1.8 + 32).toFixed(0) + '°F';
	      }	     	      
	      parsedData.icon = data.weather[0].icon;
	      parsedData.descr = data.weather[0].main;
	      parsedData.place = data.name + ', ' + data.sys.country;
	      parsedData.wind = ~~data.wind.speed + 'mph';
	      return parsedData;
	    },
	    getElement: function(){
	    	var oldElement;
	    	if (oldElement) {
	    		oldElement =  $(oldElement)

	    	}else{
	    		oldElement = $(this.element);
	    	}
	    	return oldElement;
	    },
	    renderElements: function(data){	 
	    	 var el = $(this.element); 
	    	 console.log('1------>',this.getElement()) 	
	    	 	//debugger
	    	$(this.element).html(widgetHtml);
	    		console.log('2------>',$(this.element)) 
	    		if(!$(this.element).html()){
				var el = $('.weather-widget-wrap').has('.get-city');	    			
	    		}	    		
	    	el.find('.weather-temp').html(data.temp);
	    	el.find('.weather-info-descr').text(data.descr);
	    	el.find('.weather-place').text(data.place);
	    	el.find('.weather-day').html(getNameOfDay(formatDate().day));
	    	el.find('.weather-date').html(formatDate().date);
	    	el.find('.weather-wind').text(data.wind);
	    	el.find('.weather-month').html(getNameOfMonth(formatDate().month));
			el.find('.weather-year').html(formatDate().year);
			var iconURL = 'http://openweathermap.org/img/w/'+data.icon+'.png';						
			el.find('.weather-icon').attr('src', iconURL);
			if(this.settings && this.settings.position.units === 'c'){
				el.find('.metric-switcher').html('F');
			} else if(!this.settings) {
				el.find('.metric-switcher').html('F');
			} else {
				el.find('.metric-switcher').html('C');
			}
			el.find('.metric-switcher').on('click', function(e){
				e.preventDefault();
				var target = $(e.target);					
				var currentTemp = el.find('.weather-temp').html();
				if(currentTemp.indexOf('C') !== -1){
					var temperature = Math.round((parseInt(currentTemp, 10)  * 1.8) + 32) + '°F';
					el.find('.weather-temp').html(temperature);
					target.html('C')
				} else {
					var temperature = Math.round((parseInt((currentTemp), 10) - 32) / 1.8)   + '°C';
					el.find('.weather-temp').html(temperature);
					target.html('F')
				}
			});
			el.find(".weather-place").on("click", this.setCity);			
	    },
	    getNewWeather: function(city){	    	
	    	apiURL =  'http://api.openweathermap.org/data/2.5/weather?lang=en' + '&q='+ city + '&appid=' + KEY;
	    	Plugin.prototype.run();

	    },
	    setCity: function () {	 
	     $(this).empty().append(cityInput);
		 $(this).find('.get-city').focus().autocomplete({
		        serviceUrl: 'http://gd.geobytes.com/AutoCompleteCity',
		        minChars: 3,
		        ajaxSettings: {
		         dataType: "jsonp"
		        },
		        paramName: "q",
		        onInput: function (suggestion) {
		            alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
		        },
		        transformResult: function(response) {		        
		            return {
		                suggestions: $.map(response, function(dataItem) {
		                    return { value: dataItem, data: dataItem };
		                })
		            };
		        }
		    });	
		    var func = this.getNewWeather	    
		   $('.get-city').keypress(function(e) {		   	
				if (e.which == 13) {

					var city = $(".get-city").val().split(',')[0];						
					Plugin.prototype.getNewWeather.call(this, city);
					// Plugin.prototype.run();				
					//this.run();
					//localStorage.setItem($(that).index()+"isSaveCity", $(that).find(".save-city").prop("checked"));
					//if($(that).find(".save-city").prop("checked")) {
					//	localStorage.setItem($(that).index()+"currentSavedCity", $(that).find(".change-city").val());
					//}
						
				}
			}); 
	    }
	    

	});
	
    
		
	function formatDate(){
		var now = new Date();
		return {
			day: now.getDay(),
			month: now.getMonth(),
			date: now.getDate(),
			year: now.getFullYear()
		};
	}
	function getNameOfDay(today){
		var days  = ['Sunday','Monday','Tuesday','Wednesday', 'Thursday','Friday', 'Saturday'];
		return days[today];
	}
	function getNameOfMonth(todayMonth){
		var months = ['Jan.','Feb.','Mar.','Apr.','May','Jun','July','Aug.','Sept.','Oct.','Nov.','Dec.'];
		return months[todayMonth];
	}
		
})(jQuery, window, document);