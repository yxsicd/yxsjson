(function yxsjson() {
    var app = {};
    app.constant = function (key, value) {
        if (value) {
            app.obj ? 0 : app.obj = {};
            app.obj[key] = value;
        } else {
            return app.obj[key];
        }
    }

    var arrayOptionsEnum = {
        singleSchema: "singleSchema",
        arraySchema: "schemaArray",
        emptySchema: "emptySchema",
        anyOf: "anyOf",
        oneOf: "oneOf",
        allOf: "allOf"
    }
    app.constant("Version", .1), app.constant("ArrayOptions", arrayOptionsEnum), app.constant("Specification", "http://json-schema.org/draft-04/schema#");
    var angular = {};
    angular.fromJson = function fromJson(json) {
        return _.isString(json)
            ? JSON.parse(json)
            : json;
    }

    function toJsonReplacer(key, value) {
        var val = value;

        if (typeof key === 'string' && key.charAt(0) === '$') {
            val = undefined;
        }
        return val;
    }

    angular.toJson = function (obj, pretty) {
        if (typeof obj === 'undefined') return undefined;
        return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
    }

    _.isDefined = function isDefined(value) {
        return typeof value !== 'undefined';
    }

    var default_options = {
        url: "",
        json: {"string": "string", "number": 123, "object": {"name": "defaultname"}},
        arrayOptions: arrayOptionsEnum.arraySchema,
        includeDefaults: !1,
        includeEnums: !1,
        forceRequired: !0,
        absoluteIds: !0,
        numericVerbose: !1,
        stringsVerbose: !1,
        objectsVerbose: !1,
        arraysVerbose: !1,
        metadataKeywords: !1,
        additionalItems: !0,
        additionalProperties: !0
    }, user_defined_options = _.cloneDeep(default_options);
    app.constant("user_defined_options", user_defined_options),
        app.constant("default_options", default_options);

    function Schemaservice(a, b, c, d, e) {
        b = new Schemafactory();
        c = app.constant("ArrayOptions");
        d = app.constant("Specification");
        e = new Utility();
        var user_defined_options = app.constant("user_defined_options");
        var f = this;
        this.json = {};
        this.intermediateResult = null,
            this.editableSchema = {},
            this.schema = {},
            this.JSON2Schema = function () {
                this.jsonString2EditableSchema(),
                    this.editableSchema2FinalSchema()
            },
            this.isValidJSON = function (a) {
                try {
                    angular.fromJson(a)
                } catch (b) {
                    return !1
                }
                return !0
            },
            this.jsonString2EditableSchema = function () {

                f.json = angular.fromJson(user_defined_options.json);
                f.intermediateResult = f.schema4Object(void 0, f.json);
                f.editableSchema = f.constructSchema(f.intermediateResult);

            },
            this.editableSchema2FinalSchema = function () {
                f.schema = _.cloneDeep(f.editableSchema);
                this.clean(f.schema);
            },
            this.clean = function (a) {
                var b = a.__key__;
                for (var c in a)if ("object" == typeof a[c] && null !== a[c]) {
                    if (a[c].__removed__) {
                        delete a[c];
                        continue
                    }
                    this.clean(a[c])
                } else {
                    switch (String(c)) {
                        case"__required__":
                            var d = a[c], e = f.getSchema(a.__parent__);
                            if (e)if (d) {
                                e.required || (e.required = []);
                                var g = e.required.indexOf(b);
                                0 > g && e.required.push(b)
                            } else if (e.required) {
                                var g = e.required.indexOf(b);
                                g > -1 && (console.log(b), e.required.splice(g, 1), console.log(e.required))
                            }
                            break;
                        case"__parent__":
                        case"__removed__":
                            break;
                        case"maxItems":
                        case"minItems":
                            break;
                        case"uniqueItems":
                            var h = Boolean(a[c]);
                            a[c] = h, user_defined_options.arraysVerbose || h || delete a[c];
                            break;
                        case"additionalItems":
                            var h = Boolean(a[c]);
                            a[c] = h, user_defined_options.arraysVerbose || h && delete a[c];
                            break;
                        case"minimum":
                        case"maximum":
                        case"multipleOf":
                            var h = parseInt(a[c]);
                            a[c] = h, user_defined_options.numericVerbose || h || 0 == h || delete a[c];
                            break;
                        case"exclusiveMinimum":
                        case"exclusiveMaximum":
                            var h = Boolean(a[c]);
                            a[c] = h, user_defined_options.numericVerbose || h || delete a[c];
                            break;
                        case"name":
                        case"title":
                        case"description":
                            var h = String(a[c]).trim();
                            a[c] = h, user_defined_options.metadataKeywords || h || delete a[c];
                            break;
                        case"additionalProperties":
                            var h = Boolean(a[c]);
                            a[c] = h, user_defined_options.objectsVerbose || h && delete a[c]
                    }
                    var i = c.match(/^__.*__$/g);
                    i && delete a[c]
                }
            },
            this.schema4Object = function (a, c) {
                var d = b.getInstance(a, c);
                return _.forEach(c, function (a, c) {
                    var e = null;
                    e = _.isArray(a) || _.isObject(a) ? f.schema4Object(c, a) : b.getInstance(c, a), d.addSubSchema(e)
                }), d
            },
            this.makeVerbose = function (a, b) {
                switch (a.type) {
                    case"array":
                        user_defined_options.arraysVerbose && (b.minItems = 1, b.uniqueItems = !1, b.additionalItems = user_defined_options.additionalItems);
                        break;
                    case"object":
                        user_defined_options.objectsVerbose && (b.additionalProperties = !0);
                        break;
                    case"integer":
                    case"number":
                        user_defined_options.numericVerbose && (b.multipleOf = 1, b.maximum = 100, b.minimum = 1, b.exclusiveMaximum = !1, b.exclusiveMinimum = !1);
                        break;
                    case"string":
                        user_defined_options.stringsVerbose && (b.minLength = 1);
                    case"boolean":
                    case"null":
                }
                user_defined_options.metadataKeywords && (b.title = a.title, b.description = a.description, b.name = a.name)
            },
            this.initObject = function (a, b) {
                a.isObject() && (b.properties = {}, user_defined_options.additionalProperties ? user_defined_options.objectsVerbose && (b.additionalProperties = !0) : b.additionalProperties = !1)
            },
            this.initArray = function (a, b) {
                if (a.isArray()) {
                    switch (user_defined_options.arrayOptions) {
                        case c.emptySchema:
                            b.items = {};
                            break;
                        case c.singleSchema:
                            b.items = {};
                            break;
                        case c.arraySchema:
                            b.items = []
                    }
                    user_defined_options.additionalItems ? user_defined_options.arraysVerbose && (b.additionalItems = !0) : b.additionalItems = !1
                }
            },
            this.addDefault = function (a, b) {
                user_defined_options.includeDefaults && (a.isObject() || a.isArray() || (b.default = a.defaultValue))
            },
            this.addEnums = function (a, b) {
                user_defined_options.includeEnums && (a.isObject() || a.isArray() || (b.enum = [null], a.defaultValue && b.enum.push(a.defaultValue)))
            },
            this.addRequired = function (a, b) {
                b.__required__ = user_defined_options.forceRequired
            },
            this.setType = function (a, b) {
                b.type = a.type
            },
            this.constructId = function (a, b) {
                if (user_defined_options.absoluteIds)if (a.root)b.id = user_defined_options.url; else {
                    var c = a.parent.id + "/" + a.id;
                    b.id = c, a.id = c
                } else b.id = a.root ? "/" : a.id;
                b.__key__ = a.key
            },
            this.setSchemaRef = function (a, b) {
                a.root && (b._$schema = d, b.__root__ = !0)
            },
            this.constructSchema = function (a) {
                var b = {};
                return f.setSchemaRef(a, b), f.constructId(a, b), f.setType(a, b), f.makeVerbose(a, b), f.addDefault(a, b), f.addEnums(a, b), f.addRequired(a, b), f.initObject(a, b), f.initArray(a, b), _.forEach(a.subSchemas, function (d) {
                    var g = f.constructSchema(d);
                    if (g.__parent__ = b.id, a.isObject())b.properties[d.key] = g; else if (a.isArray())switch (user_defined_options.arrayOptions) {
                        case c.emptySchema:
                            b.items = e.getEmptySchema();
                            break;
                        case c.singleSchema:
                            b.items = g;
                            break;
                        case c.arraySchema:
                            a.subSchemas.length > 1 ? b.items.push(g) : b.items = g
                    }
                }), b
            },
            this.removeSchemaById = function (a, b) {
                for (var c in a)switch ("object" == typeof a[c] && null !== a[c] && this.removeSchemaById(a[c], b), String(c)) {
                    case"id":
                        a[c] == b && (a.__removed__ = !0)
                }
            },
            this.getSchemaById = function (a, b) {
                for (var c in a) {
                    if ("object" == typeof a[c] && null !== a[c])return this.getSchemaById(a[c], b);
                    switch (String(c)) {
                        case"id":
                            if (String(a[c]) == String(b))return a
                    }
                }
            },
            this.removeSchema = function (a) {
                this.removeSchemaById(f.editableSchema, a)
            },
            this.getSchema = function (a) {
                return this.getSchemaById(f.editableSchema, a)
            },
            this.getEditableSchema = function () {
                return f.editableSchema
            },
            this.formatJSON = function (a) {
                return angular.toJson(angular.fromJson(a), !0)
            },
            this.getFormattedJSON = function () {
                return angular.toJson(f.json, !0)
            },
            this.getSchemaAsString = function (a) {
                this.editableSchema2FinalSchema();
                var b = angular.toJson(f.schema, a);
                return b = b.replace("_$", "$")
            }
    };

    function Schemafactory(a, b) {
        b = new Utility();
        var c = function (a, c) {
            var d = !_.isArray(c) && !_.isObject(c);
            this.root = !_.isDefined(a), this.key = this.root ? "/" : String(a), this.id = this.root ? user_defined_options.url : String(a), this.type = b.getType(c), this.title = this.root ? "Root schema." : String(a)[0].toUpperCase() + String(a).slice(1) + " schema.", this.description = "An explanation about the puropose of this instance described by this schema.", this.name = this.root ? "/" : String(a), d && (this.defaultValue = c), this.subSchemas = []
        };
        return c.prototype.addSubSchema = function (a) {
            this.subSchemas.push(a), a.parent = this
        }, c.prototype.isObject = function () {
            return "object" === this.type
        }, c.prototype.isArray = function () {
            return "array" === this.type
        }, c.prototype.isString = function () {
            return "string" === this.type
        }, c.prototype.isNumber = function () {
            return "number" === this.type
        }, c.prototype.isInteger = function () {
            return "integer" === this.type
        }, {
            getInstance: function (a, b) {
                return new c(a, b)
            }
        }
    };

    function Utility() {
        this.getType = function (a) {
            var b = void 0;
            if (_.isArray(a))b = "array"; else if (_.isObject(a))b = "object"; else if (_.isNumber(a)) {
                var c = a % 1 === 0;
                b = c ? "integer" : "number"
            } else _.isString(a) ? b = "string" : null === a ? b = "null" : "boolean" == typeof a && (b = "boolean");
            return b
        }, this.getEmptySchema = function () {
            var a = {}, b = "auto-generated-schema-" + Math.floor(1e3 * Math.random() + 1);
            return a.__key__ = b, a.id = b, user_defined_options.metadataKeywords && (a.title = String(b)[0].toUpperCase() + String(b).slice(1) + " schema.", a.description = "An explanation about the puropose of this instance described by this schema.", a.name = String(b)), a
        }
    };

    function getJsonSchemaString(json, url, setting) {
        var ss = new Schemaservice();
        user_defined_options.json = json;
        user_defined_options.url = url?url:"";
        ss.JSON2Schema();
        return ss.getSchemaAsString(true);
    }

    function getJsonSchema(json, url, setting) {
        return JSON.parse(getJsonSchemaString(json, url, setting));
    }

    _yxs = {};
    _yxs.getJsonSchema = getJsonSchema;
    _yxs.getJsonSchemaString = getJsonSchemaString;
    Function('return this')()._yxs = _yxs;

})();