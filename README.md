# JSON Serialize
**This module uses the ES modules feature and requires Node v8.15.0+.
Please refer to [Node's documentation](https://nodejs.org/api/esm.html#esm_enabling) to read
more on how to enable this functionality in your environment.**

Provides serialization classes to provide 'pretty' and 'ugly' output with the same interface to allow swapping easily. Also serializes some additional inputs that the regular `JSON.stringify` doesn't:

- serializes `RegExp` objects into strings
- serializes `NaN`, `Infinity` and `-Infinity` into strings
- optionally serializes cyclic references as JSON pointers, see `Serializer.cycles`

If you're only looking for a 'pretty' JSON output please use the [third argument of JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Parameters) instead. It is the standard and also runs a bit faster, see benchmarking below.

## Installation
```
npm i @calmdownval/json-serialize
```

## Interface

- `Serializer.serialize(obj)`  
Serializes the object into a JSON string.

- `Serializer.infiniteNumbers`  
defaults to `false`  
When enabled serializes infinite numbers and NaN into strings.

- `Serializer.regexes`  
defaults to `false`  
When enabled serializes RegExp instances into strings.

- `Serializer.cycles`  
defaults to `false`  
When a circular reference is detected the serializer will either throw an Error
or, in case this option is set to `false`, an absolute JSON pointer to the referenced object.

- `PrettySerializer.indent`  
defaults to 2  
Consistent with the third argument of JSON.stringify: the string to indent with which
can be up to 10 characters long. Longer strings will be sliced. If set to a number
specifies to use that amount of space characters - also clamped to 10.

- `PrettySerializer.lineBreak`  
defaults to line feed (`\n`)  
The sequence to break lines with.

- `PrettySerializer.bracketsOwnLine`  
defaults to `false`  
Whether object & array opening brackets go on separate lines.

- `PrettySerializer.spaceBeforeColon`  
defaults to `false`  
Whether to insert an extra space before colons in objects.

## Example
```js
import { Serializer, PrettySerializer } from '@calmdownval/json-serialize';

const data =
    [
        { abc : 123 }
    ];

new Serializer().serialize(data);
/* returns:
[{"abc":123}]
*/

// create a cycle
data.push(data);

// change behavior with cycles
const json = new PrettySerializer();
json.cylces = true;
json.serialize(data);
/* returns:
[
  {
    "abc": 123
  },
  {
    "$ref": "#"
  }
]
*/
```

## Testing
Make sure to first install dev dependencies.
```
npm test
```

## Benchmarking
Make sure to first install dev dependencies.
```
npm run benchmark
```
Should output something like:
```
JSON.stringify        x 332,154 ops/sec ±0.77% (88 runs sampled)
Serializer            x 321,410 ops/sec ±0.39% (92 runs sampled)
JSON.stringify pretty x 293,668 ops/sec ±0.47% (91 runs sampled)
PrettySerializer      x 281,292 ops/sec ±0.47% (89 runs sampled)
```
