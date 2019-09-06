const { debug, info, error, fatal, assert } = require("../logging.js");

module.exports = {
    init: function({ config }) {
        return {
            onMemberAdd: function({ member, dclient }) {
                debug("Caught user", member.user.username);
                dclient.channels
                    .get(config.channel)
                    .send(
                        "Welcome to the TechHOUNDS Discord, **" +
                            member.user.username +
                            "**.\nPlease read the " +
                            member.guild.channels.get(config.rules).toString() +
                            " for information on how to set your nickname and join a division."
                    );
            }
        };
    }
};
