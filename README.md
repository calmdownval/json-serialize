# JSON Serialize
A module for serialization of any javascript object into JSON string.
The module exports the `Serializer` and `PrettySerializer` classes both
sharing the same interface. Additionally `RegExp` objects are serialized
as strings.

## Installation
```
npm install @calmdownval/json-serialize
```

## Interface
After an instance of a serializer is created it can serialize objects using
the `.serialize(obj)` method. The result is returned as a string.

## PrettySerializer options
The `PrettySerializer` class exposes the following properties:
```js
// the sequence to indent with
// TAB by default, use strings such as '    ' for multi-space indentation
indent = '\t';

// the sequence to break lines with
// line feed by default
lineBreak = '\n';

// whether object & array opening brackets go on a separate line
// false by default
bracketsOwnLine = false;

// whether to insert an extra space before colons in objects
// false by default
spaceBeforeColon = false;
```

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


new PrettySerializer().serialize(people);
/* returns:
[
    "Alice Z.",
    "Bob Y.",
    "John X."
]
*/
```
