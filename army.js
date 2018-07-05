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
        type: undefined,
        focus: undefined,
        action: function(context) { return this.type.action(this, context)},
        onAttack: function(enemy) { return this.type.onAttack(this, enemy)},
        // instant instruction in battle
        direct: function(instruction) {}
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
// TODO(yuzheshen): rewrite set type to move each field into soldier
        withType: function(type) {
            this.solider.type = type;
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

function footSoldierAct(me, context) {
    if (me.focus != undefined &&
        distance(me.focus.loc, me.loc) < me.arm) {
        return ATTACK(me.focus);
    }
    var shortest = Number.MAX_SAFE_INTEGER;
    for(var i = 0; i < context.length; i++) {
        var enemy = context[i];
        if (enemy == undefined ||
            enemy.id == me.id ||
            enemy.status == battleStatus.FIGHT) {
            continue;
        }

        var dist = distance(me.loc, enemy.loc);
        if (dist < shortest) {
            shortest = dist;
            me.focus = enemy;
        }
    }
    if (me.focus != undefined &&
        shortest <= this.arm) {
        return ACTS.ATTACK(me.focus);
    } else if (me.focus != undefined) {
        return ACTS.MOVE_TO(me.focus.loc);
    }
    return ACTS.WAIT();
}

function footSoldierOnAttack(me, enemy) {
    console.log(me.name + ' got attacked by ' + enemy.name);
    var dist = distance(me.loc, enemy.loc);
    if (me.focus == undefined) {
        me.focus = enemy;
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
                action.enemy.type.health -= soldier.type.attack;
                action.enemy.onAttack(soldier);
            }
        }
        for (var i = 0; i < this.context.length; i++) {
            if (this.context[i].type.health <= 0) {
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
