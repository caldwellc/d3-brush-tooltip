// webpack.config.js
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'd3-brush-tooltip.js',
        library: {
            type: 'umd',
            name: 'd3BrushTooltip',
        },
        // prevent error: `Uncaught ReferenceError: self is not define`
        globalObject: 'this',
    },
};