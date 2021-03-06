$(function(){
	var uri = 'http://transport.opendata.ch/api.php/v1/stationboard';
	var station = '008587907';
	
	// adding title
	$.textArea({ height: '20%', fontSize: 40, fontFamily: 'Helvetica, Arial', fontWeight: 'bold', fill: '#A20D0D' }).text('Prochains départs depuis Genève Plainpalais').addTo('svg');

	$.get(uri, {id: station, limit: 9}, function(data) {
	    // $('#stationboard tbody').empty();
		
		var dataArray = [];
		$(data.stationboard).each(function () {
			var prognosis, delay, line = '';
			var departureAll = this.stop.departure.split('T');
			var departureTime = departureAll[1];
			var departure = departureTime.split(':');
			var departureString = departure[0] + ':' + departure[1];
			if (this.stop.prognosis.time) {
		        prognosis = this.stop.prognosis.time.split(':');
		        delay = (parseInt(prognosis[0]) * 60 + parseInt(prognosis[1])) - (parseInt(departure[0]) * 60 + parseInt(departure[1]));
				dataArray.push($.textArea({ top: '80%', displayAlign: 'before', fontSize: 48, fontFamily: 'Helvetica, Arial' }).text($.tspan(departureString + ' ').tspan(delay + ' min',{fontWeight: 'bold'}).tbreak().tspan(this.name, {fill: '#666666'}).tbreak().tspan(this.to, {fill: '#666666', fontSize: 28})));
		    }
			else
			{
				dataArray.push($.textArea({ top: '80%', displayAlign: 'before', fontSize: 48, fontFamily: 'Helvetica, Arial' }).text($.tspan(departureString).tbreak().tspan(this.name, {fill: '#666666'}).tbreak().tspan(this.to, {fill: '#666666', fontSize: 28})));
		    }
		});
		
		$.table({
	        top: '20%',
	        rows: 3,
	        columns: 3,
	        data: dataArray,
	        renderToSVG: function() {
	          return $.g().add([ this ]);
	        }
	      }).addTo('svg');
	}, 'json');
	
});