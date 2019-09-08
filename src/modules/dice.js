const { debug, info, error, fatal, assert } = require("../logging.js");
const makeEmbed = require("../embed.js");

module.exports = {
    init: function({ config, serverId, globalConfig }) {
        const prefixes = config.prefixes || [";"];
        let defaultEmbed = {
            title: "",
            url: "",
            fields: [],
            image: "",
            footer: { text: "", icon: "" },
            color: globalConfig.servers[serverId].embed.color
        };
        const footers = globalConfig.servers[serverId].embed.footers;
        const icon = globalConfig.servers[serverId].embed.icon;

        return {
            onMessage: function({ msg }) {
                defaultEmbed.footer = {
                    text: footers[Math.floor(Math.random() * footers.length)],
                    icon: icon
                };
                debug(defaultEmbed);

                function getRandomInt(min, max) {
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
                    min = Math.ceil(min);
                    max = Math.floor(max);
                    return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
                }

                prefixes.forEach(prefix => {
                    const diceRegex = new RegExp(
                        prefix +
                            "([1-9][0-9]|[1-9])?d(100|[1-9][0-9]|[2-9])((?:|\\+|-)(?:[1-9][0-9]|[1-9]))?"
                    );
                    match = msg.content.match(diceRegex);
                    if (match) {
                        const dice = parseInt(match[1]) || 1;
                        const sides = parseInt(match[2]);
                        const modifier = parseInt(match[3]) || 0;
                        const rolls = [...Array(dice)]
                            .map(() => getRandomInt(1, sides + 1))
                            .sort((x, y) => x - y);
                        const result = rolls.reduce((x, y) => x + y) + modifier;
                        const modifierDisplay =
                            modifier === 0
                                ? ""
                                : modifier > 0
                                ? " + " + modifier
                                : " - " + -modifier;
                        if (dice > 1 || modifierDisplay) {
                            const embed = {
                                title:
                                    "Roll " +
                                    dice +
                                    " " +
                                    sides +
                                    "-sided dice",
                                fields: [
                                    {
                                        title: "Result",
                                        value: `[${rolls.join(
                                            ", "
                                        )}]${modifierDisplay} = ${result}`
                                    }
                                ]
                            };
                            msg.channel.send(
                                "",
                                makeEmbed({ ...defaultEmbed, ...embed })
                            );
                        } else {
                            const embed = {
                                title: "Roll a " + sides + "-sided die",
                                fields: [{ title: "Result", value: result }]
                            };
                            msg.channel.send(
                                "",
                                makeEmbed({ ...defaultEmbed, ...embed })
                            );
                        }
                    }
                });
            }
        };
    }
};
