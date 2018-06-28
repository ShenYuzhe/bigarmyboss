var plotly = require('plotly')('', '')

/*
    Following is simple Math Utils
*/
function randomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}

function Eclipse(a, b, center) {
    return {
        'a': a,
        'b': b,
        'x': center.x,
        'y': center.y,
        'inEclipse': function(p) {
            return (p.x - center.x) ** 2 / this.a ** 2 + 
                   (p.y - center.y) ** 2 / this.b ** 2 <= 1;
        }
    };
}

function Point(x, y) {
    return {'x': x, 'y': y};
}

function randomEclipsePoint(e) {
    while(true) {
        var x = randomInt(-e.a + e.x, e.a + e.x);
        var y = randomInt(-e.b + e.y, e.b + e.y);
        var p = Point(x, y);
        if (e.inEclipse(p)) {
            return p;
        }
    }
}

/*
    Following is map api
*/
var MAP_LIMIT = 5;
var ETHIC_LIMIT = 3;

var ethics = {
    han: {
        code: 1,
        region: Eclipse(20000, 5000, Point(0, 0)),
    },
    mongolia: {
        code: 2,
        region: Eclipse(15000, 3000, Point(0, 4000))
    }
}

// fake stub, will integrate database later
function isCreated(n) {
    return false;
}

function padding(n, l) {
    var f = n / Math.pow(10, l);
    var s = f.toFixed(l) + '';
    return s.substr(s.indexOf('.') + 1);
}
/*
| ethic    | x axis   | y axis   |
| 3 digits | 5 digits | 5 digits |
*/
function getAccountId(e, p) {
    return padding(e, ETHIC_LIMIT) + 
           padding(p.x, MAP_LIMIT) +
           padding(p.y, MAP_LIMIT);
}
function createCityByEthic(ethicName) {
    var ethic = ethics[ethicName];
    var accountId, loc;
    do {
        loc = randomEclipsePoint(ethic.region);
        accountId = getAccountId(ethic.code, loc);
    } while (isCreated(accountId));
    return {
        'account': accountId,
        'location': loc
    };
}

/* Following is simple demo methods*/
var han = {x: [], y: []};
var mongolia = {x: [], y: []};
for (var i = 0; i < 1000; i++) {
    var h_p = createCityByEthic('han');
    han.x.push(h_p.location.x);
    han.y.push(h_p.location.y);
    var m_p = createCityByEthic('mongolia');
    mongolia.x.push(m_p.location.x);
    mongolia.y.push(m_p.location.y);
}

console.log("end retreive data and start drawing");

var trace1 = {
    x: han.x,
    y: han.y,
    type: 'pointcloud'
};

var trace2 = {
    x: mongolia.x,
    y: mongolia.y,
    type: 'pointcloud'
}

var data = [trace1, trace2];
var graphOptions = {filename: 'two_countries', fileopt: 'overwrite'};
plotly.plot(data, graphOptions, function(err, msg) {
    console.log(msg);
});