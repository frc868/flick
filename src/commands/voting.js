const { debug, info, error, fatal, assert } = require("../logging.js");

const FOR = 1;
const AGAINST = 0;

module.exports = {
    commands: {
        yes: [
            "yea",
            "aye",
            "for",
            "sure",
            "yep",
            "ye",
            "yee",
            "yeah",
            "totally",
            "absolutely"
        ],
        no: ["nay", "against", "nah", "nope", "nuh", "never"],
        vote: null,
        mkvote: null,
        rmvote: ["veto"]
    },
    init: ({ db, serverId, lock, config }) => {
        db.prepare(
            "CREATE TABLE IF NOT EXISTS votes (serverId TEXT, userId TEXT, direction INTEGER, UNIQUE (serverId, userId))"
        ).run();
        db.prepare(
            "CREATE TABLE IF NOT EXISTS voting (serverId TEXT PRIMARY KEY, required INTEGER, roleSize INTEGER, role TEXT)"
        ).run();
        const activeVotePrepared = db.prepare(
            "SELECT 1 FROM voting WHERE serverId = ?"
        );
        const voteInfoPrepared = db.prepare(
            "SELECT role, required, roleSize FROM voting WHERE serverId = ?"
        );
        const votedAlreadyPrepared = db.prepare(
            "SELECT 1 FROM votes WHERE serverId = ? AND userId = ?"
        );
        const addVotePrepared = db.prepare(
            "INSERT INTO votes (serverId, userId, direction) VALUES (?, ?, ?)"
        );
        const changeVotePrepared = db.prepare(
            "UPDATE votes SET direction = ? WHERE serverId = ? AND userId = ?"
        );
        const voteCountsPrepared = db.prepare(
            "SELECT direction, COUNT(*) FROM votes WHERE serverId = ? GROUP BY direction"
        );
        const mkvotePrepared = db.prepare(
            "INSERT INTO voting (serverId, required, roleSize, role) VALUES (?, ?, ?, ?)"
        );
        const deleteVotesPrepared = db.prepare(
            "DELETE FROM votes WHERE serverId = ?"
        );
        const deleteVotingPrepared = db.prepare(
            "DELETE FROM voting WHERE serverId = ?"
        );

        const vote = up => ({ msg }) => {
            let ret = "";
            lock.acquire("voting", done => {
                debug("voting lock acquired in vote");

                const activeVote = activeVotePrepared.get(serverId);
                if (!activeVote) {
                    ret = "No vote currently in progress.";
                    done();
                    return;
                }

                const {
                    role: voteRole,
                    required: voteRequired,
                    roleSize
                } = voteInfoPrepared.get(serverId);
                if (!msg.member.roles.has(voteRole)) {
                    ret = "You're not authorized to vote.";
                    done();
                    return;
                }

                const votedAlready = votedAlreadyPrepared.get(
                    serverId,
                    msg.author.id
                );

                if (votedAlready) {
                    debug("changing a vote to", up ? "for" : "against");
                    changeVotePrepared.run(
                        up ? FOR : AGAINST,
                        serverId,
                        msg.author.id
                    );
                } else {
                    debug("adding a vote", up ? "for" : "against");
                    addVotePrepared.run(
                        serverId,
                        msg.author.id,
                        up ? FOR : AGAINST
                    );
                }
                msg.react("\uD83D\uDDF3") // https://emojipedia.org/ballot-box-with-ballot
                    .then(() => {
                        if (votedAlready) {
                            msg.react("\uD83D\uDD04"); // https://emojipedia.org/anticlockwise-downwards-and-upwards-open-circle-arrows
                        }
                    });

                const votes = { [FOR]: 0, [AGAINST]: 0 };
                voteCountsPrepared.all(serverId).forEach(x => {
                    votes[x.direction] = x["COUNT(*)"];
                });

                const leading = Math.max(votes[FOR], votes[AGAINST]);
                assert(
                    leading <= voteRequired,
                    "leading option below or equal to threshold"
                );
                const second = Math.min(votes[FOR], votes[AGAINST]);
                const voteTotal = votes[FOR] + votes[AGAINST];
                assert(
                    voteTotal <= roleSize,
                    "vote total below or equal to role size"
                );
                if (
                    leading === voteRequired ||
                    voteTotal === roleSize ||
                    roleSize - voteTotal /*uncast votes*/ <
                        leading - second /*gap*/
                ) {
                    done();
                    ret = rmvote(true)({ msg });
                } else {
                    done();
                }
            }).then(() => debug("voting lock released in vote"));
            if (typeof ret === "string" && ret)
                return { fields: [{ title: "Vote status", value: ret }] };
            else return ret;
        };

        const voteStatus = ({ msg }) => {
            let ret = "";
            lock.acquire("voting", done => {
                debug("voting lock acquired in voteStatus");
                const activeVote = activeVotePrepared.get(serverId);
                if (!activeVote) {
                    ret = "No vote currently in progress.";
                    done();
                    return;
                }

                const {
                    role: voteRole,
                    required: voteRequired
                } = voteInfoPrepared.get(serverId);
                if (!msg.member.roles.has(voteRole)) {
                    ret = "You're not authorized to do that.";
                    done();
                    return;
                }

                const votes = { [FOR]: 0, [AGAINST]: 0 };
                voteCountsPrepared.all(serverId).forEach(x => {
                    votes[x.direction] = x["COUNT(*)"];
                });

                let color;
                if (votes[FOR] > votes[AGAINST]) {
                    color = config.passingColor;
                } else if (votes[FOR] < votes[AGAINST]) {
                    color = config.failingColor;
                } else {
                    color = config.neutralColor;
                }

                roleName = msg.guild.roles.get(voteRole).name.replace(/@/g, "");

                ret = {
                    title: `Vote status for role ${roleName}`,
                    color: color,
                    fields: [
                        { title: "For", value: votes[FOR] },
                        { title: "Against", value: votes[AGAINST] }
                    ]
                };
                done();
            }).then(() => debug("voting lock released in voteStatus"));
            if (typeof ret === "string" && ret)
                return { fields: [{ title: "Vote status", value: ret }] };
            else return ret;
        };

        const mkvote = ({ msg, args }) => {
            const mkEmbed = contents => {
                return { fields: [{ title: "Vote status", value: contents }] };
            };

            if (!msg.member.roles.has(config.creatorRole))
                return mkEmbed("Stop.");

            let required, roleName;
            if (args[0] && args[1]) {
                [required, roleName] = args;
            } else if (args[0]) {
                if (isNaN(args[0])) {
                    roleName = args[0];
                } else {
                    required = args[0];
                }
            } else {
                return mkEmbed("Please specify a valid count and/or role.");
            }

            debug({ required, roleName });

            let role;
            if (roleName === "everyone") {
                roleName = "@everyone";
            }
            if (roleName) {
                role = msg.guild.roles.find(
                    x => x.name.toLowerCase() === roleName.toLowerCase()
                );
                if (!role) {
                    return mkEmbed("Couldn't find that role :/");
                }
                roleName = roleName.replace(/@/g, "");
            } else {
                role = msg.guild.roles.get(config.defaultRole);
                roleName = role.name;
            }

            if (required) {
                required = Math.min(required, role.members.size);
            } else {
                required = Math.floor(role.members.size / 2 + 1);
            }
            required = Math.max(required, 1);

            rmvote(true)({ msg });

            lock.acquire("voting", done => {
                debug("voting lock acquired in mkvote");
                mkvotePrepared.run(
                    serverId,
                    required,
                    role.members.size,
                    role.id
                );
                done();
            }).then(() => debug("voting lock released in mkvote"));

            return {
                fields: [
                    {
                        title: `Vote status for role ${roleName}`,
                        value: `Starting vote with ${required} votes required`
                    }
                ]
            };
        };

        const rmvote = internal => ({ msg }) => {
            let ret = "";
            lock.acquire("voting", done => {
                debug("voting lock acquired in rmvote");
                if (!msg.member.roles.has(config.creatorRole) && !internal) {
                    ret = "Stop.";
                    done();
                    return;
                }

                const activeVote = activeVotePrepared.get(serverId);
                if (!activeVote) {
                    if (!internal) {
                        ret = "No vote currently in progress.";
                    }
                    done();
                    return;
                }

                const votes = { [FOR]: 0, [AGAINST]: 0 };
                voteCountsPrepared.all(serverId).forEach(x => {
                    votes[x.direction] = x["COUNT(*)"];
                });

                let color;
                if (votes[FOR] > votes[AGAINST]) {
                    color = config.passingColor;
                } else if (votes[FOR] < votes[AGAINST]) {
                    color = config.failingColor;
                } else {
                    color = config.neutralColor;
                }

                db.transaction(() => {
                    deleteVotesPrepared.run(serverId);
                    deleteVotingPrepared.run(serverId);
                })();

                ret = {
                    title: `Final vote results`,
                    color: color,
                    fields: [
                        { title: "For", value: votes[FOR] },
                        { title: "Against", value: votes[AGAINST] }
                    ]
                };
                done();
            }).then(() => debug("voting lock released in rmvote"));
            if (typeof ret === "string" && ret)
                return { fields: [{ title: "Vote status", value: ret }] };
            else return ret;
        };

        return {
            yea: vote(true),
            aye: vote(true),
            yes: vote(true),
            for: vote(true),
            sure: vote(true),
            yep: vote(true),
            ye: vote(true),
            yee: vote(true),
            yeah: vote(true),
            totally: vote(true),
            absolutely: vote(true),

            nay: vote(false),
            no: vote(false),
            against: vote(false),
            nah: vote(false),
            nope: vote(false),
            nuh: vote(false),
            never: vote(false),

            vote: voteStatus,
            mkvote: mkvote,
            rmvote: rmvote(false),
            veto: rmvote(false)
        };
    }
};
