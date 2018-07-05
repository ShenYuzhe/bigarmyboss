var math_utils = require('./math_utils');
var distance = math_utils.distance;
var Point = math_utils.Point;
var randomInt = math_utils.randomInt;

var battleStatus = {
    'NORMAL': 'NORMAL',
    'FIGHT': 'FIGHT'
};

function Soldier() {
    return {
        id: randomInt(0, 10000),
        name: '',
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
        withLoc: function(loc) {
            this.solider.loc = loc;
            return this;
        },
        withType: function(type) {
            for (k in type) {
                this.solider[k] = type[k];
            }
            return this;
        },
        build: function() {
            return this.solider;
        }
    };
}

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
    MOVE_TO: function(target) {
        return {
            'type': 'MOVE_TO',
            'target': target
        }
    },
    ATTACK: function(enemy) {
        return {
            'type': 'ATTACK',
            'enemy': enemy,
        }
    }
}

function footSoldierAct(context) {
    if (this.focus != undefined &&
        distance(this.focus.loc, this.loc) < this.arm) {
        return ACTS.ATTACK(this.focus);
    }
    var shortest = Number.MAX_SAFE_INTEGER;
    for(var i = 0; i < context.length; i++) {
        var enemy = context[i];
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
        return ACTS.ATTACK(this.focus);
    } else if (this.focus != undefined) {
        return ACTS.MOVE_TO(this.focus.loc);
    }
    return ACTS.WAIT();
}

function footSoldierOnAttack(enemy) {
    console.log(this.name + ' got attacked by ' + enemy.name);
    var dist = distance(this.loc, enemy.loc);
    if (this.focus == undefined) {
        this.focus = enemy;
    }
}

var ArmyTypes = {
    'FOOT_SOLDIER': {
        attack: 20,
        defense: 20,
        health: 300,
        arm: 20,
        action: footSoldierAct,
        onAttack: footSoldierOnAttack
    }
};

function fight() {
    var deadCnt = 0;
    while (deadCnt != this.context.length) {
        for (var i = 0; i < this.context.length; i++) {
            var soldier = this.context[i];
            if (soldier == undefined) {
                continue;
            }
            var action = soldier.action(this.context);
            if (action.type == 'ATTACK') {
                action.enemy.health -= soldier.attack;
                action.enemy.onAttack(soldier);
            }
        }
        for (var i = 0; i < this.context.length; i++) {
            if (this.context[i].health <= 0) {
                console.log(soldier.name + " : is dead!");
                delete this.context[i];
                deadCnt++;
            }
        }
    }
}

function NaiveBattleField() {
    var s1 = SoldierBuilder()
                        .withName('Tommy')
                        .withLoc(Point(-100, 0))
                        .withType(ArmyTypes.FOOT_SOLDIER)
                        .build(),
        s2 = SoldierBuilder()
                        .withName('SixGodShampoo')
                        .withLoc(Point(-90, 0))
                        .withType(ArmyTypes.FOOT_SOLDIER)
                        .build();
    return {
        'context': [s1, s2],
        'fight': fight
    };
    
}

var nbf = NaiveBattleField();
nbf.fight();