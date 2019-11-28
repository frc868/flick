const { debug, info, error, fatal, assert } = require("../logging.js");
const fuzzyset = require("fuzzyset.js");

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
            let fuzzyRoles = fuzzyset();
            while (r < separatorRole.position) {
                // get all roles under seperator role
                const append = msg.guild.roles.find(x => x.position === r);
                if (!append) error("failed to get usable divisions", r);
                roles.push(append);
                fuzzyRoles.add(append.name);
                r++;
            }
            if (add) {
                // ;division
                if (!rawArgs)
                    return { title: "What division?" }

                debug(fuzzyRoles.get(rawArgs));

                // fuzzyset.js returns [[confidence, 'string']]; just getting the first
                const role = msg.guild.roles.find(
                    x => {
                        let result = fuzzyRoles.get(rawArgs);
                        if (result)
                            return x.name === result[0][1];
                        else
                            return null;
                    }
                );

                if (!role)
                    return {
                        title: "Couldn't find that division..."
                    };
                if (role.comparePositionTo(separatorRole) >= 0)
                    return { title: "Go away." };
                if (roles.map(x => msg.member.roles.has(x.id)).includes(true))
                    return { title: "You're already in a division!" };
                await msg.member.addRole(role);
                return { title: "Added!" };
            } else {
                // ;undivision
                const current = msg.member.roles.find(x =>
                    roles.map(r => r.id).includes(x.id)
                );
                if (!current) return { title: "Get in a division first!" };
                await msg.member.removeRole(current);
                return { title: "Removed! Get yourself a new division." };
            }
        };
        return {
            division: division(true),
            removedivision: division(false),
            undivision: division(false)
        };
    }
};
