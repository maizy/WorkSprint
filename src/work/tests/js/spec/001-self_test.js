describe("Self & libs tests", function () {

    it("$ should be jQuery", function () {
        expect($).toEqual(jQuery);
    });

    it("_ should be underscore", function () {
        expect(_).toBeDefined();
        expect(_.debounce).toBeDefined();
    });

});