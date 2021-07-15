const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'production',
    entry:[
        path.resolve(__dirname, 'app/js/index.js'),
    ],
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: "./app/index.html", to: "index.html"
        },
        {
            from: "./app/img/BlessedCoin.png", to: "BlessedCoin.png"
        }
        ]),
    ],
    node: {
        fs: "empty"
    }
};