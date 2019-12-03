const { debug, info, error, fatal, assert } = require("../logging.js");
const xclient = require("xkcd-api"); // i hate this api, but i don't feel like writing my own crawler
const util = require("util");

const xlatest = util.promisify(xclient.latest);
const xget = util.promisify(xclient.get);
const xrandom = util.promisify(xclient.random);

module.exports = {
    commands: { xkcd: null },
    init: () => {
        const xkcd = () => async ({ msg, args }) => {
            if (args.length === 0) {
                const ret = await xlatest().catch(_ =>
                    error("failed to find latest xkcd")
                );
                return {
                    title: "XKCD " + ret.num + ": " + ret.title,
                    image: ret.img,
                    fields: [{ title: "Alt text", value: ret.alt }]
                };
            } else if (args.length === 1) {
                let ret;
                if (args[0].localeCompare("random") === 0)
                    ret = await xrandom().catch(_ =>
                        info("failed to get random xkcd")
                    );
                else
                    ret = await xget(args[0]).catch(_ =>
                        info("failed to get xkcd", args[0])
                    );
                if (ret)
                    return {
                        title: "XKCD " + ret.num + ": " + ret.title,
                        image: ret.img,
                        fields: [{ title: "Alt text", value: ret.alt }]
                    };
                return "Couldn't find that one...";
            }
        };
        return { xkcd: xkcd() };
    }
};
