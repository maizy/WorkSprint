describe("Self & libs tests", function () {

    it("window should be global object", function () {
        expect(Function('return this')()).toEqual(window);
    });

    it("$ should be jQuery", function () {
        expect($).toEqual(jQuery);
    });

    it("_ should be underscore", function () {
        expect(_).toBeDefined();
        expect(_.debounce).toBeDefined();
    });

});