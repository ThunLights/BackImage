
export function filename2ext(filename: string): string | null {
    return filename.split(".").pop() ?? null;
}
