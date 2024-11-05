
export function formatOpacity(value: number): number {
    return value > 1
        ? 1
        : 0 > value
            ? 0
            : value;
}
