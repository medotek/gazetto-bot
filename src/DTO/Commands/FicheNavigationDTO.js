/**
 * @param data
 * @param current
 * @returns {{nextEl: {data: *, key: number}, prevEl: {data: *, key: number}}}
 */
export function getNextAndPrevFichesFromTheCurrentOne(data, current) {
    let nextKey, prevKey;
    if (current) {
        if (Object.keys(data).length - 1 > current + 1) {
            nextKey = current + 1
        } else if (Object.keys(data).length - 1 === current) {
            nextKey = 0
        } else {
            nextKey = current + 1
        }
        prevKey = current - 1;
    } else {
        // Last key
        prevKey = Object.keys(data).length - 1
        nextKey = current + 1;
    }

    return {
        prevEl: {key: prevKey, data: data[prevKey]},
        nextEl: {key: nextKey, data: data[nextKey]}
    }
}
