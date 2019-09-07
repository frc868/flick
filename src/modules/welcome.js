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
                            ".\n**To enter the server**, please do the following:\n" +
                            "Type `;nick Firstname Lastname` to identify yourself.\n" +
                            "Type `;division Robot Ops` (or whatever your division is) to gain access to your division."
                    );
            }
        };
    }
};
