var algorithm = {

	function compareData(keywordArray, docArray, callback){
    console.log("comparing data");

    // console.log(docArray);
    var matching_ids = [];

    //for number of trending keywords
    for (var i = 0; i < keywordArray.length; i++){
        //in all child articles
        for(var j = 0; j < docArray.length; j++){
            //for length of child keyword array
            for(var k = 0; k < docArray[j].keywords.length; k++){
                //if keyword matches trending keyword
                if (keywordArray[i] == docArray[j].keywords[k]){
                    if (matching_ids.indexOf(docArray[j].id) == -1){
                        matching_ids.push(docArray[j].id);
                    }
                }
            }
        }
    }
    callback(matching_ids);
}
	
	start: function(keywordsArray, docArray, callback){
		console.log("i'm doing algorithm things!!");
		compareData(keywordsArray, docArray, function(matching_ids){
			callback(matching_ids);
		});
	}

}

module.exports = algorithm;