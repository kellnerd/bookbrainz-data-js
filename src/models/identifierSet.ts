/*
 * Copyright (C) 2023  David Kellner
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import Identifier from './identifier';
import {Model} from './common';
import type {RelationMappings} from 'objection';


export default class IdentifierSet extends Model {
	id: number;

	identifiers?: Identifier[];

	static relationMappings: RelationMappings = {
		identifiers: {
			join: {
				from: [this.tableName, 'id'].join('.'),
				through: {
					from: 'bookbrainz.identifier_set__identifier.set_id',
					to: 'bookbrainz.identifier_set__identifier.identifier_id'
				},
				to: [Identifier.tableName, 'id'].join('.')
			},
			modelClass: Identifier,
			relation: this.ManyToManyRelation
		}
	};
}
