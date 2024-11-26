export const getPaginationRange = (totalItems: number) => {
    const range = [];
    for (let i = 0; i < totalItems; i++) {
        range.push(i); // Display index starting from 1
    }
    return range;
};
