const { debug, info, error, fatal, assert } = require("../logging.js");

module.exports = {
    commands: { iam: null, iamnot: ["iamn"] },
    init: ({ config }) => {
        const iam = add => async ({ msg, rawArgs }) => {
            assert(
                msg.guild.roles.has(config.separatorRole),
                "valid separator role"
            );
            const separatorRole = msg.guild.roles.get(config.separatorRole);
            const role = msg.guild.roles.find(
                x => x.name.toLowerCase() === rawArgs.toLowerCase()
            );
            if (!role) return { title: "Couldn't find that role..." };
            if (add) {
                if (msg.member.roles.has(role.id))
                    return { title: "You already were!" };
                if (role.comparePositionTo(separatorRole) >= 0)
                    return {
                        title:
                            "You buffoon. You fiend. You absolute cretin. Stop trying to escalate permissions."
                    };
                await msg.member.addRole(role);
                return { title: "Added!" };
            } else {
                if (!msg.member.roles.has(role.id))
                    return {
                        title: "You weren't but now you aren't even more."
                    };
                if (role.comparePositionTo(separatorRole) >= 0)
                    return { title: "Yes you are." };
                await msg.member.removeRole(role);
                return { title: "Removed!" };
            }
        };
        return {
            iam: iam(true),
            iamn: iam(false),
            iamnot: iam(false)
        };
    }
};
