# JSON Serialize
**NOTICE: This module uses the ECMAScript import/export mechanism and requires Node v10+.
Please refer to [Node's documentation](https://nodejs.org/api/esm.html#esm_enabling) to read
more on how to enable this functionality in your environment.**

A module for serialization of any javascript object into JSON string.
The module exports the `Serializer` and `PrettySerializer` classes
sharing a common interface.

- serializes `RegExp` objects as strings
- serializes `NaN`, `Infinity` and `-Infinity` as strings
- allows to finish serialization even with cycles in the object, see `Serializer.throwOnCycle`

## Installation
```
npm install @calmdownval/json-serialize
```

## Interface

### `Serializer.throwOnCycle`
When a circular structure is detected the serializer can either throw an Error
or, in case this option is set to `false` the string `"[cycle]"` will be put
instead of the object.  
defaults to `true`

### `Serializer.serialize(obj)`
Serializes the object and return it as JSON string.

### `PrettySerializer.indent`
the sequence to indent with  
TAB (`\t`) by default, for n-space indentation simply set this string to a string of n spaces

### `PrettySerializer.lineBreak`
the sequence to break lines with  
line feed (`\n`) by default

### `PrettySerializer.bracketsOwnLine`
whether object & array opening brackets go on a separate line  
`false` by default

### `PrettySerializer.spaceBeforeColon`
whether to insert an extra space before colons in objects  
`false` by default

## Example
```js
import { Serializer, PrettySerializer } from '@calmdownval/json-serialize';

class Person
{
    constructor(firstName, lastName)
    {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    get fullName()
    {
        return this.firstName + ' ' + this.lastName;
    }

    toJSON()
    {
        return this.fullName;
    }
}


const people =
    [
        new Person('Alice', 'Z.'),
        new Person('Bob', 'Y.'),
        new Person('John', 'X.')
    ];


new Serializer().serialize(people);
/* returns:
["Alice Z.","Bob Y.","John X."]
*/

// create a cycle
people.push(people);

const inst = new PrettySerializer();
inst.throwOnCycle = false;

inst.serialize(people);
/* returns:
[
    "Alice Z.",
    "Bob Y.",
    "John X.",
    "[cycle]"
]
*/
```

## Benchmarking
```
npm install
npm run benchmark
```
