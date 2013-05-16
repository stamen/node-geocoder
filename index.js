"use strict";

if (!process.env.CONSUMER_KEY || !process.env.CONSUMER_SECRET) {
  console.error("Please provide CONSUMER_KEY and CONSUMER_SECRET");
  process.exit(1);
}

var BossGeoClient = require("bossgeo").BossGeoClient,
    cors = require("cors"),
    geo = new BossGeoClient(process.env.CONSUMER_KEY,
                            process.env.CONSUMER_SECRET),
    express = require("express"),
    app = express();

// radius of the earth in meters
var RADIUS = 40075016.69;
var π = Math.PI;

app.configure(function() {
  app.use(express.logger());
  app.use(express.compress());
  app.use(cors());
});

app.get("/", function(req, res) {
  var smallEdge = Math.min(req.query.w || 1000, req.query.h || 768);

  if (!req.query.q) {
    return res.send(404);
  }

  geo.placefinder({
    q: req.query.q
  }, function(err, rsp) {
    if (err) {
      console.warn(err);
      return res.send(500);
    }
    //console.log(rsp);

    var results = (rsp.results || []).map(function(x) {
      var radius = +x.radius;
      var zoom = -Math.round(Math.log((radius) / (RADIUS / Math.cos(+x.latitude * π / 180)) / Math.log(smallEdge)));

      return {
        name: [x.city, x.state, x.country].filter(function(x) { return !!x; }).join(", "),
        latitude: +x.latitude,
        longitude: +x.longitude,
        state: x.statecode,
        zoom: zoom
      };
    });

    res.jsonp(results);
  });
});

app.listen(process.env.PORT || 8080, function() {
  console.log("Listening at http://%s:%d/", this.address().address, this.address().port);
});
