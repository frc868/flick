const { debug, info, error, fatal, assert } = require("../logging.js");
const discord = require("discord.js");
const xclient = require("xkcd-api"); // i hate this api, but i don't feel like writing my own crawler

const sendAttachment = (msg, url) => {
    msg.channel.send("", {
        files: [new discord.Attachment(url)]
    });
};

const xkcd = () => {
    return ({ msg, args }) => {
        if (args.length === 0) {
            xclient.latest((err, resp) => {
                if (err) {
                    error("failed to find random xkcd"); // wtf
                } else {
                    sendAttachment(msg, resp.img);
                }
            });
        } else if (args.length === 1) {
            xclient.get(args[0], (err, resp) => {
                if (err) {
                    info("failed to find xkcd", args[0]);
                    msg.channel.send("Couldn't find that one...");
                } else {
                    sendAttachment(msg, resp.img);
                }
            });
        }
    };
};

module.exports = { init: () => ({ xkcd: xkcd() }) };
