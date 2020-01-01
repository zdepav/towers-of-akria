var TurretElement;
(function (TurretElement) {
    TurretElement[TurretElement["Air"] = 0] = "Air";
    TurretElement[TurretElement["Earth"] = 1] = "Earth";
    TurretElement[TurretElement["Fire"] = 2] = "Fire";
    TurretElement[TurretElement["Water"] = 3] = "Water";
})(TurretElement || (TurretElement = {}));
var TurretType = (function () {
    function TurretType(type) {
        this.type = type === undefined ? [0, 0, 0, 0] : type;
    }
    TurretType.prototype.copy = function () { return new TurretType(this.type.slice()); };
    TurretType.prototype.add = function (elem) {
        ++this.type[elem];
        return this;
    };
    TurretType.prototype.air = function () { return this.type[TurretElement.Air]; };
    TurretType.prototype.earth = function () { return this.type[TurretElement.Earth]; };
    TurretType.prototype.fire = function () { return this.type[TurretElement.Fire]; };
    TurretType.prototype.water = function () { return this.type[TurretElement.Water]; };
    TurretType.prototype.count = function () {
        var c = 0;
        for (var i = 0; i < 4; ++i) {
            c += this.type[i];
        }
        return c;
    };
    TurretType.prototype.contains = function (type) { return this.type[type] > 0; };
    TurretType.prototype.toArray = function () {
        var arr = [];
        for (var i = 0; i < this.type[TurretElement.Air]; ++i) {
            arr.push(TurretElement.Air);
        }
        for (var i = 0; i < this.type[TurretElement.Earth]; ++i) {
            arr.push(TurretElement.Earth);
        }
        for (var i = 0; i < this.type[TurretElement.Fire]; ++i) {
            arr.push(TurretElement.Fire);
        }
        for (var i = 0; i < this.type[TurretElement.Water]; ++i) {
            arr.push(TurretElement.Water);
        }
        return arr;
    };
    TurretType.prototype.toColorArray = function () {
        var arr = [];
        for (var i = 0; i < this.type[TurretElement.Air]; ++i) {
            arr.push("#d8d1ff");
        }
        for (var i = 0; i < this.type[TurretElement.Earth]; ++i) {
            arr.push("#6dd13e");
        }
        for (var i = 0; i < this.type[TurretElement.Fire]; ++i) {
            arr.push("#f7854c");
        }
        for (var i = 0; i < this.type[TurretElement.Water]; ++i) {
            arr.push("#79b4f2");
        }
        return arr;
    };
    return TurretType;
}());
//# sourceMappingURL=TurretType.js.map