"use strict";

var BossGeoClient = require("bossgeo").BossGeoClient,
    geo = new BossGeoClient(process.env.CONSUMER_KEY,
                            process.env.CONSUMER_SECRET),
    express = require("express"),
    app = express();

app.get("/", function(req, res) {
  geo.placefinder({
    q: req.query["q"]
  }, function(err, rsp) {
    if (err) {
      console.warn(err);
      return res.send(500);
    }

    var results = rsp.results.map(function(x) {
      var radius = +x.radius;
      var zoom;

      if (radius >= 1000000) {
        zoom = 10;
      } else if (radius >= 100000) {
        zoom = 12;
      } else if (radius >= 10000) {
        zoom = 14;
      } else {
        zoom = 16;
      }

      return {
        name: [x.city, x.state, x.country].join(", "),
        latitude: +x.latitude,
        longitude: +x.longitude,
        zoom: zoom
      };
    });

    res.jsonp(results);
  });
});

app.listen(process.env.PORT || 8080, function() {
  console.log("Listening at http://%s:%d/", this.address().address, this.address().port);
});
