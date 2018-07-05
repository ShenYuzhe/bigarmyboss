/*
    Following is simple Math Utils
*/
function randomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}
exports.randomInt = randomInt;

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
exports.Eclipse = Eclipse;

function Point(x, y) {
    return {'x': x, 'y': y};
}
exports.Point = Point;

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
exports.randomEclipsePoint = randomEclipsePoint;

function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}
exports.distance = distance;
