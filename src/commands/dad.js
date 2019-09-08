const { debug, info, error, fatal, assert } = require("../logging.js");
const superagent = require("superagent");

module.exports = {
    init: () => ({
        dad: async () => {
            const result = await superagent.get("https://icanhazdadjoke.com")
                  .accept("json")
                  .then(res => res.body.joke)
                  .catch(error);
            if (!result) return "Stop.";
            return {
                fields: [
                    {
                        title: "Terrible joke",
                        value: result
                    }
                ]
            };
        }
    })
};
