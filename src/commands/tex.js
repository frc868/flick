module.exports = {
    commands: { tex: null, whitex: null },
    init: () => {
        const tex = white => async ({ msg, rawArgs }) => {
            if (white) {
                var settings = "\\bg_white \\huge \\dpi{500}";
                var title = "TeX output (light theme? really?)";
            } else {
                var title = "TeX output";
                var settings = "\\huge \\dpi{500} \\color{white}";
            }
            return {
                title: title,
                image:
                    "https://latex.codecogs.com/png.latex?" +
                    encodeURI(settings + " " + rawArgs)
            };
        };
        return { tex: tex(false), whitex: tex(true) };
    }
};
