/*
 * Copyright (C) 2015-2017  Ben Ockmore
 *                    2015  Sean Burke
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

import type {Model} from './models/common';
import _ from 'lodash';
import {diff} from 'deep-diff';


export function snakeToCamel(attrs) {
	return _.reduce(attrs, (result, val, key) => {
		let newKey;

		if (key.indexOf('_') === 0) {
			newKey = `_${_.camelCase(key.substr(1))}`;
		}
		else {
			newKey = _.camelCase(key);
		}

		result[newKey] = val;
		return result;
	},
	{});
}

export function snakeToCamelID(attrs) {
	return _.reduce(attrs, (result, val, key) => {
		let newKey;

		if (key.indexOf('_') === 0) {
			newKey = `_${_.camelCase(key.substr(1))}`;
		}
		else {
			newKey = _.camelCase(key);
		}

		if (newKey !== 'bbid' && newKey !== 'id') {
			newKey = newKey.replace('Bbid', 'BBID').replace('Id', 'ID');
		}

		result[newKey] = val;
		return result;
	},
	{});
}

export function camelToSnake(attrs) {
	return _.reduce(attrs, (result, val, key) => {
		let newKey;

		if (key.indexOf('_') === 0) {
			newKey = `_${_.snakeCase(key.substr(1))}`;
		}
		else {
			newKey = _.snakeCase(key);
		}

		result[newKey] = val;
		return result;
	},
	{});
}

export class EntityTypeError extends Error {
	constructor(message) {
		super(message);
		this.name = 'EntityTypeError';
		this.message = message;
		this.stack = new Error().stack;
	}
}

export function validateEntityType(model) {
	if (model.get('_type') !== model.typeId) {
		throw new Error(
			`Entity ${model.get('bbid')} is not a ${model.typeId}`
		);
	}
}

export async function truncateTablesOf(...models: Array<typeof Model>) {
	for (const model of models) {
		// eslint-disable-next-line no-await-in-loop
		await model.knex().raw('TRUNCATE ?? CASCADE', model.tableName);
	}
}

export async function truncateTables(Bookshelf, tables) {
	for (const table of tables) {
		// eslint-disable-next-line no-await-in-loop
		await Bookshelf.knex.raw(`TRUNCATE ${table} CASCADE`);
	}
}

export function diffRevisions(base, other, includes) {
	function diffFilter(path, key) {
		if (_.isString(key)) {
			return key.startsWith('_pivot');
		}

		return false;
	}

	function sortEntityData(data) {
		const aliasesPresent =
			data.aliasSet && _.isArray(data.aliasSet.aliases);
		if (aliasesPresent) {
			data.aliasSet.aliases = _.sortBy(data.aliasSet.aliases, 'id');
		}

		const identifiersPresent =
			data.identifierSet && _.isArray(data.identifierSet.identifiers);
		if (identifiersPresent) {
			data.identifierSet.identifiers = _.sortBy(
				data.identifierSet.identifiers, ['value', 'type.label']
			);
		}

		const relationshipsPresent = data.relationshipSet &&
			_.isArray(data.relationshipSet.relationships);
		if (relationshipsPresent) {
			data.relationshipSet.relationships = _.sortBy(
				data.relationshipSet.relationships, 'id'
			);
		}

		return data;
	}

	const baseDataPromise = base.related('data').fetch({require: false, withRelated: includes});

	if (!other) {
		return baseDataPromise.then(
			(baseData) => diff(
				{},
				baseData ? sortEntityData(baseData.toJSON()) : {},
				diffFilter
			)
		);
	}

	const otherDataPromise =
		other.related('data').fetch({require: false, withRelated: includes});

	return Promise.all([baseDataPromise, otherDataPromise])
		.then(([baseData, otherData]) => diff(
			otherData ? sortEntityData(otherData.toJSON()) : {},
			baseData ? sortEntityData(baseData.toJSON()) : {},
			diffFilter
		));
}

const YEAR_STR_LENGTH = 6;
const MONTH_STR_LENGTH = 2;
const DAY_STR_LENGTH = 2;

/**
 * Produce an ISO 8601-2004 formatted string for a date.
 * @param {number} year - A calendar year.
 * @param {number} [month] - A calendar month.
 * @param {number} [day] - A calendar day of month.
 * @returns {string} The provided date formatted as an ISO 8601-2004 year or calendar
 *                   date.
 */
