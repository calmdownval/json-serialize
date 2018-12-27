/* This is a test runner to support Node's native ES modules
 * with Mocha while they're still in experimental state.
 *
 * See this link for more info:
 * https://github.com/mochajs/mocha/issues/3006
 */

const { sync : globSync } = require('glob');

(async () =>
{
	const matches = globSync('./test/**/*.spec.mjs');
	for (const match of matches)
	{
		await import(match);
	}
	run();
})();
