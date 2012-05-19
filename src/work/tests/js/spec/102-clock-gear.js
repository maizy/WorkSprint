describe("clock.js tests", function () {

    it("should create new interval on begin()", function () {
        var clock = new Worksprint.Gear.Clock();
        clock.begin();
        clock.begin();

        expect(clock.getPeriodsAmount()).toEqual(2);
    });

    it("shouldn't create new interval on pause() when not running", function () {
        var clock = new Worksprint.Gear.Clock();
        clock.pause();

        expect(clock.getPeriodsAmount()).toEqual(0);
    });

});