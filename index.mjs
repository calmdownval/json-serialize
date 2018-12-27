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
		if (c === '"' || c === '\\')
		{
			if (anchor !== index)
			{
				tmp += str.slice(anchor, index);
			}
			tmp += '\\' + c;
			anchor = index + 1;
		}

		++index;
	}

	if (anchor !== index)
	{
		tmp += str.slice(anchor, index);
	}

	return tmp;
}

function escape(str)
{
	var anchor = 0,
		index = 0,
		length = str.length,
		c,
		tmp = '';

	while (index < length)
	{
		c = str[index];
		if (c === '~' || c === '/')
		{
			if (anchor !== index)
			{
				tmp += str.slice(anchor, index);
			}
			tmp += c === '~' ? '~0' : '~1';
			anchor = index + 1;
		}

		++index;
	}

	if (anchor !== index)
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

	_serialize(obj, refs, indent, path)
	{
		var i,
			tmp,
			json,
			first = true,
			newIndent,
			colon;

		if (obj && typeof obj === 'object')
		{
			if (obj instanceof Date)
			{
				return `"${obj.toISOString()}"`;
			}

			if (obj instanceof RegExp)
			{
				return `"${quote(obj.toString())}"`;
			}

			for (i = 0; i < refs.length; i += 2)
			{
				if (refs[i] === obj)
				{
					if (this.throwOnCycle)
					{
						throw new Error('invalid circular structure to serialize as JSON');
					}

					return this._serialize({ $ref : refs[i + 1] }, [], indent, '');
				}
			}

			// don't iterate the same object twice
			refs.push(obj, path);

			if (Array.isArray(obj))
			{
				tmp = this._startBlock(indent) + '[';
				newIndent = this._increaseIndent(indent);

				for (i = 0; i < obj.length; ++i)
				{
					json = this._serialize(obj[i], refs, newIndent, this.throwOnCycle ? null : `${path}/${i}`);

					if (first)
					{
						tmp += this._nextItem(newIndent) + json;
						first = false;
						continue;
					}

					tmp += ',' + this._nextItem(newIndent) + json;
				}

				return tmp + (this._endBlock(indent, obj.length === 0) + ']');
			}

			if (typeof obj.toJSON === 'function')
			{
				return this._serialize(obj.toJSON(), refs, indent, path);
			}

			tmp = this._startBlock(indent) + '{';
			newIndent = this._increaseIndent(indent);
			colon = '"' + this._colon();

			for (i in obj)
			{
				json = this._serialize(obj[i], refs, newIndent, this.throwOnCycle ? null : `${path}/${escape(i)}`);

				if (first)
				{
					tmp += this._nextItem(newIndent) + '"' + quote(i) + colon + json;
					first = false;
					continue;
				}

				tmp += ',' + this._nextItem(newIndent) + '"' + quote(i) + colon + json;
			}

			return tmp + (this._endBlock(indent, first) + '}');
		}

		// convert special numbers into strings
		if (typeof obj === 'number' && !Number.isFinite(obj))
		{
			return `"${obj.toString()}"`;
		}

		// use the builtin for primitives
		return JSON.stringify(obj);
	}

	serialize(obj)
	{
		const refs = [];
		return this._serialize(obj, refs, '', '#');
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
