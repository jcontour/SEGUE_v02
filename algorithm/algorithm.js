var datalevel = 1;

var compareData = function(keywordArray, docArray, callback){
    console.log("comparing data");

    // console.log(docArray);
    var matching_ids = [];
    var matching_keywords = [];
    var matching_ids_objs = [];

    //for number of trending keywords
    for (var i = 0; i < keywordArray.length; i++){
        //in all child articles
        for(var j = 0; j < docArray.length; j++){
			//for length of child keyword array
            for(var k = 0; k < docArray[j].keywords.length; k++){
				//if keyword matches trending keyword
                if (keywordArray[i] == docArray[j].keywords[k]){
                    if (matching_ids.indexOf(docArray[j]._id) == -1 && matching_keywords.indexOf(docArray[j].keywords[k]) == -1 && matching_ids.length < 10){
                    	// console.log(docArray[j]._id)
                        matching_ids.push(docArray[j]._id);
                        matching_keywords.push(docArray[j].keywords[k]);

                        matching_ids_objs.push({
                        	id : docArray[j]._id, 
                        	keyword: docArray[j].keywords[k],
                        	level: datalevel
                        });
                    }
                }
            }
        }
    }

    matching_ids.sort()
    // console.log(matching_ids);
    // console.log(matching_keywords);
    callback(matching_ids_objs);
    datalevel ++;
}

var algorithm = {
	
	start: function(keywordArray, docArray, callback){
		console.log("i'm doing algorithm things!!");
		compareData(keywordArray, docArray, function(matching_ids){
			callback(matching_ids);
		});
	}
}

module.exports = algorithm;