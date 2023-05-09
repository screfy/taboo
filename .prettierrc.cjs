/** @type {import('prettier').Options} */
module.exports = {
	singleQuote: true,
	plugins: [
		require.resolve('@plasmohq/prettier-plugin-sort-imports'),
		require.resolve('prettier-plugin-tailwindcss'),
	],
	importOrder: ['^@plasmohq/(.*)$', '^~(.*)$', '^[./]'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
};
