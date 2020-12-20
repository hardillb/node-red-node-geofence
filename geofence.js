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

    function geofenceNode(n) {
        RED.nodes.createNode(this,n);
        this.mode = n.mode;
        this.name = n.name;
        this.centre = n.centre;
        this.points = n.points;
        this.radius = n.rad;
        this.inside = n.inside;
        this.floor = parseInt(n.floor || "");
        this.ceiling = parseInt(n.ceiling || "");
        var node = this;

        node.on('input', function(msg, send, done) {
            var loc = undefined;

            send = send || function() { node.send.apply(node,arguments) }

            if (msg.hasOwnProperty('location') && msg.location.hasOwnProperty('lat') && msg.location.hasOwnProperty('lon')) {
                loc = {
                    latitude: msg.location.lat,
                    longitude: msg.location.lon,
                    elevation: msg.location.alt || msg.location.altitude
                };
            } else if (msg.hasOwnProperty('lon') && msg.hasOwnProperty('lat')) {
                loc = {
                    latitude: msg.lat,
                    longitude: msg.lon,
                    elevation: msg.alt || msg.altitude
                };
            } else if (typeof(msg.payload) === 'object' && msg.payload.hasOwnProperty('lat') && msg.payload.hasOwnProperty('lon')) {
                loc = {
                    latitude: msg.payload.lat,
                    longitude: msg.payload.lon,
                    elevation: msg.payload.alt || msg.payload.altitude
                };
            }

            if (loc) {
                var inout = false;
                if (node.mode === 'circle') {
                    inout = geolib.isPointInCircle( loc, node.centre, Math.round(node.radius) );
                }
                else {
                    inout = geolib.isPointInside( loc, node.points );
                }

                if (loc.elevation && !isNaN(node.floor) && loc.elevation < node.floor) { inout = false; }
                if (loc.elevation && !isNaN(node.ceiling) && loc.elevation > node.ceiling) { inout = false; }

                if (inout && (node.inside === "true")) {
                    if (node.name) {
                        if (!msg.location) {
                            msg.location = {};
                        }
                        msg.location.isat = msg.location.isat || [];
                        msg.location.isat.push(node.name);
                    }
                    send(msg);
                    if (done) {
                        done();
                    }
                    return
                }

                if (!inout && (node.inside === "false")) {
                    send(msg);
                    if (done) {
                        done();
                    }
                    return;
                }

                if (node.inside === "both") {
                    if (!msg.hasOwnProperty("location")) {
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

                        //add distrance to centroid of area
                        var distance;
                        if (node.mode === 'circle') {
                            distance = geolib.getDistance(node.centre, loc);
                        } else {
                            var centroid = geolib.getCenter(node.points);
                            distance = geolib.getDistance(centroid, loc);
                        }
                        msg.location.distances = msg.location.distances || {};
                        msg.location.distances[node.name] = distance;
                    }
                    send(msg);
                    if (done) { done(); }
                    return;
                }
            }
            else {
                //no location
                if (done) {
                    done("No location found in message")
                } else {
                    node.error("No location found in message", msg);
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
