describe("yxsjson", function () {


    beforeEach(function () {

    });

    var json = {
        "address": {
            "streetAddress": "21 2nd Street",
            "city": "New York"
        },
        "phoneNumber": [
            {
                "location": "home",
                "code": 44
            }
        ]
    };

    var ret = {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "id": "",
        "type": "object",
        "properties": {
            "address": {
                "id": "/address",
                "type": "object",
                "properties": {
                    "streetAddress": {
                        "id": "/address/streetAddress",
                        "type": "string"
                    },
                    "city": {
                        "id": "/address/city",
                        "type": "string"
                    }
                },
                "required": [
                    "streetAddress",
                    "city"
                ]
            },
            "phoneNumber": {
                "id": "/phoneNumber",
                "type": "array",
                "items": {
                    "id": "/phoneNumber/0",
                    "type": "object",
                    "properties": {
                        "location": {
                            "id": "/phoneNumber/0/location",
                            "type": "string"
                        },
                        "code": {
                            "id": "/phoneNumber/0/code",
                            "type": "integer"
                        }
                    }
                }
            }
        },
        "required": [
            "address",
            "phoneNumber"
        ]
    };


    it("basic test", function () {
        expect(JSON.stringify(_yxs.getJsonSchema(json))).toEqual(JSON.stringify(ret));
    });


    var testschema = {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "id": "",
        "type": "object",
        "properties": {
            "address": {
                "id": "/address",
                "type": "object",
                "properties": {
                    "streetAddress": {
                        "id": "/address/streetAddress",
                        "type": "string"
                    },
                    "city": {
                        "id": "/address/city",
                        "type": "string"
                    },
                    "ip": {
                        "id": "/address/ip",
                        "type": "string",
                        "format":"ipv4"
                    }
                },
                "required": [
                    "streetAddress",
                    "city"
                ]
            },
            "phoneNumber": {
                "id": "/phoneNumber",
                "type": "array",
                "items": {
                    "id": "/phoneNumber/0",
                    "type": "object",
                    "properties": {
                        "location": {
                            "id": "/phoneNumber/0/location",
                            "type": "string"
                        },
                        "code": {
                            "id": "/phoneNumber/0/code",
                            "type": "integer"
                        },
                        "name": {
                            "id": "/phoneNumber/0/name",
                            "type": "string",
                            "pattern":".*yxs.*"
                        }
                    }
                }
            }
        },
        "required": [
            "address",
            "phoneNumber"
        ]
    };

    var grule = [testschema];

    function mylog(msg) {
        if (console.log) {
            console.log(msg)
        }
        else {
            println(msg);
        }
    }

    var allrule = {};
    _.forEach(grule, function (d) {
        allrule[d.id] = d;
    });

    function runtest(urlobj) {
        var rule = allrule[urlobj.url] ? allrule[urlobj.url] : false;
        if (rule) {
            var checker = jsen(rule);
            var ret = {ret: checker(urlobj.body), error: checker.errors};
            mylog(JSON.stringify(ret));
            return ret;
        }
        else {
            return {ret: false, error: {}};
        }
    }

    it("validator basic", function () {
        var ret = runtest({url: "", body: {}});
        expect(ret.ret).toEqual(false);
    });

    it("validator pattern true", function () {
        var ret = runtest({
            url: "", body: {
                "address": {
                    "streetAddress": "21 2nd Street",
                    "city": "New York"
                },
                "phoneNumber": [
                    {
                        "location": "home",
                        "code": 44,
                        "name":"is yxs good man?"
                    }
                ]
            }
        });
        expect(ret.ret).toEqual(true);
    });

    it("validator pattern false", function () {
        var ret = runtest({
            url: "", body: {
                "address": {
                    "streetAddress": "21 2nd Street",
                    "city": "New York"
                },
                "phoneNumber": [
                    {
                        "location": "home",
                        "code": 44,
                        "name":"is yxxs good man?"
                    }
                ]
            }
        });
        expect(ret.ret).toEqual(false);
    });


    it("validator format true", function () {
        var ret = runtest({
            url: "", body: {
                "address": {
                    "streetAddress": "127.0.0.1",
                    "city": "New 123 York",
                    "ip":"127.0.0.1"
                },
                "phoneNumber": [
                    {
                        "location": "home",
                        "code": 44
                    }
                ]
            }
        });
        expect(ret.ret).toEqual(true);
    });

    it("validator format false", function () {
        var ret = runtest({
            url: "", body: {
                "address": {
                    "streetAddress": "127.0.0.1",
                    "city": "New 123 York",
                    "ip":"127.0.0.331"
                },
                "phoneNumber": [
                    {
                        "location": "home",
                        "code": 44
                    }
                ]
            }
        });
        expect(ret.ret).toEqual(false);
    });


});


