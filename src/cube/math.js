export function matrixMult(m1, m2) {
    // m1 and m2 is 4x4 matrix
    var m3 = [];
    var currElm = 0;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            currElm = 0;
            for (var k = 0; k < 4; k++) {
                currElm += m1[4 * i + k] * m2[4 * k + j];
            }
            m3.push(currElm);
        }
    }
    return m3;
}

export const translationMatrix = (x, y) => {
    return [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};

export const scaleMatrix = (x, y, z) => {
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ];
};