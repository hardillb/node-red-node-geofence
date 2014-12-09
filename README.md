node-red-node-geofence
======================

Geofence node for Node-RED

This uses the geolib node to check if points fall with in a given area. Points are 
taken from msg.location.lat & msg.location.lon

Areas can be circular or rectangular.

Messages can be filtered depending on if they fall inside or outside the given area

The config node uses leaflet and openstreetmap data so requires internet access. 
You can drop back to a non graphical config by replacing geofence.html with 
geofence-nomap.html
