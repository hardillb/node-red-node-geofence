node-red-node-geofence
======================

Geofence node for Node-RED

This uses the geolib node to check if points fall with in a given region. Points are 
taken from the first of the following msg properties in this order:

 1. msg.location.lat & msg.location.lon
 2. msg.lat & msg.lon
 3. msg.payload.lat & msg.payload.lon

Region can be circular, rectangular or polygons and are drawn on to a map in the 
config node.

![screenshot of config node](https://raw.githubusercontent.com/hardillb/node-red-node-geofence/master/screenshot.png)

Messages can be filtered depending on if they fall inside or outside the given region
or the node can append the node name to a list of areas the msg falls in (to allow the
chaining of geofence nodes).

The list is stored in msg.location.isat in the following format:

```
msg.location: {
    inarea: true,
    isat: [
      'firstArea',
      'secondArea'
    ],
    distances: {
      'firstArea': 100,
      'secondArea': 15
    }
}
```


And also includes the distance in meters from the centre (or centroid for polygons) of the
region. 

The config node uses leaflet and openstreetmap data so requires internet access. 
You can drop back to a non graphical config by replacing geofence.html with 
geofence-nomap.html

Possible breaking changes moving from version 0.0.x to 0.1.0.

These are arround the "add 'inarea'" mode

 - msg.location.inarea is always a boolean and now just reflects the last geofence 
 node that the message passes through
 - msg.location.distances is now just an object using the name as a key, rather than 
 an array of objects