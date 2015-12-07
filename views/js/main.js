var app = app || {};

app.main = (function() {

	var socket;

	var socketSetup = function(callback){
		console.log('Called socketStart.');
	    socket = io.connect();

	    // Listeners
	    socket.on("return-article", function(data){
	    	$('.article-container').remove();
	    	render("article", data.article);
	    	render("link-list", data.nextLinks);
	    });

	    socket.on("show-profile", function(data){
	    	for (var i = 0; i < data.length; i ++){
		    	console.log(data[i].articleTitle);
	    	}
	    	render("user-profile", data);
	    })

	}

	var render = function(template, data){
		console.log('rendering ' + template);
		if(data !== undefined){
			// console.log(data);
		}

		var templateToCompile = $('#tpl-' + template).html();
		var compiled =  _.template(templateToCompile);

		$('#main-container').append(compiled({data: data}));
		
		// AUTO SCROLL
		var objDiv = document.getElementById("main-container");
		objDiv.scrollLeft = objDiv.scrollWidth;
        attachEvents();
	};

	var attachEvents = function(){
		$('.link').click(function(){
			$(this).addClass("active");
			socket.emit("find-next", this.id);
			socket.emit("track-articles", this.id);
		})

		$('#user-profile').click(function(){
			console.log("opening profile");
			socket.emit("get-profile");
		})

		$('#close-profile').click(function(){
			console.log("closing profile");
			$('#profile-container').remove();
		})

		$('#profile-container').click(function(){
			console.log("closing profile");
			$(this).remove();	
		})

	}

	var init = function(){
		console.log('Initializing app.');
		socketSetup();
		attachEvents();
	};

	return {
		init: init,
	};

})();

window.addEventListener('DOMContentLoaded', app.main.init);

