const assert = require("assert");
const config = require("./config");
const ripe = require("../../src/js");

describe("Ripe", function () {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function () {
        it("should instance and retrieve values", async () => {
            let result = null;

            const instance = new ripe.Ripe("myswear", "vyner");
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            result = await new Promise((resolve, reject) => {
                instance.bind("price", resolve);
            });

            assert.equal(result.total.price_final > 0.0, true);
            assert.equal(result.total.country, "US");
            assert.equal(result.total.currency, "EUR");

            result = await new Promise((resolve, reject) => {
                instance.getPrice(resolve);
            });

            assert.equal(result.total.price_final > 0.0, true);
            assert.equal(result.total.country, "US");
            assert.equal(result.total.currency, "EUR");
        });
        it("should instance and retrieve config", async () => {
            let result = null;

            const instance = new ripe.Ripe("myswear", "vyner");
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            result = await new Promise((resolve, reject) => {
                instance.getConfig(resolve);
            });

            assert.equal(result.hidden.indexOf("shadow") !== -1, true);
        });
        it("should instance with custom options", async () => {
            const instance = new ripe.Ripe("myswear", "vyner", {
                noDefaults: true,
                noCombinations: true
            });
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            assert.equal(Object.keys(instance.parts).length, 0);
        });
    });
});
