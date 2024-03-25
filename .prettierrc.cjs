/** @type {import('prettier').Options} */
module.exports = {
	singleQuote: true,
	trailingComma: 'es5',
	plugins: [require.resolve('prettier-plugin-tailwindcss')],
};
