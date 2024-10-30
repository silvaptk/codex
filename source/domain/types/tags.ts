export interface NewTagDTO {
	name: string;
	content?: string;
}

export interface Tag extends NewTagDTO {
	id: number;
}

export interface TagReport extends Tag {
	entries: number;
	hours: number;
}
