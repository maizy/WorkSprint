describe("common.js tests", function () {

    var testConstructor = function () {};
    var testConstructor2 = function () {};
    var testConstructor3 = function () {};

    it('ns should exist', function(){
        expect(ns).toBeDefined();
        expect(ns).toEqual(window.ns);
    });

    ns('JsTest.name.s.p.a.c.e').testC = testConstructor;

    it("ns should work", function () {
        expect(JsTest.name.s.p.a.c.e.testC).toEqual(testConstructor);
    });

    it("ns should extends", function () {
        ns('JsTest.name.s.p.a.c.e.ext').abc = testConstructor2;
        expect(JsTest.name.s.p.a.c.e.testC).toEqual(testConstructor);
        expect(JsTest.name.s.p.a.c.e.ext.abc).toEqual(testConstructor2);
    });

    it("ns should extends not only objects", function () {
        ns('JsTest.name.s.p.a.c.e.testC.staticMethod').somemore = testConstructor3;
        expect(JsTest.name.s.p.a.c.e.testC).toEqual(testConstructor);
        expect(JsTest.name.s.p.a.c.e.testC.staticMethod.somemore).toEqual(testConstructor3);
    });

    it("ns should add keys", function () {
        ns('JsTest.name.s.p.a.c.e', 'key', testConstructor);
        expect(JsTest.name.s.p.a.c.e.key).toEqual(testConstructor);
    });

    it("ns should not overwrite keys", function () {
        ns('JsTest.name.s.p.a.c.e', 'key', testConstructor);
        ns('JsTest.name.s.p.a.c.e', 'key', testConstructor2);
        expect(JsTest.name.s.p.a.c.e.key).toEqual(testConstructor);
    });

});