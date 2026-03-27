import AbstractService from "./abstract.service";

export interface ExtensionActivityType {
	id: number
	name: string
	description?: string
}

export interface ExtensionActivityTypeWithTotal {
	rows: {
		id: number
		name: string
		description?: string
	}[],
	count: number
}


export interface UpsertExtensionActivityType {
	name: string
	description?: string
}


class ExtensionActivityTypeService extends AbstractService {
	constructor() {
		super("/extension-activity-type", true);
	}

	async findAll(args?: {
		limit: number,
		offset: number
	}): Promise<ExtensionActivityTypeWithTotal> {
		const params = args ? `?limit=${args.limit}&offset=${args.offset}` : ''

		return await this.api.get(this.basePath + params);
	}

	async findOne(id: number): Promise<ExtensionActivityType> {
		return await this.api.get(this.basePath + `/${id}`);
	}

	async create(createExtensionActivityType: UpsertExtensionActivityType): Promise<string> {
		return await this.api.post(this.basePath, createExtensionActivityType)
	}

	async update(id: number, updateExtensionActivityType: UpsertExtensionActivityType): Promise<string> {
		return await this.api.patch(this.basePath + `/${id}`, updateExtensionActivityType)
	}

	async remove(id: number): Promise<string> {
		return await this.api.delete(this.basePath + `/${id}`)
	}
}

export const extensionActivityTypeService = new ExtensionActivityTypeService()
