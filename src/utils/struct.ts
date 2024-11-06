import { z } from "zod";

export const BackgroundImgZod = z.object({
    fullscreen: z.string().nullable(),
    panel: z.string().nullable(),
    sideBar: z.string().nullable(),
    editor: z.string().nullable(),
});

export const ElementsOpacityZod = z.object({
    fullscreen: z.number(),
    panel: z.number(),
    sideBar: z.number(),
    editor: z.number(),
});

function structCheckerCore<T extends z.ZodRawShape, K extends z.infer<z.ZodObject<T>>>(obj: unknown, zodSchema: z.ZodObject<T>): obj is K {
	try {
		zodSchema.parse(obj);
		return true;
	} catch {
		return false;
	}
}

export function structChecker<T extends z.ZodRawShape>(obj: unknown, zodSchema: z.ZodObject<T>) {
	if (typeof obj === "object" && structCheckerCore(obj, zodSchema)) {
		const newobj: z.infer<typeof zodSchema> = obj;
		return newobj;
	} else {
		return null;
	}
}
