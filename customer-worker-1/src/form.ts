// The base structure for every form field
type Field<T> = {
	__type: T; // This is a "phantom type" used only for inference
	label?: string;
	options?: string[];
};

export const form = {
	text: (): Field<string> => ({ __type: "" as string }),

	multiselect: <T extends string>(options: T[]): Field<T[]> => ({
		__type: [] as T[],
		options,
	}),
};

type InferInput<T> = {
	[K in keyof T]: T[K] extends Field<infer U> ? U : never;
};

interface FormConfig<T> {
	input: T;
	execute: (ctx: InferInput<T>) => Promise<void> | void;
}

export function createForm<T extends Record<string, Field<any>>>(
	config: FormConfig<T>,
) {
	return config;
}

const myForm = createForm({
	input: {
		name: form.text(),
		interests: form.multiselect(["coding", "design", "music"]),
	},
	execute: async (ctx) => {
		// ctx.name is inferred as string
		// ctx.interests is inferred as ("coding" | "design" | "music")[]
		console.log(`Hello ${ctx.name}, you like ${ctx.interests.length} things.`);
	},
});
