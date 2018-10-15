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
	serialize(obj)
	{
		if (obj && typeof obj == 'object')
		{
			var i, tmp, first = true;

			if (Array.isArray(obj))
			{
				tmp = '[';

				if (obj.length != 0)
				{
					tmp += this.serialize(obj[0]);
				}

				for (i = 1; i < obj.length; ++i)
				{
					tmp += ',' + this.serialize(obj[i]);
				}

				return tmp + ']';
			}

			if (obj instanceof Date)
			{
				return '"' + obj.toISOString() + '"';
			}

			if (obj instanceof RegExp)
			{
				return '"' + quote(obj.toString()) + '"';
			}

			if (typeof obj.toJSON == 'function')
			{
				return this.serialize(obj.toJSON());
			}

			tmp = '{';
			for (i in obj)
			{
				if (first)
				{
					tmp += '"' + quote(i) + '":' + this.serialize(obj[i]);
					first = false;
					continue;
				}

				tmp += ',"' + quote(i) + '":' + this.serialize(obj[i]);
			}

			return tmp + '}';
		}

		return JSON.stringify(obj);
	}
}

export class PrettySerializer
{
	constructor()
	{
		this.indent = '\t';
		this.lineBreak = '\n';
		this.bracketsOwnLine = false;
		this.spaceBeforeColon = false;
	}

	serialize(obj, indent = '')
	{
		if (obj && typeof obj == 'object')
		{
			var i, tmp, newIndent, first = true;

			if (Array.isArray(obj))
			{
				tmp = this.bracketsOwnLine ? this.lineBreak + indent + '[' : '[';
				newIndent = indent + this.indent;

				if (obj.length != 0)
				{
					tmp += this.lineBreak + newIndent + this.serialize(obj[0], newIndent);
				}

				for (i = 1; i < obj.length; ++i)
				{
					tmp += ',' + this.lineBreak + newIndent + this.serialize(obj[i], newIndent);
				}

				return tmp + (obj.length == 0 ? ']' : this.lineBreak + indent + ']');
			}

			if (obj instanceof Date)
			{
				return '"' + obj.toISOString() + '"';
			}

			if (obj instanceof RegExp)
			{
				return '"' + quote(obj.toString()) + '"';
			}

			if (typeof obj.toJSON == 'function')
			{
				return this.serialize(
					obj.toJSON(),
					indent);
			}

			tmp = this.bracketsOwnLine ? this.lineBreak + indent + '{' : '{';
			newIndent = indent + this.indent;

			for (i in obj)
			{
				if (first)
				{
					tmp += this.lineBreak + newIndent + '"' + quote(i) + (this.spaceBeforeColon ? '" : ' : '": ') + this.serialize(obj[i], newIndent);
					first = false;
					continue;
				}

				tmp += ',' + this.lineBreak + newIndent + '"' + quote(i) + (this.spaceBeforeColon ? '" : ' : '": ') + this.serialize(obj[i], newIndent);
			}

			return tmp + (first ? '}' : this.lineBreak + indent + '}');
		}

		return JSON.stringify(obj);
	}
}
