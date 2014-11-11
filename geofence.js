/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// Require main module
//var RED = require(process.env.NODE_RED_HOME+"/red/red");
module.exports = function(RED) {

var geolib = require('geolib');

function geofenceNode(n) {
	RED.nodes.createNode(this, n);
	this.mode = n.mode;
	this.centre = n.centre;
	this.points = n.points;
	this.radius = n.rad;
	this.inside = n.inside;

	var node = this;

	this.on('input', function(msg){
		if (msg.location) {
			var loc = msg.location;
			if (node.mode ==='circle') {
				if (geolib.isPointInCircle(
						msg.location,
						node.centre,
						Math.round(node.radius)
					) === (node.inside == "true")) {
					node.send(msg);
				}
			} else {
				if (geolib.isPointInside(
						msg.location,
						node.points
					) === (node.inside == "true")) {
					node.send(msg);
				}

			}
		}
	});
};

RED.nodes.registerType("geofence",geofenceNode);
};