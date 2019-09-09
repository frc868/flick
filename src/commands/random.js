const ulid = require("ulid").ulid;
const uuid = require("uuid/v4");
const coin = () =>
    Math.random() < 0.5
        ? mkEmbed("Coin flip", "Heads!")
        : mkEmbed("Coin flip", "Tails!");

const { debug, info, error, fatal, assert } = require("../logging.js");

const mkEmbed = (title, content) => {
    return { fields: [{ title: title, value: content }] };
};

module.exports = {
    commands: { ulid: null, uuid: null, coin: ["flip"] },
    init: () => {
        return {
            coin,
            flip: coin(),
            ulid: () => mkEmbed("ULID", ulid()),
            uuid: () => mkEmbed("UUID v4", uuid())
        };
    }
};
