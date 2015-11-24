var app = app || {};

app.main = (function() {

	var socket;

	var socketSetup = function(callback){
		console.log('Called socketStart.');
	    socket = io.connect();

	    // Listeners
	    socket.on("return-first", function(data){
	    	render("article", "#main-container", 'replace', data.article);
	    	render("link-list", "#main-container", 'append', data.nextLinks);
	    })

	    socket.on("return-next", function(doc){
	    	render("article", "#main-container", 'append', doc.article);
	    	render("link-list", "#main-container", 'append', doc.nextLinks);
	    });

	}

	var initArticles = function(){
		socket.emit("start");
	}

	var render = function(template, containerElement, method, data){
		console.log(method + ' ' + template + ' in ' + containerElement);
		if(data !== undefined){
			console.log(data);
		}

		var templateToCompile = $('#tpl-' + template).html();
		var compiled =  _.template(templateToCompile);

		if(method === 'replace'){
			$(containerElement).html(compiled({data: data}));	
		}else if(method === 'append'){
			$(containerElement).append(compiled({data: data}));
		}

		// AUTO SCROLL
		// $('#main-container').css('scrollHeight', '';
		// var objDiv = document.getElementById("main-container");
		// objDiv.scrollTop = objDiv.scrollHeight;

        attachEvents();
	};

	var attachEvents = function(){
		//listening for clicks. 
	}

	var init = function(){
		console.log('Initializing app.');
		socketSetup();
		attachEvents();
		initArticles();
	};

	return {
		init: init,
	};

})();

window.addEventListener('DOMContentLoaded', app.main.init);

