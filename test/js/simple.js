const assert = require("assert");
const config = require("./config");
const ripe = require("../../src/js");

describe("Ripe", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function() {
        it("should instance correctly", async () => {
            const instance = await new ripe.Ripe("swear", "vyner");

            assert.strictEqual(instance.initials, "");
            assert.strictEqual(instance.engraving, null);
            assert.deepStrictEqual(instance.children, []);
            assert.deepStrictEqual(instance.history, []);
            assert.strictEqual(instance.plugins.length, 1);
            assert.strictEqual(instance.historyPointer, -1);
            assert.strictEqual(instance.ready, false);
        });

        it("should instance and retrieve values", async () => {
            let result = null;

            const instance = new ripe.Ripe("swear", "vyner");
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("config", resolve);
            });

            result = await new Promise((resolve, reject) => {
                instance.bind("price", resolve);
            });

            assert.strictEqual(result.total.price_final > 0.0, true);
            assert.strictEqual(result.total.country, "US");
            assert.strictEqual(result.total.currency, "EUR");

            result = await new Promise((resolve, reject) => {
                instance.getPrice(resolve);
            });

            assert.strictEqual(result.total.price_final > 0.0, true);
            assert.strictEqual(result.total.country, "US");
            assert.strictEqual(result.total.currency, "EUR");
        });

        it("should instance and retrieve config", async () => {
            let result = null;

            const instance = new ripe.Ripe("swear", "vyner");
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("config", resolve);
            });

            result = await new Promise((resolve, reject) => {
                instance.getConfig(resolve);
            });

            assert.strictEqual(result.hidden.indexOf("shadow") !== -1, true);
        });

        it("should instance with custom options", async () => {
            const instance = new ripe.Ripe("swear", "vyner", {
                noDefaults: true,
                noCombinations: true
            });
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("config", resolve);
            });

            assert.strictEqual(Object.keys(instance.parts).length, 0);
        });

        it("should set parts and undo", async () => {
            const instance = new ripe.Ripe("swear", "vyner", {
                remoteCalls: false,
                noCombinations: true
            });
            instance.load();

            const initialParts = await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            assert.deepStrictEqual(instance.parts, initialParts);
            assert.strictEqual(instance.canUndo(), false);
            assert.strictEqual(instance.canRedo(), false);

            await instance.undo();
            assert.strictEqual(instance.canUndo(), false);
            assert.strictEqual(instance.canRedo(), false);

            assert.deepStrictEqual(instance.parts, initialParts);

            assert.strictEqual(instance.parts.front.material, "nappa");
            assert.strictEqual(instance.parts.front.color, "white");

            await instance.setPart("front", "suede", "black");
            const changedParts = Object.assign({}, instance.parts);

            assert.strictEqual(instance.parts.front.material, "suede");
            assert.strictEqual(instance.parts.front.color, "black");
            assert.strictEqual(instance.canUndo(), true);
            assert.strictEqual(instance.canRedo(), false);

            await instance.undo();

            assert.deepStrictEqual(instance.parts, initialParts);
            assert.strictEqual(instance.parts.front.material, "nappa");
            assert.strictEqual(instance.parts.front.color, "white");
            assert.strictEqual(instance.canUndo(), false);
            assert.strictEqual(instance.canRedo(), true);

            await instance.redo();

            assert.deepStrictEqual(instance.parts, changedParts);
            assert.strictEqual(instance.parts.front.material, "suede");
            assert.strictEqual(instance.parts.front.color, "black");
            assert.strictEqual(instance.canUndo(), true);
            assert.strictEqual(instance.canRedo(), false);

            await instance.undo();

            assert.deepStrictEqual(instance.parts, initialParts);
            assert.strictEqual(instance.canUndo(), false);
            assert.strictEqual(instance.canRedo(), true);
        });

        it("should set optional parts and undo", async () => {
            const instance = new ripe.Ripe("swear", "bond", {
                remoteCalls: false,
                noCombinations: true
            });
            instance.load();

            const initialParts = await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            assert.deepStrictEqual(instance.parts, initialParts);
            assert.strictEqual(instance.canUndo(), false);
            assert.strictEqual(instance.canRedo(), false);

            await instance.undo();
            assert.strictEqual(instance.canUndo(), false);
            assert.strictEqual(instance.canRedo(), false);

            assert.deepStrictEqual(instance.parts, initialParts);

            assert.strictEqual(instance.parts.front.material, "nappa");
            assert.strictEqual(instance.parts.front.color, "white");
            assert.strictEqual(instance.parts.strap_tips, undefined);

            await instance.setPart("front", "nappa", "black");

            assert.strictEqual(instance.parts.front.material, "nappa");
            assert.strictEqual(instance.parts.front.color, "black");
            assert.strictEqual(instance.parts.strap_tips, undefined);
            assert.strictEqual(instance.canUndo(), true);
            assert.strictEqual(instance.canRedo(), false);

            await instance.undo();

            assert.strictEqual(instance.parts.front.material, "nappa");
            assert.strictEqual(instance.parts.front.color, "white");
            assert.strictEqual(instance.parts.strap_tips, undefined);
            assert.strictEqual(instance.canUndo(), false);
            assert.strictEqual(instance.canRedo(), true);

            await instance.setPart("strap_tips", "metal", "gold");

            assert.strictEqual(instance.parts.front.material, "nappa");
            assert.strictEqual(instance.parts.front.color, "white");
            assert.strictEqual(instance.parts.strap_tips.material, "metal");
            assert.strictEqual(instance.parts.strap_tips.color, "gold");
            assert.strictEqual(instance.canUndo(), true);
            assert.strictEqual(instance.canRedo(), false);

            await instance.undo();

            assert.strictEqual(instance.parts.front.material, "nappa");
            assert.strictEqual(instance.parts.front.color, "white");
            assert.strictEqual(instance.parts.strap_tips, undefined);
            assert.strictEqual(instance.canUndo(), false);
            assert.strictEqual(instance.canRedo(), true);
        });

        it("should set parts with no redundancy", async () => {
            const instance = new ripe.Ripe("swear", "vyner", {
                remoteCalls: false,
                noCombinations: true
            });
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            assert.strictEqual(instance.partCounter, 8);

            await instance.setPart("front", "suede", "black");

            assert.strictEqual(instance.parts.front.material, "suede");
            assert.strictEqual(instance.parts.front.color, "black");
            assert.strictEqual(instance.partCounter, 9);

            await instance.setPart("front", "suede", "black");

            assert.strictEqual(instance.parts.front.material, "suede");
            assert.strictEqual(instance.parts.front.color, "black");
            assert.strictEqual(instance.partCounter, 9);

            await instance.setPart("front", "suede", "white");

            assert.strictEqual(instance.parts.front.material, "suede");
            assert.strictEqual(instance.parts.front.color, "white");
            assert.strictEqual(instance.partCounter, 10);

            await instance.setPart("front", "suede", "white");

            assert.strictEqual(instance.parts.front.material, "suede");
            assert.strictEqual(instance.parts.front.color, "white");
            assert.strictEqual(instance.partCounter, 10);

            await instance.setPart("front", "suede", "black");

            assert.strictEqual(instance.parts.front.material, "suede");
            assert.strictEqual(instance.parts.front.color, "black");
            assert.strictEqual(instance.partCounter, 11);
        });

        it("should initiate with dku", async () => {
            const instance = new ripe.Ripe({
                dku: "swear.vyner.-1.3:10.0:2.0:1.0:3.7:2.0:5.4:0:2.5:0:0.sw:metal_gold"
            });
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("ready", resolve);
            });

            assert.strictEqual(instance.brand, "swear");
            assert.strictEqual(instance.model, "vyner");
            assert.strictEqual(instance.initials, "sw");
            assert.strictEqual(instance.engraving, "metal_gold");
        });
    });
});
