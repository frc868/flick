module.exports = {
    init: () => ({
        repo: () => {
            return {
                title: "Thanks for using Flick!",
                fields: [
                    {
                        title: "Flick's repo",
                        value: "https://github.com/frc868/flick"
                    },
                    {
                        title: "Vinny (the source project)'s repo",
                        value: "https://github.com/k2l8m11n2/vinny"
                    }
                ]
            };
        }
    })
};
