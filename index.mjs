function quote(str)
{
	var anchor = 0,
		index = 0,
		length = str.length,
		c,
		tmp = '';

	while (index < length)
	{
		c = str[index];
		if (c == '"' || c == '\\')
		{
			if (anchor != index)
			{
				tmp += str.slice(anchor, index);
			}
			tmp += '\\' + c;
			anchor = index + 1;
		}

		++index;
	}

	if (anchor != index)
	{
		tmp += str.slice(anchor, index);
	}

	return tmp;
}

export class Serializer
{
	constructor()
	{
		this.throwOnCycle = true;
	}

	_startBlock()
	{
		return '';
	}

	_nextItem()
	{
		return '';
	}

	_endBlock()
	{
		return '';
	}

	_increaseIndent()
	{
		return '';
	}

	_colon()
	{
		return ':';
	}

	_serialize(obj, list, indent)
	{
		if (list.indexOf(obj) != -1)
		{
			if (this.throwOnCycle)
			{
				throw new Error('invalid circular structure to serialize as JSON');
			}
			return '"[cycle]"';
		}

		if (obj && typeof obj == 'object')
		{
			var i,
				tmp,
				first = true,
				newIndent,
				colon;

			if (obj instanceof Date)
			{
				return '"' + obj.toISOString() + '"';
			}

			if (obj instanceof RegExp)
			{
				return '"' + quote(obj.toString()) + '"';
			}

			// don't iterate the same object twice
			list.push(obj);

			if (Array.isArray(obj))
			{
				tmp = this._startBlock(indent) + '[';
				newIndent = this._increaseIndent(indent);

				if (obj.length != 0)
				{
					tmp += this._nextItem(newIndent) + this._serialize(obj[0], list, newIndent);
				}

				for (i = 1; i < obj.length; ++i)
				{
					tmp += ',' + this._nextItem(newIndent) + this._serialize(obj[i], list, newIndent);
				}

				return tmp + (this._endBlock(indent, obj.length == 0) + ']');
			}

			if (typeof obj.toJSON == 'function')
			{
				return this._serialize(obj.toJSON(), list, indent);
			}

			tmp = this._startBlock(indent) + '{';
			newIndent = this._increaseIndent(indent);
			colon = '"' + this._colon();

			for (i in obj)
			{
				if (first)
				{
					tmp += this._nextItem(newIndent) + '"' + quote(i) + colon + this._serialize(obj[i], list, newIndent);
					first = false;
					continue;
				}

				tmp += ',' + this._nextItem(newIndent) + '"' + quote(i) + colon + this._serialize(obj[i], list, newIndent);
			}

			return tmp + (this._endBlock(indent, first) + '}');
		}

		// convert special numbers into strings
		if (typeof obj == 'number' && !Number.isFinite(obj))
		{
			return `"${obj.toString()}"`;
		}

		// use the builtin for primitives
		return JSON.stringify(obj);
	}

	serialize(obj)
	{
		const list = [];
		return this._serialize(obj, list, '');
	}
}

export class PrettySerializer extends Serializer
{
	constructor()
	{
		super();

		this.indent = '\t';
		this.lineBreak = '\n';
		this.bracketsOwnLine = false;
		this.spaceBeforeColon = false;
	}

	_startBlock(indent)
	{
		return this.bracketsOwnLine
			? this.lineBreak + indent
			: '';
	}

	_nextItem(indent)
	{
		return this.lineBreak + indent;
	}

	_endBlock(indent, empty)
	{
		return this.bracketsOwnLine || !empty
			? this.lineBreak + indent
			: '';
	}

	_increaseIndent(indent)
	{
		return indent + this.indent;
	}

	_colon()
	{
		return this.spaceBeforeColon ? ' : ' : ': ';
	}
}
