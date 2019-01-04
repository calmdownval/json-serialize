/* eslint-env node, mocha */
import * as assert from 'assert';
import { Serializer } from '../index.mjs';

const INVALID = 'does not serialize into the expected output';

describe('Serializer', () =>
{
	const
		standard =
		{
			number : 123,
			string : 'abc',
			symbol : Symbol.iterator,
			date : new Date(),
			null : null,
			undef : undefined,
			array : [ 1, 2, 3 ],
			object : { a : 1, b : 2, c : 3 },
			fn() {}
		},
		infiniteNumbers =
		{
			nan : NaN,
			pinf : Infinity,
			ninf : -Infinity
		},
		regex =
		{
			regex : /^abc/i,
		},
		bigint =
		{
			bigint : 123n
		},
		circular =
		{
			bob : { friends : [] },
			max : { friends : [] }
		},
		tmp = { abc : 123 },
		nonCircular =
		[
			tmp,
			tmp
		];

	circular.bob.friends.push(circular.max);
	circular.max.friends.push(circular.bob);

	it('should match JSON.stringify output with default settings', () =>
	{
		const
			json = new Serializer(),
			all = { ...standard, ...infiniteNumbers, ...regex };

		assert.equal(
			json.serialize(all),
			JSON.stringify(all),
			INVALID);
	});

	it('should serialize infinite numbers when enabled', () =>
	{
		const json = new Serializer();
		json.infiniteNumbers = true;

		assert.equal(
			json.serialize(infiniteNumbers),
			'{"nan":"NaN","pinf":"Infinity","ninf":"-Infinity"}',
			INVALID);
	});

	it('should serialize RegExp instances when enabled', () =>
	{
		const json = new Serializer();
		json.regexes = true;

		assert.equal(
			json.serialize(regex),
			'{"regex":"/^abc/i"}',
			INVALID);
	});

	it('should throw when trying to serialize bigints', () =>
	{
		const json = new Serializer();
		try
		{
			json.serialize(bigint);
			assert.fail('no error was thrown');
		}
		catch (e)
		{
			// ok!
		}
	});

	it('should not throw false positives for circular refs', () =>
	{
		const json = new Serializer();
		try
		{
			json.serialize(nonCircular);
		}
		catch (e)
		{
			assert.fail('a false-positive error was thrown');
		}
	});

	it('should throw when circular refs are detected', () =>
	{
		const json = new Serializer();
		try
		{
			json.serialize(circular);
			assert.fail('no error was thrown');
		}
		catch (e)
		{
			// ok!
		}
	});

	it('should serialize circular refs as JSON pointers when enabled', () =>
	{
		const json = new Serializer();
		json.circulars = true;

		try
		{
			assert.equal(
				json.serialize(circular),
				'{"bob":{"friends":[{"friends":[{"$ref":"#/bob"}]}]},"max":{"$ref":"#/bob/friends/0"}}',
				INVALID);
		}
		catch (e)
		{
			assert.fail('an error was thrown: ' + e.message);
		}
	});
});