export function formatDate(year, month, day) {
	if ((!year || isNaN(parseInt(year, 10))) && year !== 0) {
		return null;
	}
	const isCommonEraDate = Math.sign(year) === 1 || Math.sign(year) === 0;
	// eslint-disable-next-line max-len
	const yearString = `${isCommonEraDate ? '+' : '-'}${_.padStart(Math.abs(year).toString(), YEAR_STR_LENGTH, '0')}`;

	if (!month || isNaN(parseInt(month, 10))) {
		return `${yearString}`;
	}

	const monthString = _.padStart(month.toString(), MONTH_STR_LENGTH, '0');

	if (!day || isNaN(parseInt(day, 10))) {
		return `${yearString}-${monthString}`;
	}

	const dayString = _.padStart(day.toString(), DAY_STR_LENGTH, '0');

	return `${yearString}-${monthString}-${dayString}`;
}

/**
 * Split ISO 8601 calendar dates or years into a numerical array.
 * @param {string} date - A date of the format 'YYYY', 'YYYY-MM', or
 *                        'YYYY-MM-DD'.
 * @returns {number[]} Year, month, and day of month respectively.
 */
export function parseDate(date) {
	if (!date) {
		return [null, null, null];
	}

	const parts = date.toString().split('-');
	// A leading minus sign denotes a BC date
	// This creates an empty part that needs to be removed,
	// and requires us to add the negative sign back for the year
	// We ensure parts[0] is a number and not for example an empty string
	if (parts[0] === '') {
		parts.shift();
		parts[0] = -parseInt(parts[0], 10);
	}
	// Incorrect format
	if (parts.length < 1 || parts.length > 3) {
		return [null, null, null];
	}

	let padding = [];
	if (parts.length === 1) {
		padding = [null, null];
	}
	else if (parts.length === 2) {
		padding = [null];
	}

	return parts.map((part) => {
		const parsed = parseInt(part, 10);
		return isNaN(parsed) ? null : parsed;
	}).concat(padding);
}

/**
 * Create a new Edition Group for an Edition.
 * The Edition Group will be part of the same revision, and will have the same
 * alias set and author credit for that revision
 * Subsequent changes to the alias set or author credit for either entity will
 * only impact that entity's new revision.
 * @param {object} orm - The Bookshelf ORM
 * @param {object} transacting - The Bookshelf/Knex SQL transaction in progress
 * @param {number|string} aliasSetId - The id of the new edition's alias set
 * @param {number|string} revisionId - The id of the new edition's revision
 * @param {number|string} authorCreditId - The id of the new edition's author credit
 * @returns {string} BBID of the newly created Edition Group
 */
export async function createEditionGroupForNewEdition(orm, transacting, aliasSetId, revisionId, authorCreditId) {
	const Entity = orm.model('Entity');
	const EditionGroup = orm.model('EditionGroup');
	const newEditionGroupEntity = await new Entity({type: 'EditionGroup'})
		.save(null, {method: 'insert', transacting});
	const bbid = newEditionGroupEntity.get('bbid');
	await new EditionGroup({
		aliasSetId,
		authorCreditId,
		bbid,
		revisionId
	})
		.save(null, {method: 'insert', transacting});
	return bbid;
}

/**
 * Replacement for Bluebird's Promise.props
 * @param {Object} promiseObj - an object containing string keys and promises
 *                              to be resolved as the values
 * @returns {Object} an object containing the same keys, but resolved promises
 */
export async function promiseProps(promiseObj) {
	const resolvedKeyValuePairs = await Promise.all(
		Object.entries(promiseObj).map(
			([key, val]) => Promise.resolve(val).then((x) => [key, x])
		)
	);
	return Object.fromEntries(resolvedKeyValuePairs);
}
