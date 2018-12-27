/* eslint-env node, mocha */
import * as assert from 'assert';
import { PrettySerializer } from '../index.mjs';

const INVALID = 'does not serialize into the expected output';

describe('PrettySerializer', () =>
{
	const obj =
	{
		emptyArray : [],
		array : [ 1, 2, [], [ 3 ] ],
		emptyObject : {},
		object :
		{
			a : 1,
			b : 2,
			nestedEmpty : {},
			nested :
			{
				c : 3
			}
		}
	};

	it('should return pretty output', () =>
	{
		const json = new PrettySerializer();

		assert.equal(
			json.serialize(obj),
			JSON.stringify(obj, null, 2),
			INVALID);
	});

	it('should react to format settings', () =>
	{
		const json = new PrettySerializer();

		json.indent = 4;
		json.lineBreak = '\r\n';
		json.bracketsOwnLine =
		json.spaceBeforeColon = true;

		assert.equal(
			json.serialize({ a : [ 1 ] }),
			'{\r\n    "a" :\r\n    [\r\n        1\r\n    ]\r\n}',
			INVALID);
	});
});
