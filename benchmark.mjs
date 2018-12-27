import Benchmark from 'benchmark';
import { Serializer, PrettySerializer } from './';

const obj =
	{
		number : 123,
		string : 'abc',
		date : new Date(),
		regex : /^abc$/,
		other1 : null,
		other2 : undefined,
		other3 : NaN,
		other4 : Infinity,
		other5 : -Infinity,
		array :
		[
			123,
			'abc'
		],
		emptyArray : [],
		object :
		{
			a : 123,
			b : 'abc'
		},
		emptyObject : {}
	};

const
	min = new Serializer(),
	pretty = new PrettySerializer(),
	suite = new Benchmark.Suite;

suite
	.add('JSON.stringify', () =>
	{
		JSON.stringify(obj);
	})
	.add('Serializer', () =>
	{
		min.serialize(obj);
	})
	.add('JSON.stringify pretty', () =>
	{
		JSON.stringify(obj, null, '\t');
	})
	.add('PrettySerializer', () =>
	{
		pretty.serialize(obj);
	})
	.on('cycle', (e) =>
	{
		console.log(String(e.target));
	})
	.on('complete', () =>
	{
		console.log('Fastest is ' + suite.filter('fastest').map('name'));
	})
	.run({ async : true });
