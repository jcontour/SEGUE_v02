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
	    	render("user-profile", data)
	    	$('#profile-container').fadeIn();
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
		$('.link').off('click').on('click',function(){
			$(this).addClass("active");
			socket.emit("find-next", this.id);
			socket.emit("track-articles", {id : this.id, keyword: $(this).text()});
		})

		$('#user-profile').off('click').on('click', function(){
			console.log("opening profile");
			socket.emit("get-profile");
		})

		$('#close-profile').off('click').on('click',function(){
			console.log("closing profile");
			$('#profile-container').fadeOut().remove();
		})

		$('#profile-container').off('click').on('click',function(){
			console.log("closing profile");
			$(this).fadeOut().remove();
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

