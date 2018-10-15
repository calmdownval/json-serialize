import { Serializer, PrettySerializer } from '../index.mjs';

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

console.log(
	new Serializer().serialize(obj));

console.log(
	new PrettySerializer().serialize(obj));
