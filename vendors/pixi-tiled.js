"use strict";
var TiledOG;
(function (TiledOG) {
    var ContainerBuilder;
    (function (ContainerBuilder) {
        function ApplyMeta(meta, target) {
            target.name = meta.name;
            target.tiledId = meta.id;
            target.width = meta.width || target.width;
            target.height = meta.height || target.height;
            target.rotation = ((meta.rotation || 0) * Math.PI) / 180.0;
            if (meta.x)
                target.x = meta.x;
            if (meta.y)
                target.y = meta.y;
            target.visible = meta.visible == undefined ? true : meta.visible;
            target.types = meta.type ? meta.type.split(":") : [];
            var type = TiledOG.Utils.Objectype(meta);
            target.primitive = TiledOG.Primitives.BuildPrimitive(meta);
            if (meta.properties) {
                target.alpha = meta.properties.opacity || 1;
                Object.assign(target, meta.properties);
            }
            if (TiledOG.Config.debugContainers) {
                setTimeout(function () {
                    var rect = new PIXI.Graphics();
                    rect.lineStyle(2, 0xff0000, 0.7)
                        .drawRect(target.x, target.y, meta.width, meta.height)
                        .endFill();
                    if (target instanceof PIXI.Sprite) {
                        rect.y -= target.height;
                    }
                    target.parent.addChild(rect);
                }, 30);
            }
        }
        ContainerBuilder.ApplyMeta = ApplyMeta;
        function Build(meta) {
            var types = meta.type ? meta.type.split(":") : [];
            var container = undefined;
            if (types.indexOf("mask") > -1) {
                container = new PIXI.Sprite(PIXI.Texture.WHITE);
            }
            else {
                container = new TiledOG.TiledContainer();
            }
            if (meta.gid) {
                if (container instanceof PIXI.Sprite) {
                    container.anchor = TiledOG.Config.defSpriteAnchor;
                }
                else {
                    container.pivot = TiledOG.Config.defSpriteAnchor;
                    container.hitArea = new PIXI.Rectangle(0, 0, meta.width, meta.height);
                }
            }
            ApplyMeta(meta, container);
            return container;
        }
        ContainerBuilder.Build = Build;
    })(ContainerBuilder = TiledOG.ContainerBuilder || (TiledOG.ContainerBuilder = {}));
})(TiledOG || (TiledOG = {}));
var TiledOG;
(function (TiledOG) {
    PIXI.tiled = TiledOG;
})(TiledOG || (TiledOG = {}));
var TiledOG;
(function (TiledOG) {
    var SpriteBuilder;
    (function (SpriteBuilder) {
        function сreateSprite(meta) {
            var sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
            if (!meta.fromImageLayer) {
                sprite.anchor = TiledOG.Config.defSpriteAnchor;
            }
            TiledOG.ContainerBuilder.ApplyMeta(meta, sprite);
            var obj = meta.img.objectgroup;
            if (obj) {
                sprite.primitive = TiledOG.Primitives.BuildPrimitive(obj.objects[0]);
            }
            var hFlip = meta.properties.hFlip;
            var vFlip = meta.properties.vFlip;
            if (hFlip) {
                sprite.scale.x *= -1;
                sprite.anchor.x = 1;
            }
            if (vFlip) {
                sprite.scale.y *= -1;
                sprite.anchor.y = 0;
            }
            return sprite;
        }
        function Build(meta) {
            var sprite = сreateSprite(meta);
            return sprite;
        }
        SpriteBuilder.Build = Build;
    })(SpriteBuilder = TiledOG.SpriteBuilder || (TiledOG.SpriteBuilder = {}));
})(TiledOG || (TiledOG = {}));
var TiledOG;
(function (TiledOG) {
    var TextBuilder;
    (function (TextBuilder) {
        function roundAlpha(canvas) {
            var ctx = canvas.getContext("2d");
            var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (var i = 3; i < data.data.length; i += 4) {
                data.data[i] = data.data[i] > 200 ? 255 : 0;
            }
            ctx.putImageData(data, 0, 0);
        }
        function createText(meta) {
            var container = new TiledOG.TiledContainer();
            var pixiText = new PIXI.Text(meta.text.text, {
                wordWrap: meta.text.wrap,
                wordWrapWidth: meta.width,
                fill: TiledOG.Utils.HexStringToHexInt(meta.text.color) || 0x000000,
                align: meta.text.valign || "center",
                fontFamily: meta.text.fontfamily || "Arial",
                fontWeight: meta.text.bold ? "bold" : "normal",
                fontStyle: meta.text.italic ? "italic" : "normal",
                fontSize: meta.text.pixelsize || "16px"
            });
            pixiText.name = meta.name + "_Text";
            if (TiledOG.Config.roundFontAlpha) {
                pixiText.texture.once("update", function () {
                    roundAlpha(pixiText.canvas);
                    pixiText.texture.baseTexture.update();
                    console.log("update");
                });
            }
            var props = meta.properties;
            meta.properties = {};
            TiledOG.ContainerBuilder.ApplyMeta(meta, container);
            container.pivot.set(0, 0);
            switch (meta.text.halign) {
                case "right":
                    {
                        pixiText.anchor.x = 1;
                        pixiText.position.x = meta.width;
                    }
                    break;
                case "center":
                    {
                        pixiText.anchor.x = 0.5;
                        pixiText.position.x = meta.width * 0.5;
                    }
                    break;
                default:
                    {
                        pixiText.anchor.x = 0;
                        pixiText.position.x = 0;
                    }
                    break;
            }
            switch (meta.text.valign) {
                case "bottom":
                    {
                        pixiText.anchor.y = 1;
                        pixiText.position.y = meta.height;
                    }
                    break;
                case "center":
                    {
                        pixiText.anchor.y = 0.5;
                        pixiText.position.y = meta.height * 0.5;
                    }
                    break;
                default:
                    {
                        pixiText.anchor.y = 0;
                        pixiText.position.y = 0;
                    }
                    break;
            }
            if (props) {
                pixiText.style.stroke = TiledOG.Utils.HexStringToHexInt(meta.properties.strokeColor) || 0;
                pixiText.style.strokeThickness = meta.properties.strokeThickness || 0;
                pixiText.style.padding = meta.properties.fontPadding || 0;
                Object.assign(pixiText, props);
            }
            container.addChild(pixiText);
            container.text = pixiText;
            return container;
        }
        function Build(meta) {
            return createText(meta);
        }
        TextBuilder.Build = Build;
    })(TextBuilder = TiledOG.TextBuilder || (TiledOG.TextBuilder = {}));
})(TiledOG || (TiledOG = {}));
var Tiled;
(function (Tiled) {
    var MultiSpritesheet = (function () {
        function MultiSpritesheet(sheets) {
            var _this = this;
            this.sheets = [];
            this.images = {};
            if (sheets) {
                sheets.forEach(function (element) {
                    _this.add(element);
                });
            }
        }
        MultiSpritesheet.prototype.add = function (sheet) {
            if (!sheet)
                throw "Sheet can't be undefined";
            this.sheets.push(sheet);
        };
        MultiSpritesheet.prototype.addTexture = function (tex, id) {
            this.images[id] = tex;
        };
        Object.defineProperty(MultiSpritesheet.prototype, "textures", {
            get: function () {
                var map = {};
                for (var _i = 0, _a = this.sheets; _i < _a.length; _i++) {
                    var spr = _a[_i];
                    Object.assign(map, spr.textures);
                }
                Object.assign(map, this.images);
                return map;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MultiSpritesheet.prototype, "animations", {
            get: function () {
                var map = {};
                for (var _i = 0, _a = this.sheets; _i < _a.length; _i++) {
                    var spr = _a[_i];
                    Object.assign(map, spr.animations);
                }
                return map;
            },
            enumerable: true,
            configurable: true
        });
        return MultiSpritesheet;
    }());
    Tiled.MultiSpritesheet = MultiSpritesheet;
})(Tiled || (Tiled = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TiledOG;
(function (TiledOG) {
    var TiledContainer = (function (_super) {
        __extends(TiledContainer, _super);
        function TiledContainer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.layerHeight = 0;
            _this.layerWidth = 0;
            return _this;
        }
        return TiledContainer;
    }(PIXI.Container));
    TiledOG.TiledContainer = TiledContainer;
})(TiledOG || (TiledOG = {}));
var TiledOG;
(function (TiledOG) {
    var showHello = true;
    function PrepareOject(layer) {
        var props = {};
        if (layer.properties) {
            if (layer.properties instanceof Array) {
                for (var _i = 0, _a = layer.properties; _i < _a.length; _i++) {
                    var p = _a[_i];
                    var val = p.value;
                    if (p.type == "color")
                        val = TiledOG.Utils.HexStringToHexInt(val);
                    props[p.name] = val;
                }
            }
            else {
                props = layer.properties;
            }
        }
        if (layer.gid) {
            var gid = layer.gid;
            var vFlip = gid & 0x40000000;
            var hFlip = gid & 0x80000000;
            var dFlip = gid & 0x20000000;
            props["vFlip"] = vFlip;
            props["hFlip"] = hFlip;
            props["dFlip"] = dFlip;
            var realGid = gid & (~(0x40000000 | 0x80000000 | 0x20000000));
            layer.gid = realGid;
        }
        layer.properties = props;
    }
    function ImageFromTileset(tilesets, baseUrl, gid) {
        var tileSet = undefined;
        for (var i = 0; i < tilesets.length; i++) {
            if (tilesets[i].firstgid <= gid) {
                tileSet = tilesets[i];
            }
        }
        if (!tileSet) {
            console.log("Image with gid:" + gid + " not found!");
            return null;
        }
        var realGid = gid - tileSet.firstgid;
        var find = tileSet.tiles.filter(function (obj) { return obj.id == realGid; })[0];
        var img = Object.assign({}, find);
        if (!img) {
            console.log("Load res MISSED gid:" + realGid);
            return null;
        }
        img.image = baseUrl + img.image;
        return img;
    }
    function CreateStage(res, loader) {
        var _data = {};
        if (res instanceof PIXI.LoaderResource) {
            _data = res.data;
        }
        else {
            _data = loader;
        }
        if (!_data || _data.type != "map") {
            return undefined;
        }
        if (showHello) {
            console.log("Tiled OG importer!\n eXponenta {rondo.devil[a]gmail.com}");
            showHello = false;
        }
        var useDisplay = TiledOG.Config.usePixiDisplay != undefined && TiledOG.Config.usePixiDisplay && PIXI.display != undefined;
        var Layer = useDisplay ? PIXI.display.Layer : {};
        var Group = useDisplay ? PIXI.display.Group : {};
        var Stage = useDisplay ? PIXI.display.Stage : {};
        var _stage = new TiledOG.TiledContainer();
        var cropName = new RegExp(/^.*[\\\/]/);
        _stage.layerHeight = _data.height;
        _stage.layerWidth = _data.width;
        var baseUrl = "";
        if (res instanceof PIXI.LoaderResource) {
            _stage.name = res.url.replace(cropName, "").split(".")[0];
            baseUrl = res.url.replace(loader.baseUrl, "");
            baseUrl = baseUrl.match(cropName)[0];
        }
        if (_data.layers) {
            var zOrder = 0;
            if (useDisplay)
                _data.layers = _data.layers.reverse();
            for (var _i = 0, _a = _data.layers; _i < _a.length; _i++) {
                var layer = _a[_i];
                if (layer.type !== "objectgroup" && layer.type !== "imagelayer") {
                    console.warn("OGParser support only OBJECT or IMAGE layes!!");
                    continue;
                }
                PrepareOject(layer);
                var props = layer.properties;
                if (props.ignore || props.ignoreLoad) {
                    console.log("OGParser: ignore loading layer:" + layer.name);
                    continue;
                }
                var pixiLayer = useDisplay
                    ? new Layer(new Group(props.zOrder !== undefined ? props.zOrder : zOrder, true))
                    : new TiledOG.TiledContainer();
                zOrder++;
                pixiLayer.tiledId = layer.id;
                pixiLayer.name = layer.name;
                _stage.layers = {};
                _stage.layers[layer.name] = pixiLayer;
                pixiLayer.visible = layer.visible;
                pixiLayer.position.set(layer.x, layer.y);
                pixiLayer.alpha = layer.opacity || 1;
                TiledOG.ContainerBuilder.ApplyMeta(layer, pixiLayer);
                _stage.addChild(pixiLayer);
                if (layer.type == "imagelayer") {
                    layer.objects = [
                        {
                            img: {
                                image: baseUrl + layer.image
                            },
                            gid: 123456789,
                            name: layer.name,
                            x: layer.x + layer.offsetx,
                            y: layer.y + layer.offsety,
                            fromImageLayer: true,
                            properties: layer.properties
                        }
                    ];
                }
                if (!layer.objects)
                    return undefined;
                var localZIndex = 0;
                var _loop_1 = function (layerObj) {
                    PrepareOject(layerObj);
                    if (layerObj.properties.ignore)
                        return "continue";
                    var type = TiledOG.Utils.Objectype(layerObj);
                    var pixiObject = null;
                    switch (type) {
                        case TiledOG.Utils.TiledObjectType.IMAGE: {
                            if (!layerObj.fromImageLayer) {
                                var img = ImageFromTileset(_data.tilesets, baseUrl, layerObj.gid);
                                if (!img) {
                                    return "continue";
                                }
                                layerObj.img = img;
                            }
                            pixiObject = TiledOG.SpriteBuilder.Build(layerObj);
                            var sprite_1 = pixiObject;
                            var cached_1 = undefined;
                            if (loader instanceof PIXI.Loader) {
                                cached_1 = loader.resources[layerObj.img.image];
                            }
                            else if (res instanceof PIXI.Spritesheet) {
                                cached_1 = res.textures[layerObj.img.image];
                            }
                            if (!cached_1) {
                                if (loader instanceof PIXI.Loader) {
                                    loader.add(layerObj.img.image, {
                                        parentResource: res
                                    }, function () {
                                        var tex = loader.resources[layerObj.img.image].texture;
                                        sprite_1.texture = tex;
                                        if (layerObj.fromImageLayer) {
                                            sprite_1.scale.set(1);
                                        }
                                    });
                                }
                                else {
                                    return "continue";
                                }
                            }
                            else {
                                if (cached_1 instanceof PIXI.LoaderResource) {
                                    if (!cached_1.isComplete) {
                                        cached_1.onAfterMiddleware.once(function (e) {
                                            sprite_1.texture = cached_1.texture;
                                            if (layerObj.fromImageLayer) {
                                                sprite_1.scale.set(1);
                                            }
                                        });
                                    }
                                    else {
                                        sprite_1.texture = cached_1.texture;
                                        if (layerObj.fromImageLayer) {
                                            sprite_1.scale.set(1);
                                        }
                                    }
                                }
                                else if (cached_1) {
                                    sprite_1.texture = cached_1;
                                    if (layerObj.fromImageLayer) {
                                        sprite_1.scale.set(1);
                                    }
                                }
                            }
                            break;
                        }
                        case TiledOG.Utils.TiledObjectType.TEXT: {
                            pixiObject = TiledOG.TextBuilder.Build(layerObj);
                            break;
                        }
                        default: {
                            pixiObject = TiledOG.ContainerBuilder.Build(layerObj);
                        }
                    }
                    if (TiledOG.Config.usePixiDisplay) {
                        pixiObject.parentGroup = pixiLayer.group;
                        _stage.addChildAt(pixiObject, localZIndex);
                    }
                    else {
                        pixiLayer.addChildAt(pixiObject, localZIndex);
                    }
                    localZIndex++;
                };
                for (var _b = 0, _c = layer.objects; _b < _c.length; _b++) {
                    var layerObj = _c[_b];
                    _loop_1(layerObj);
                }
            }
        }
        return _stage;
    }
    TiledOG.CreateStage = CreateStage;
    TiledOG.Parser = {
        Parse: function (res, next) {
            var stage = CreateStage(res, this);
            res.stage = stage;
            next();
        },
        use: function (res, next) {
            TiledOG.Parser.Parse.call(this, res, next);
        },
        add: function () {
            console.log("Now you use Tiled!");
        }
    };
})(TiledOG || (TiledOG = {}));
var TiledOG;
(function (TiledOG) {
    var Primitives;
    (function (Primitives) {
        var TiledRect = (function (_super) {
            __extends(TiledRect, _super);
            function TiledRect() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.name = "";
                _this.types = [];
                _this.visible = true;
                return _this;
            }
            return TiledRect;
        }(PIXI.Rectangle));
        Primitives.TiledRect = TiledRect;
        var TiledPoint = (function (_super) {
            __extends(TiledPoint, _super);
            function TiledPoint(x, y) {
                var _this = _super.call(this, x, y) || this;
                _this.name = "";
                _this.types = [];
                _this.visible = true;
                return _this;
            }
            return TiledPoint;
        }(PIXI.Point));
        Primitives.TiledPoint = TiledPoint;
        var TiledPolygon = (function (_super) {
            __extends(TiledPolygon, _super);
            function TiledPolygon(points) {
                var _this = _super.call(this, points) || this;
                _this.name = "";
                _this.types = [];
                _this.visible = true;
                _this._x = 0;
                _this._y = 0;
                return _this;
            }
            Object.defineProperty(TiledPolygon.prototype, "x", {
                get: function () {
                    return this._x;
                },
                set: function (sX) {
                    var delta = sX - this._x;
                    this._x = sX;
                    for (var xIndex = 0; xIndex < this.points.length; xIndex += 2) {
                        this.points[xIndex] += delta;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TiledPolygon.prototype, "y", {
                get: function () {
                    return this._y;
                },
                set: function (sY) {
                    var delta = sY - this._y;
                    this._y = sY;
                    for (var yIndex = 1; yIndex < this.points.length; yIndex += 2) {
                        this.points[yIndex] += delta;
                    }
                },
                enumerable: true,
                configurable: true
            });
            TiledPolygon.prototype.getBounds = function () {
                var rect = new PIXI.Rectangle();
                var maxX = this._x;
                var maxY = this._y;
                for (var index = 0; index < this.points.length; index += 2) {
                    var px = this.points[index];
                    var py = this.points[index + 1];
                    rect.x = px < rect.x ? px : rect.x;
                    rect.y = py < rect.y ? py : rect.y;
                    maxX = px > maxX ? px : maxX;
                    maxY = py > maxY ? py : maxY;
                }
                rect.width = maxX - rect.x;
                rect.height = maxY - rect.y;
                return rect;
            };
            Object.defineProperty(TiledPolygon.prototype, "width", {
                get: function () {
                    return this.getBounds().width;
                },
                set: function (w) {
                    var factor = w / this.width;
                    for (var xIndex = 0; xIndex < this.points.length; xIndex += 2) {
                        var delta = (this.points[xIndex] - this._x) * factor;
                        this.points[xIndex] = this._x + delta;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TiledPolygon.prototype, "height", {
                get: function () {
                    return this.getBounds().height;
                },
                set: function (h) {
                    var factor = h / this.height;
                    for (var yIndex = 1; yIndex < this.points.length; yIndex += 2) {
                        var delta = (this.points[yIndex] - this._y) * factor;
                        this.points[yIndex] = this._y + delta;
                        ;
                    }
                },
                enumerable: true,
                configurable: true
            });
            return TiledPolygon;
        }(PIXI.Polygon));
        Primitives.TiledPolygon = TiledPolygon;
        var TiledPolypine = (function () {
            function TiledPolypine(points) {
                this.name = "";
                this.types = [];
                this.visible = true;
                this.points = [];
                this.points = points.slice();
            }
            return TiledPolypine;
        }());
        Primitives.TiledPolypine = TiledPolypine;
        var TiledEllipse = (function (_super) {
            __extends(TiledEllipse, _super);
            function TiledEllipse(x, y, hw, hh) {
                var _this = _super.call(this, x, y, hw, hh) || this;
                _this.name = "";
                _this.types = [];
                _this.visible = true;
                return _this;
            }
            return TiledEllipse;
        }(PIXI.Ellipse));
        Primitives.TiledEllipse = TiledEllipse;
        function BuildPrimitive(meta) {
            if (!meta)
                return;
            var prim = undefined;
            var type = TiledOG.Utils.Objectype(meta);
            meta.x = meta.x || 0;
            meta.y = meta.y || 0;
            switch (type) {
                case TiledOG.Utils.TiledObjectType.ELLIPSE: {
                    prim = new TiledEllipse(meta.x + 0.5 * meta.width, meta.y + 0.5 * meta.height, meta.width * 0.5, meta.height * 0.5);
                    break;
                }
                case TiledOG.Utils.TiledObjectType.POLYGON: {
                    var points = meta.polygon;
                    var poses = points.map(function (p) {
                        return new PIXI.Point(p.x + meta.x, p.y + meta.y);
                    });
                    prim = new TiledPolygon(poses);
                    break;
                }
                case TiledOG.Utils.TiledObjectType.POLYLINE: {
                    var points = meta.polygon;
                    var poses = points.map(function (p) {
                        return new PIXI.Point(p.x + meta.x, p.y + meta.y);
                    });
                    prim = new TiledPolypine(poses);
                    break;
                }
                default:
                    prim = new TiledRect(meta.x, meta.y, meta.width, meta.height);
            }
            prim.types = meta.type ? meta.type.split(":") : [];
            prim.visible = meta.visible;
            prim.name = meta.name;
            return prim;
        }
        Primitives.BuildPrimitive = BuildPrimitive;
    })(Primitives = TiledOG.Primitives || (TiledOG.Primitives = {}));
})(TiledOG || (TiledOG = {}));
var TiledOG;
(function (TiledOG) {
    var Utils;
    (function (Utils) {
        function HexStringToHexInt(value) {
            if (!value)
                return 0;
            if (typeof value == "number")
                return value;
            value = value.length > 7 ? value.substr(3, 6) : value.substr(1, 6);
            try {
                return parseInt(value, 16);
            }
            catch (e) {
                console.warn("Color parse error:", e.message);
                return 0;
            }
        }
        Utils.HexStringToHexInt = HexStringToHexInt;
        function HexStringToAlpha(value) {
            if (!value)
                return 1;
            if (typeof value == "number")
                return value;
            if (value.length <= 7)
                return 1;
            try {
                return parseInt(value.substr(1, 2), 16) / 255.0;
            }
            catch (e) {
                console.warn("Alpha parse error:", e.message);
                return 1;
            }
        }
        Utils.HexStringToAlpha = HexStringToAlpha;
        var TiledObjectType;
        (function (TiledObjectType) {
            TiledObjectType[TiledObjectType["DEFAULT"] = 0] = "DEFAULT";
            TiledObjectType[TiledObjectType["POINT"] = 1] = "POINT";
            TiledObjectType[TiledObjectType["POLYGON"] = 2] = "POLYGON";
            TiledObjectType[TiledObjectType["POLYLINE"] = 3] = "POLYLINE";
            TiledObjectType[TiledObjectType["ELLIPSE"] = 4] = "ELLIPSE";
            TiledObjectType[TiledObjectType["TEXT"] = 5] = "TEXT";
            TiledObjectType[TiledObjectType["IMAGE"] = 6] = "IMAGE";
        })(TiledObjectType = Utils.TiledObjectType || (Utils.TiledObjectType = {}));
        function Objectype(meta) {
            if (meta.properties && meta.properties.container)
                return TiledObjectType.DEFAULT;
            if (meta.gid || meta.image)
                return TiledObjectType.IMAGE;
            if (meta.text != undefined)
                return TiledObjectType.TEXT;
            if (meta.point)
                return TiledObjectType.POINT;
            if (meta.polygon)
                return TiledObjectType.POLYGON;
            if (meta.polyline)
                return TiledObjectType.POLYLINE;
            if (meta.ellipse)
                return TiledObjectType.ELLIPSE;
            return TiledObjectType.DEFAULT;
        }
        Utils.Objectype = Objectype;
    })(Utils = TiledOG.Utils || (TiledOG.Utils = {}));
})(TiledOG || (TiledOG = {}));
var TiledOG;
(function (TiledOG) {
    TiledOG.Config = {
        defSpriteAnchor: new PIXI.Point(0, 1),
        debugContainers: false,
        usePixiDisplay: false,
        roundFontAlpha: false
    };
    TiledOG.Builders = [
        TiledOG.ContainerBuilder.Build,
        TiledOG.SpriteBuilder.Build,
        TiledOG.TextBuilder.Build
    ];
    function InjectToPixi(props) {
        if (props === void 0) { props = undefined; }
        if (props) {
            TiledOG.Config.defSpriteAnchor = props.defSpriteAnchor || TiledOG.Config.defSpriteAnchor;
            TiledOG.Config.debugContainers = props.debugContainers != undefined
                ? props.debugContainers
                : TiledOG.Config.debugContainers;
            TiledOG.Config.usePixiDisplay = props.usePixiDisplay != undefined
                ? props.usePixiDisplay
                : TiledOG.Config.usePixiDisplay;
            TiledOG.Config.roundFontAlpha = props.roundFontAlpha != undefined
                ? props.roundFontAlpha
                : TiledOG.Config.roundFontAlpha;
        }
        PIXI.Loader.registerPlugin(TiledOG.Parser);
    }
    TiledOG.InjectToPixi = InjectToPixi;
})(TiledOG || (TiledOG = {}));
//# sourceMappingURL=pixi-tiled.js.map