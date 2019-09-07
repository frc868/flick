const { debug, info, error, fatal, assert } = require("../logging.js");

module.exports = {
    commands: { division: null, removedivision: ["undivision"] },
    init: ({ config }) => {
        const division = add => async ({ msg, rawArgs }) => {
            assert(
                msg.guild.roles.has(config.separatorRole),
                "valid separator role"
            );
            const separatorRole = msg.guild.roles.get(config.separatorRole);
            let r = 1; // 1 to exclude @everyone
            let roles = [];
            while (r < separatorRole.position) {
                // get all roles under seperator role
                const append = msg.guild.roles.find(x => x.position === r);
                if (!append) error("failed to get usable divisions", r);
                roles.push(append.id); // store ids for comparison purposes
                r++;
            }
            if (add) {
                const role = msg.guild.roles.find(
                    x => x.name.toLowerCase() === rawArgs.toLowerCase()
                );
                // debug("has", msg.member.roles.has(role.id));
                // debug("position", role.position);

                if (msg.member.roles.has(config.alumniRole))
                    return "You're an alum!";
                if (!role) return "Try signing up for a division that exists.";
                if (roles.map(x => msg.member.roles.has(x)).includes(true))
                    return "You're already in a division!";
                if (msg.member.roles.has(role.id)) return "You already were :)";
                if (role.comparePositionTo(separatorRole) >= 0) return "no";
                await msg.member.addRole(role);
                return "Added!";
            } else {
                const current = msg.member.roles.find(x =>
                    roles.includes(x.id)
                );
                if (!current) return "Get in a division first!";
                await msg.member.removeRole(current);
                return "Removed! Get yourself a new division.";
            }
        };
        return {
            division: division(true),
            removedivision: division(false),
            undivision: division(false)
        };
    }
};
