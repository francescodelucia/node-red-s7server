module.exports = function(RED) {
    function Snap7ServerNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;        
        
		var IPSERVER=""; 
		var SERVER_= undefined;
		var NUM_DATA=0;
		
		node.on('input', function(msg,send,done) {	
					
			if(SERVER_ == undefined){
				
				if(config.ipserver){					
					IPSERVER = config.ipserver;
				}
				var snap7 = require('node-snap7'); 
				var s7server = new snap7.S7Server();
				SERVER_ = s7server;
							
				// Set up event listener
				SERVER_.on("event", function(event) {
					if(config.consolelog==true){
						console.log(SERVER_.EventText(event));
					}
				});
												
				NUM_DATA=count_id;
				if(SERVER_.ServerStatus() == s7server.SrvStopped){ 
					s7server.StartTo(IPSERVER);
				}
			}
			else{
				for (step = 0; step <= NUM_DATA; step++) {
					SERVER_.UnregisterArea(SERVER_.srvAreaDB, step);
				}
				var count_id =0;
				config.rules.forEach(element => {
					count_id++;
					if(element['t']=="DB")
					{
						if(element['vt']=="str"){
							var db1 = new Buffer(10).fill(element['v']);
							SERVER_.RegisterArea(SERVER_.srvAreaDB, count_id, db1);
						}
						else if(element['vt']=="msg"){
							var ind = parseInt(element['v']);
							if(ind == NaN) ind=0;
							var val = msg.payload[ind];
							if(config.consolelog==true){
								console.log("modbus element " + ind + ":"+  val);
							}
							var db1 = new Uint16Array(10).fill(val);
							SERVER_.RegisterArea(SERVER_.srvAreaDB, count_id, db1);
						}
						else if(element['vt']=="num"){
							var db1 = new Buffer(10).fill(parseInt(element['v']));
							SERVER_.RegisterArea(SERVER_.srvAreaDB, count_id, db1);
						}
					}
				});	
				NUM_DATA=count_id;
			}
			//console.log((msg.payload);
			//msg.payload = "Ok!";
			send(msg);
			if (done) {
				done();
			}
        });        
        node.on('close', function() {
			SERVER_.Stop();
			SERVER_.UnregisterArea(s7server.srvAreaDB, 1);
		});
		
    }
    RED.nodes.registerType("snap7-server",Snap7ServerNode);
}

