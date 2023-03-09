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

import {Model as ObjectionModel, snakeCaseMappers} from 'objection';
import {snakeCase} from 'lodash';

/**
 * Base model that implements functionality which is common to all BookBrainz models.
 */
export class Model extends ObjectionModel {
	static get columnNameMappers() {
		return snakeCaseMappers();
	}

	/** Name of the database table equals the name of the model class in snake case by default. */
	static get tableName() {
		return ['bookbrainz', snakeCase(this.name)].join('.');
	}
}
