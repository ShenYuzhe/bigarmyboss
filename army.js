var math_utils = require('./math_utils');
var distance = math_utils.distance;
var Point = math_utils.Point;
var randomInt = math_utils.randomInt;

var battleStatus = {
    'NORMAL': 'NORMAL',
    'FIGHT': 'FIGHT'
};

/*
    Soldier Definition
*/
function Soldier() {
    return {
        id: randomInt(0, 10000),
        name: '',
        legion: undefined,
        loc: Point(0, 0),
        staus: battleStatus.NORMAL,
        focus: undefined,
        action: undefined,
        onAttack: undefined,
    }
}

SoldierBuilder = function() {
    return {
        solider: Soldier(),
        withName: function(name) {
            this.solider.name = name;
            return this;
        },
        withLegion: function(legion) {
            this.solider.legion = legion;
            return this;
        },
        withLoc: function(loc) {
            this.solider.loc = loc;
            return this;
        },
        withType: function(type) {
            for (k in type.soldier) {
                this.solider[k] = type.soldier[k];
            }
            return this;
        },
        build: function() {
            return this.solider;
        }
    };
}

/* Legion Definition */
function Legion() {
    return {
        focus: undefined,
        stauts: battleStatus.NORMAL,
        stand: undefined,
        loc: undefined,
        type: undefined,
        soldiers: undefined,
        action: undefined,
        deadCnt: 0
    }
}

function LegionBuilder() {
    return {
        legion: Legion(),
        withStand: function(stand) {
            this.legion.stand = stand;
            return this;
        },
        withLoc: function(loc) {
            this.legion.loc = loc;
            return this;
        },
        withType: function(type) {
            for (k in type.legion) {
                this.legion[k] = type.legion[k];
            }
            return this;
        },
        withSoldiers: function(soldiers) {
            this.legion.soldiers = soldiers;
            return this;
        },
        build: function() {
            return this.legion;
        }
    }
}

/* Action Type Collection */
var ACTS = {
    WAIT: function() {
        return {
            'type': 'WAIT'
        }
    },
    MOVE: function(direct, amount) {
        return {
            'type': 'MOVE',
            'direct': direct,
            'amount': amount
        }
    },
    MOVE_TO: function(from, loc) {
        return {
            'type': 'MOVE_TO',
            'from': from,
            'loc': loc
        }
    },
    ATTACK: function(from, to) {
        return {
            'type': 'ATTACK',
            'from': from,
            'to': to
        }
    }
}

/*
    Soldier callbacks definition
    Naive soldier act and onAct definition
    Naive Legion act callback
*/
function naiveSoldierAct(legion) {
    if (this.focus != undefined &&
        distance(this.focus.loc, this.loc) < this.arm) {
        return ACTS.ATTACK(this, this.focus);
    }
    var shortest = Number.MAX_SAFE_INTEGER;
    for(var i = 0; i < legion.length; i++) {
        var enemy = legion[i];
        if (enemy == undefined ||
            enemy.id == this.id ||
            enemy.status == battleStatus.FIGHT) {
            continue;
        }

        var dist = distance(this.loc, enemy.loc);
        if (dist < shortest) {
            shortest = dist;
            this.focus = enemy;
        }
    }
    if (this.focus != undefined &&
        shortest <= this.arm) {
        return ACTS.ATTACK(this, this.focus);
    } else if (this.focus != undefined) {
        return ACTS.MOVE_TO(this, this.focus.loc);
    }
    return ACTS.WAIT();
}

function naiveSoldierOnAttack(enemy) {
    console.log(this.name + ' got attacked by ' +
                enemy.name + " current health: " + this.health);
    var dist = distance(this.loc, enemy.loc);
    if (this.focus == undefined) {
        this.focus = enemy;
    }
}

function legionAction(context) {
    if (this.focus == undefined) {
        var minDist = Number.MAX_SAFE_INTEGER;
        for (var i = 0; i < context.length; i++) {
            var legion = context[i];
            if (legion.stand == this.stand) {
                continue;
            }
            var dist = distance(this.loc, legion.loc);
            if (dist < minDist) {
                minDist = dist;
                this.focus = legion;
            }
        }
    }
    var actions = [];
    for (var i = 0; this.focus &&
                    i < this.soldiers.length;
                    i++) {
        var soldier = this.soldiers[i];
        if (soldier == undefined) {
            continue;
        }
        var action = soldier.action(this.focus.soldiers);
        actions.push(action);
        if (action.type == 'ATTACK') {
            this.status = battleStatus.FIGHT;
        }
    }
    return actions;
}

/* army type collection */
var ArmyTypes = {
    'NAIVE_SOLDIER': {
        soldier: {
            attack: 20,
            defense: 20,
            health: 300,
            arm: 20,
            action: naiveSoldierAct,
            onAttack: naiveSoldierOnAttack
        },
        legion: {
            action: legionAction
        }
    },
};

/* legion playground
   calculate all the harm amon soldiers
*/
function legionFight() {
    var deadCnt = 0;
    while (deadCnt < this.context.length) {
        var actions = [];
        for (var i = 0; i < this.context.length; i++) {
            var legion = this.context[i];
            actions = actions.concat(legion.action(this.context));
        }
        for (var i = 0; i < actions.length; i++) {
            var action = actions[i];
            if (action.type == 'ATTACK') {
                action.to.health -= action.from.attack;
                action.to.onAttack(action.from);
            }
        }
        for (var i = 0; i < this.context.length; i++) {
            var legion = this.context[i];
            for (var j = 0; j < legion.soldiers.length; j++) {
                var soldier = legion.soldiers[j];
                if (soldier && soldier.health <= 0) {
                    legion.deadCnt++;
                    if (legion.deadCnt == legion.soldiers.length) {
                        deadCnt++;
                    }
                    delete soldier;
                }
            }
        }
    }
}

function LegionBattleField() {
    var s1 = SoldierBuilder()
                .withName('Tommy')
                .withLoc(Point(0, 10))
                .withType(ArmyTypes.NAIVE_SOLDIER)
                .build(),
        s2 = SoldierBuilder()
                .withName('John')
                .withLoc(Point(0, -10))
                .withType(ArmyTypes.NAIVE_SOLDIER)
                .build(),
        s3 = SoldierBuilder()
                .withName('Mike')
                .withLoc(Point(0, 10))
                .withType(ArmyTypes.NAIVE_SOLDIER)
                .build(),
        s4 = SoldierBuilder()
                .withName('Jack')
                .withLoc(Point(0, -10))
                .withType(ArmyTypes.NAIVE_SOLDIER)
                .build();
    var l1 = LegionBuilder()
                    .withStand('red')
                    .withLoc(Point(-100, 0))
                    .withType(ArmyTypes.NAIVE_SOLDIER)
                    .withSoldiers([s1, s2])
                    .build(),
        l2 = LegionBuilder()
                    .withStand('blue')
                    .withLoc(Point(100, 0))
                    .withType(ArmyTypes.NAIVE_SOLDIER)
                    .withSoldiers([s3, s4])
                    .build();
    return {
        'context': [l1, l2],
        'fight': legionFight
    }
}

var lbf = LegionBattleField();
lbf.fight();