module.exports = {
    presets: [],

    overrides: [
        {
            include: ["./packages/lib"],
            presets: [["@babel/preset-typescript"]],
        },
    ],
};
