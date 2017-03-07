/**
 * Copyright 2016 IBM Corp.
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

module.exports = function(RED) {
    "use strict";
    var geolib = require('geolib');
    var path= require('path');

    function geofenceNode(n) {
        RED.nodes.createNode(this,n);
        this.mode = n.mode;
        this.name = n.name;
        this.centre = n.centre;
        this.points = n.points;
        this.radius = n.rad;
        this.inside = n.inside;
        var node = this;

        node.on('input', function(msg) {
            var loc = undefined;

            if (msg.location && msg.location.lat && msg.location.lon) {
                loc = {
                    latitude: msg.location.lat,
                    longitude: msg.location.lon
                };
            } else if (msg.lon && msg.lat) {
                loc = {
                    latitude: msg.lat,
                    longitude: msg.lon
                };
            } else if (typeof(msg.payload) === 'object' && msg.payload.lat && msg.payload.lon) {
                loc = {
                    latitude: msg.payload.lat,
                    longitude: msg.payload.lon
                };
            }
            
            if (node.name) {//add shape to list of areas of interest if it has a name
                var flowContext = this.context().flow;
                var shapes = flowContext.get('shapes') || {};
                if(! shapes[node.name]) {
                    if (node.mode === 'circle') {
                        shapes[node.name] = {
                            mode: node.mode,
                            centre: node.centre,
                            radius: node.radius
                        };
                    } else {
                        shapes[node.name] = {
                            mode: node.mode,
                            points: node.points
                        };
                    }
                    flowContext.set('shapes', shapes);
                }
            }
            
            if (loc) {
                var inout = false;
                if (node.mode === 'circle') {
                    inout = geolib.isPointInCircle( loc, node.centre, Math.round(node.radius) );
                } else {
                    inout = geolib.isPointInside( loc, node.points );
                }

                if (inout && (node.inside === "true")) {
                    if (node.name) { 
                        if (!msg.location) {
                            msg.location = {};
                        }
                        msg.location.isat = msg.location.isat || [];
                        msg.location.isat.push(node.name);
                    }
                    node.send(msg);
                }

                if (!inout && (node.inside === "false")) {
                    node.send(msg);
                }

                if (node.inside === "both") {
                    if (!msg.location) {
                        msg.location = {};
                    }

                    msg.location.inarea = inout;
                    if (node.name) { // if there is a name
                        msg.location.isat = msg.location.isat || [];
                        if (inout) { // if inside then add name to an array
                            msg.location.isat.push(node.name);
                        }
                        else { // if outside remove name from array
                            if (msg.location.hasOwnProperty("isat")) {
                                var i = msg.location.isat.indexOf(node.name);
                                if (i > -1) {
                                    msg.location.isat.splice(i, 1);
                                }
                            }
                        }
                        msg.location.inarea = msg.location.isat.length;

                        //add distrance to centroid of area
                        var distance;
                        if (node.mode === 'circle') {
                            distance = geolib.getDistance(node.centre, loc);
                        } else {
                            var centroid = geolib.getCenter(node.points);
                            distance = geolib.getDistance(centroid, loc);
                        }
                        msg.location.distances = msg.location.distances || [];
                        var d = {};
                        d[node.name] = distance;
                        msg.location.distances.push(d);

                        msg.location.shapes = msg.location.shapes || {};
                        var shapes = msg.location.shapes;
                        if(! shapes[node.name]) {
                            if (node.mode === 'circle') {
                                shapes[node.name] = {
                                    mode: node.mode,
                                    centre: node.centre,
                                    radius: node.radius
                                };
                            } else {
                                shapes[node.name] = {
                                    mode: node.mode,
                                    points: node.points
                                };
                            }
                        }

                    }
                    node.send(msg);
                }
            }
        });
    }
    RED.nodes.registerType("geofence",geofenceNode);

    RED.httpAdmin.get('/geofence/js/*', function(req, res){
        var options = {
            root: __dirname + '/static/',
            dotfiles: 'deny'
        };

        res.sendFile(req.params[0], options);

        // var filename = path.join(__dirname , 'static', req.params[0]);
        // res.sendfile(filename);
    });
};
