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

function shouldSkip(obj)
{
	switch (typeof obj)
	{
		case 'function':
		case 'undefined':
		case 'symbol':
			return true;

		default:
			return false;
	}
}

export class Serializer
{
	constructor()
	{
		this.infiniteNumbers =
		this.regexes =
		this.cycles = false;
	}

	serialize(obj)
	{
		return this._serialize(obj, [], '', '', true);
	}

	_serialize(obj, refs, path, indent, firstBlock = false)
	{
		this._isPrimitive = true;

		const type = typeof obj;
		switch (type)
		{
			case 'string':
				return `"${quote(obj)}"`;

			case 'number':
				return Number.isFinite(obj)
					? obj.toString()
					: (this.infiniteNumbers ? `"${obj.toString()}"` : 'null');

			case 'boolean':
				return obj.toString();

			case 'object':
				if (obj === null)
				{
					return 'null';
				}

				if (obj instanceof Date)
				{
					return `"${obj.toISOString()}"`;
				}

				if (this.regexes && (obj instanceof RegExp))
				{
					return `"${quote(obj.toString())}"`;
				}

				for (let i = 0; i < refs.length; i += 2)
				{
					if (refs[i] === obj)
					{
						if (!this.cycles)
						{
							throw new TypeError('Converting circular structure to JSON');
						}

						return this._serialize({ $ref : '#' + refs[i + 1] }, [], '', indent);
					}
				}

				refs.push(obj, path);

				if (Array.isArray(obj))
				{
					const newIndent = this._increaseIndent(indent);
					let tmp = this._startBlock(indent, firstBlock) + '[';

					for (let i = 0, first = true; i < obj.length; ++i)
					{
						const json = this._serialize(obj[i], refs, this.throwOnCycle ? null : `${path}/${i}`, newIndent);

						if (first)
						{
							tmp += this._nextItem(newIndent) + json;
							first = false;
							continue;
						}

						tmp += ',' + this._nextItem(newIndent) + json;
					}

					this._isPrimitive = false;
					return tmp + (this._endBlock(indent, obj.length === 0) + ']');
				}

				if (typeof obj.toJSON === 'function')
				{
					return this._serialize(obj.toJSON(), refs, path, indent);
				}

				{
					const newIndent = this._increaseIndent(indent);
					let tmp = this._startBlock(indent, firstBlock) + '{',
						first = true;

					for (const i in obj)
					{
						const item = obj[i];
						if (shouldSkip(item))
						{
							continue;
						}

						const json = this._serialize(item, refs, this.throwOnCycle ? null : `${path}/${escape(i)}`, newIndent);

						if (first)
						{
							tmp += this._nextItem(newIndent) + `"${quote(i)}"` + this._colon() + json;
							first = false;
							continue;
						}

						tmp += ',' + this._nextItem(newIndent) + `"${quote(i)}"` + this._colon() + json;
					}

					this._isPrimitive = false;
					return tmp + (this._endBlock(indent, first) + '}');
				}

			case 'bigint':
				throw new TypeError('Do not know how to serialize a BigInt');

			default:
				return 'null';
		}
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
}

export class PrettySerializer extends Serializer
{
	constructor()
	{
		super();

		this.__indent = '  ';
		this.lineBreak = '\n';
		this.bracketsOwnLine = false;
		this.spaceBeforeColon = false;
	}

	get indent()
	{
		return /^ {1,10}$/.test(this.__indent)
			? this.__indent.length
			: this.__indent;
	}

	set indent(value)
	{
		switch (typeof value)
		{
			case 'number':
				this.__indent = ' '.repeat(Math.min(10, Math.max(0, value)));
				break;

			case 'string':
				this.__indent = value.slice(0, 10);
				break;
		}
	}

	_startBlock(indent, isFirst)
	{
		if (isFirst)
		{
			return '';
		}

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
		return indent + this.__indent;
	}

	_colon()
	{
		const after = this._isPrimitive || !this.bracketsOwnLine;
		return this.spaceBeforeColon
			? (after ? ' : ' : ' :')
			: (after ? ': ' : ':');
	}
}
