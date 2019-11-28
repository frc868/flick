const { debug, info, error, fatal, assert } = require("../logging.js");
const superagent = require("superagent");
const $ = require("cheerio"); // getting jQuery PTSD...

// VexPro part numbers are "XXX-XXXX", AndyMark is "am-XXXX"
// VexPro has a couple outliers, need to decide how to handle these
const isVexPro = num => {
    const s = num.split("-");
    if (s.length === 2) {
        return (s[0].length === 3 && s[1].length === 4);
    }
    return false; // isn't valid AM *or* VexPro
};

const partUrl = num => {
    if (isVexPro(num)) 
        return "https://vexrobotics.com/" + encodeURI(num) + ".html";
    if (num.startsWith("am-"))
        return "https://andymark.com/" + encodeURI(num);
    return "";
};

module.exports = {
    commands: { part: ["am", "vexpro"] },
    init: () => {
        const part = num => async ({ msg, args }) => {
            
        };
    }
};
