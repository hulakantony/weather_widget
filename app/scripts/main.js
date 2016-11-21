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
        <div class="remember-location-wrap">
        	<label for="save">Remember Location</label>
       		<input type="checkbox" class="save-city" id="save">
      	</div>
      </div>
      <div class="weather-info-wrap">
        <div class="weather-info-img-wrap">
          <img src="" alt="" class="weather-icon">
          <p class="weather-info-descr"></p>
        </div>

        <div class="weather-temp-wind-wrap">
          <a class="metric-switcher weather-button" href="#"></a>
          <a class="get-my-location weather-button" href="#">ML</a>
          <a class="localization-switcher weather-button" href="#"></a>
          <p class="weather-temp"></p>
          <p class="weather-wind"></p>
        </div>          
      </div>
    </div>`;
    const cityInput = '<input type="text" class="get-city" placeholder="Type city name">'
	const pluginName = 'myWeather';
	const KEY = '1d116b536241d6598ce05b34c44408a9';
	let apiURL = 'http://api.openweathermap.org/data/2.5/weather?lang=en';
	var defaults = {
		position: {						
			units: 'c',
			city: null,
			lat: null,
			lng: null		
			},
		detectLoc: true,
		lang: 'en'				
		};	
	function Plugin(element, options){		
		this.element = element;
		this._name = pluginName + $(this.element).index();		
		this.settings = $.extend({}, defaults, options, this.getState(this._name));		
		this.init();
		
	}	
	$.fn[ pluginName ] = function( options ) {		
		return this.each( function() {				
			if ( !$.data( this, 'plugin_' + pluginName ) ) {
				$.data( this, 'plugin_' +
					pluginName, new Plugin( this, options ) );
			}
		} );
	};
	$.extend(Plugin.prototype, {
		init(){	
			var self = this;		
			this.execute();
			apiURL = 'http://api.openweathermap.org/data/2.5/weather?';
			setInterval(function(){				
				apiURL += 'lang=' + self.settings.lang + '&q='+ self.settings.position.city+ '&appid='+ KEY;
				self.run();
			}, 3600000);	
		},
		changeDetectLoc(e) {
      		this.settings.detectLoc = e.target.checked;
      		this.saveState();
      		$(this.element).find('.remember-location-wrap').fadeOut()
    	},
		saveState() {
        	var s = this.settings;
        	var newState = s.detectLoc ? {position: s.position} : {detectLoc: false};
        	localStorage.setItem(this._name, JSON.stringify(newState));
    	},
		getState(key) {
      		return JSON.parse(localStorage.getItem(key));
    	},
    	renewWidget(){
    		var self = this;
    		//console.log(this)
    		console.log('----->',self.settings.lang)
    		apiURL += 'lang=' +self.settings.lang + '&q='+self.settings.position.city+ '&appid='+ KEY;
    		self.run()
    	},
		execute(){					
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
		getCurrentLocation(){
			var location = 'http://ip-api.com/json';
			var self = this;
			if($(this.element).find('.localization-switcher').html() === 'RU'){
				fetch(location).then(data => {
					return data.json();
				}).then(we => {						
					apiURL += '&lat='+ we.lat +'&lon='+ we.lon +'&appid='+ KEY;
					this.run();
				})	
				apiURL = 'http://api.openweathermap.org/data/2.5/weather?';	
			} else {
				fetch(location).then(data => {
					return data.json();
				}).then(we => {						
					apiURL += 'lang=ru' + '&lat='+ we.lat +'&lon='+ we.lon +'&appid='+ KEY;
					this.run();					
				})	
				apiURL = 'http://api.openweathermap.org/data/2.5/weather?';	
			}
			this.settings.position.city = $(self.element).find('.weather-place').html().split(',')[0];	
			console.log(this.settings.position.city)	
		},
		run(){
			var self = this;
			fetch(apiURL).then((data)=>{				
				return data.json();
			}).then((we)=>{
				self.renderElements.bind(this)(self.parseData.bind(this)(we));
			});	
			apiURL = 'http://api.openweathermap.org/data/2.5/weather?';		
		},		
		parseData(data){
	      if (data.cod == 404){
	        return null;
	      }	  	      
	      var u = this.settings.position.units;	      
	      var parsedData = {};
	      var KELVIN = 273;	 	      
	      if(u === 'c' || !u){
	      	parsedData.temp = (Math.round(data.main.temp) - KELVIN) + '°C';
	      } else {
	      	parsedData.temp = ((Math.round(data.main.temp) - KELVIN) * 1.8 + 32).toFixed(0) + '°F';
	      }	     	      
	      parsedData.icon = data.weather[0].icon;
	      parsedData.descr = data.weather[0].description;	     
	      parsedData.place = data.name + ', ' + data.sys.country;
	      if(this.settings.lang === 'en'){
	      	parsedData.wind = ~~data.wind.speed + 'mph';
	      } else {
	      	parsedData.wind = ~~(data.wind.speed * 1.60934) + 'км/ч';
	      }
	      return parsedData;
	    },	   
	    renderElements (data){	
	    	var self = this;	    
	    	var el = $(this.element);
	    	if(!el.html())	{  

	    		el.html(widgetHtml); 
	    		el.find('.localization-switcher').html('RU')
	    		el.find('.metric-switcher').click(function(e){
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
				el.find('.get-my-location').click((e) => {
					e.preventDefault();
					this.getCurrentLocation();
				});
				el.find('.localization-switcher').click(function(e){
					e.preventDefault();
					if($(this).html() === 'RU'){
						apiURL += 'lang=ru&q='+self.settings.position.city+ '&appid='+ KEY;
						$(this).html('EN');
						self.settings.lang = 'ru';
						self.run();
						apiURL = 'http://api.openweathermap.org/data/2.5/weather?';
					} else {
						apiURL += 'lang=en&q='+self.settings.position.city+ '&appid='+ KEY;
						$(this).html('RU');
						self.settings.lang = 'en';
						self.run();
						apiURL = 'http://api.openweathermap.org/data/2.5/weather?';
					}
				});
	    	}	
	    	if(el.find('.localization-switcher').html() === 'EN'){
	    		el.find('.weather-day').html(getRusNameOfDay(formatDate().day));
	    		el.find('.weather-month').html(getRusNameOfMonth(formatDate().month));
	    	} else {
	    		el.find('.weather-day').html(getNameOfDay(formatDate().day));
	    		el.find('.weather-month').html(getNameOfMonth(formatDate().month));

	    	}   		 		
	    	el.find('.weather-temp').html(data.temp);
	    	el.find('.weather-info-descr').text(data.descr);	    	
	    	el.find('.weather-place').text(data.place);	    	
	    	el.find('.weather-date').html(formatDate().date);
	    	el.find('.weather-wind').text(data.wind);	    	
			el.find('.weather-year').html(formatDate().year);
			var iconURL = 'http://openweathermap.org/img/w/'+data.icon+'.png';						
			el.find('.weather-icon').attr('src', iconURL);
			if(this.settings.position.units === 'c' || !this.settings.position.units){
				el.find('.metric-switcher').html('F');			
			} else {
				el.find('.metric-switcher').html('C');
			}
			
			el.find('.weather-place').on('click', this.setCity.bind(this));	
			el.find('.save-city').click(this.changeDetectLoc.bind(this));
				
			this.settings.position.city = $(self.element).find('.weather-place').html().split(',')[0];			
	    },	    
	    getNewWeather(city){	       	
	    	apiURL =  'http://api.openweathermap.org/data/2.5/weather?lang=en' + '&q='+ city + '&appid=' + KEY;
	    	this.run();
	    },
	    setCity() {	
	    var savedPlace =  $(this.element).find('.weather-place').html();	         	
	     $(this.element).find('.weather-place').empty().append(cityInput);
	     $(this.element).find('.save-city').attr('checked', false);
		 $(this.element).find('.get-city').focus().autocomplete({
		        serviceUrl: 'http://gd.geobytes.com/AutoCompleteCity',
		        minChars: 3,
		        ajaxSettings: {
		         dataType: 'jsonp'
		        },
		        paramName: 'q',
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
		    $(this.element).find('.remember-location-wrap').fadeIn();	    	    
		   $('.get-city').keypress((e) => {		   	
				if (e.which == 13) {					
					var city = $('.get-city').val().split(',')[0];											
					this.getNewWeather(city);					
					this.settings.position.city = city +'';
					this.settings.lang = 'en';						
				}
			});	
			
			$('.get-city').blur((e) => {
				 $(this.element).find('.weather-place').html(savedPlace);
				 $(this.element).find('.remember-location-wrap').fadeOut();
			}) 
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
	function getRusNameOfMonth(todayMonth){
		var months = ['Янв.','Фев.','Мар.','Апр.','Май','Июнь','Июль','Авг.','Сен.','Окт.','Ноя.','Дек.'];
		return months[todayMonth];
	}
	function getRusNameOfDay(today){
		var days  = ['Воскресение','Понедельник','Вторник','Среда', 'Четверг','Пятница', 'Суббота'];
		return days[today];
	}
		
})(jQuery, window, document);
