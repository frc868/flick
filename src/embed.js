const { debug, info, error, fatal, assert } = require("./logging.js")
const discord = require("discord.js");

// Object contents:
// {
//     color: "#000000"
//     title: "TechHOUNDS",
//     url: "http://techhounds.com"
//     fields: [
//         { title = "something", value = "something" },
//         { title = "nothing", value = "nothing" }, 
//     ],
//     footer: { text: "", icon: "" },
//     image = "https://techhounds.com/Gold_Coin.png"
// }
function makeEmbed(contents) {
    let message = new discord.RichEmbed() 
        .setColor(contents.color)
        .setTitle(contents.title)
        .setURL(contents.url)
        .setImage(contents.image)
        .setFooter(contents.footer.text, contents.footer.icon)
        .setTimestamp();
    contents.fields.forEach(x => message.addField(x));
    return message;
}

module.exports = makeEmbed;
