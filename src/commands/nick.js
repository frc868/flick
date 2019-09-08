const { debug, info, error, fatal, assert } = require("../logging.js");

module.exports = {
    commands: { nick: null },
    init: () => {
        const nick = () => async ({ msg, args }) => {
            if (args.length != 2)
                return {
                    title:
                        "Please enter a name in the format Firstname Lastname."
                };
            await msg.member.setNickname(
                args[0].charAt(0).toUpperCase() +
                    args[0].slice(1) +
                    " " +
                    args[1].charAt(0).toUpperCase()
            );
            return { title: "Done!" };
        };
        return {
            nick: nick()
        };
    }
};
