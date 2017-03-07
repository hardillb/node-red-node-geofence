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

The message.locations is augmented by a property called `shapes` which contains shapes of
geofence nodes the message traverses when nodes are in `add « inarea » property` action mode.
Nodes must have a name. Shapes have the name of their respective nodes.

The following function node code transforms and sends geofence shapes to a node-red-contrib-web-worldmap node for display.
It is possible to change shape stroke and fill. See node-red-contrib-web-worldmap for details.

```
var shapes = msg.locations.shapes;

if(shapes) {
    Object.keys(shapes).forEach(function(key,index) {
        msg.payload = {};
        msg.payload.name = key;
        if(shapes[key].points) {
            msg.payload.area = [];
            for(var i = 0; i < shapes[key].points.length; i++) {
                msg.payload.area.push([shapes[key].points[i].latitude, shapes[key].points[i].longitude])
            }
        } else if(shapes[key].radius) {
            msg.payload.radius = shapes[key].radius;
            msg.payload.lat = shapes[key].centre.latitude;
            msg.payload.lon = shapes[key].centre.longitude;
        }
        node.send(msg);
    });
}
```
