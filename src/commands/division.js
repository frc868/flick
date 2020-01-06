const { debug, info, error, fatal, assert } = require("../logging.js");
const fuzzyset = require("fuzzyset.js");

module.exports = {
    commands: { division: null, removedivision: ["undivision"] },
    init: ({ config }) => {
        const division = add => async ({ msg, rawArgs }) => {
            let roles = [];
            let fuzzyRoles = fuzzyset();
            config.divisions.forEach(id => {
                const append = msg.guild.roles.find(role => role.id === id);
                roles.push(append);
                fuzzyRoles.add(append.name);
            });
            if (add) {
                // ;division
                if (!rawArgs) return { title: "What division?" };

                debug(fuzzyRoles.get(rawArgs));

                // fuzzyset.js returns [[confidence, 'string']]; just getting the first
                const role = msg.guild.roles.find(x => {
                    let result = fuzzyRoles.get(rawArgs);
                    if (result) return x.name === result[0][1];
                    else return null;
                });

                if (!role)
                    return {
                        title: "Couldn't find that division..."
                    };
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
