/*
 * Copyright (C) 2015  Ben Ockmore
 *               2023  David Kellner
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

import Identifier from '../../lib/models/identifier';
import IdentifierType from '../../lib/models/identifierType';
import {Model} from '../../lib/models/common';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import knex from 'knex';
import {truncateTablesOf} from '../../lib/util';


chai.use(chaiAsPromised);
const {expect} = chai;


const db = knex({
	client: 'pg',
	connection: {
		database: 'bookbrainz_test',
		host: '127.0.0.1',
		user: 'bookbrainz'
	}
});

Model.knex(db);


describe('Identifier model', () => {
	beforeEach(
		() => IdentifierType.query().insert({
			description: 'description',
			detectionRegex: 'detection',
			displayTemplate: 'display',
			entityType: 'Author',
			id: 1,
			label: 'test_type',
			validationRegex: 'validation'
		})
	);

	afterEach(
		() => truncateTablesOf(Identifier, IdentifierType)
	);

	it('should return a JSON object with correct keys when saved', () => {
		const jsonPromise = Identifier.query()
			.insertAndFetch({
				id: 1,
				typeId: 1,
				value: 'Bob'
			})
			.withGraphFetched('type')
			.then((model) => model.toJSON());

		return expect(jsonPromise).to.eventually.have.all.keys([
			'id', 'typeId', 'type', 'value'
		]);
	});
});
