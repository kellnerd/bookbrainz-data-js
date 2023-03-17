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

import {Model} from 'objection';
import knex from 'knex';


export function mochaGlobalSetup() {
	// setup knex database connection
	const db = knex({
		client: 'pg',
		connection: {
			database: 'bookbrainz_test',
			host: process.env.POSTGRES_HOST ?? '127.0.0.1',
			password: process.env.POSTGRES_PASSWORD ?? '',
			user: process.env.POSTGRES_USER ?? 'bookbrainz'
		}
	});

	// assign knex instance to all Objection models
	Model.knex(db);
}
