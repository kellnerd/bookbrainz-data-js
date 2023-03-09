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

import IdentifierSet from './identifierSet';
import IdentifierType from './identifierType';
import {Model} from './common';
import type {RelationMappings} from 'objection';


export default class Identifier extends Model {
	id: number;

	typeId: number;

	value: string;

	type?: IdentifierType;

	sets?: IdentifierSet[];

	static get relationMappings(): RelationMappings {
		return {
			sets: {
				join: {
					from: this.column('id'),
					through: {
						from: 'bookbrainz.identifier_set__identifier.identifier_id',
						to: 'bookbrainz.identifier_set__identifier.set_id'
					},
					to: IdentifierSet.column('id')
				},
				modelClass: IdentifierSet,
				relation: this.ManyToManyRelation
			},
			type: {
				join: {
					from: this.column('type_id'),
					to: IdentifierType.column('id')
				},
				modelClass: IdentifierType,
				relation: this.BelongsToOneRelation
			}
		};
	}
}
