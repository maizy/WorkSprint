describe("Failed tests", function () {
    var f = xit;
    if (String(document.location).match('fail')) {
        f = it;
    }

    f("always fails", function () {
        expect(2).toEqual(1);
    });

    if (f === it) {
        unknown_global_var.prop;
    }
});