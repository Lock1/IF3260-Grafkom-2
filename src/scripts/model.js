export function getCube() {
    var model = {
        vertices : [
            1.000000 , 1.000000  , -1.000000,
            1.000000 , -1.000000 ,  -1.000000,
            1.000000 , 1.000000  ,  1.000000,
            1.000000 , -1.000000 ,  1.000000,
            -1.000000,  1.000000 ,  -1.000000,
            -1.000000,  -1.000000,  -1.000000,
            -1.000000,  1.000000 , 1.000000,
            -1.000000,  -1.000000,  1.000000,
        ],
        indices  : [

        ],
        numPoints: 36
    }
    function ind(idx1, idx2, idx3, idx4) {
        // Forming quadrilateral
        model.indices.push(idx1); model.indices.push(idx2); model.indices.push(idx3);
        model.indices.push(idx3); model.indices.push(idx4); model.indices.push(idx1);
    }

    ind(0, 4, 6, 2);
    ind(3, 2, 6, 7);
    ind(7, 6, 4, 5);
    ind(5, 1, 3, 7);
    ind(1, 0, 2, 3);
    ind(5, 4, 0, 1);

    return model;
}

export function getHollowCube() {
    // Helper
    function concatQuadIndices(idx1, idx2, idx3, idx4) {
        // Forming quadrilateral
        indices.push(idx1); indices.push(idx2); indices.push(idx3);
        indices.push(idx3); indices.push(idx4); indices.push(idx1);
        numPoints += 6;
    }

    var vertices  = [];
    var indices   = [];
    var numPoints = 0;

    // Create 8 small cubes to create the hollow cube
    var width = 0.125;
    var P_OUTER = 0.5; // positive in outer section
    var N_OUTER = -0.5; // negative in outer section
    var P_INNER = 0.5 - width;
    var N_INNER = -0.5 + width;

    // Generate vertex
    for (var i = 0; i < 64; i++) {
        var currentVertex = [];
        for (var j = 0; j < 3; j++) {
            var code = Math.floor(i / Math.pow(2, 2 * j)) % 4;
            switch (code) {
                case 0:
                    currentVertex.push(P_OUTER);
                    break;
                case 1:
                    currentVertex.push(P_INNER);
                    break;
                case 2:
                    currentVertex.push(N_OUTER);
                    break;
                case 3:
                    currentVertex.push(N_INNER);
                    break;
            }
        }
        vertices = vertices.concat(currentVertex);
    }

    // Outer surfaces
    concatQuadIndices(0, 1, 5, 4); concatQuadIndices(1, 3, 7, 5);
    concatQuadIndices(2, 6, 7, 3); concatQuadIndices(6, 14, 15, 7);
    concatQuadIndices(10, 11, 15, 14); concatQuadIndices(9, 13, 15, 11);
    concatQuadIndices(8, 12, 13, 9); concatQuadIndices(4, 5, 13, 12);

    concatQuadIndices(0, 4, 20, 16); concatQuadIndices(4, 12, 28, 20);
    concatQuadIndices(8, 24, 28, 12); concatQuadIndices(24, 56, 60, 28);
    concatQuadIndices(40, 44, 60, 56); concatQuadIndices(36, 52, 60, 44);
    concatQuadIndices(32, 48, 52, 36); concatQuadIndices(16, 20, 52, 48);

    concatQuadIndices(0, 16, 17, 1); concatQuadIndices(16, 48, 49, 17);
    concatQuadIndices(32, 33, 49, 48); concatQuadIndices(33, 35, 51, 49);
    concatQuadIndices(34, 50, 51, 35); concatQuadIndices(18, 19, 51, 50);
    concatQuadIndices(2, 3, 19, 18); concatQuadIndices(1, 17, 19, 3);

    concatQuadIndices(2, 18, 22, 6); concatQuadIndices(18, 50, 54, 22);
    concatQuadIndices(34, 38, 54, 50); concatQuadIndices(38, 46, 62, 54);
    concatQuadIndices(42, 58, 62, 46); concatQuadIndices(26, 30, 62, 58);
    concatQuadIndices(10, 14, 30, 26); concatQuadIndices(6, 22, 30, 14);

    concatQuadIndices(8, 9, 25, 24); concatQuadIndices(9, 11, 27, 25);
    concatQuadIndices(10, 26, 27, 11); concatQuadIndices(26, 58, 59, 27);
    concatQuadIndices(42, 43, 59, 58); concatQuadIndices(41, 57, 59, 43);
    concatQuadIndices(40, 56, 57, 41); concatQuadIndices(24, 25, 57, 56);

    concatQuadIndices(32, 36, 37, 33); concatQuadIndices(36, 44, 45, 37);
    concatQuadIndices(40, 41, 45, 44); concatQuadIndices(41, 43, 47, 45);
    concatQuadIndices(42, 46, 47, 43); concatQuadIndices(38, 39, 47, 46);
    concatQuadIndices(34, 35, 39, 38); concatQuadIndices(33, 37, 39, 35);


    // Inner surfaces
    concatQuadIndices(5, 7, 23, 21); concatQuadIndices(7, 15, 31, 23);
    concatQuadIndices(13, 29, 31, 15); concatQuadIndices(5, 21, 29, 13);

    concatQuadIndices(20, 28, 29, 21); concatQuadIndices(28, 60, 61, 29);
    concatQuadIndices(52, 53, 61, 60); concatQuadIndices(20, 21, 53, 52);

    concatQuadIndices(17, 49, 53, 21); concatQuadIndices(49, 51, 55, 53);
    concatQuadIndices(19, 23, 55, 51); concatQuadIndices(17, 21, 23, 19);

    concatQuadIndices(22, 54, 55, 23); concatQuadIndices(54, 62, 63, 55);
    concatQuadIndices(30, 31, 63, 62); concatQuadIndices(22, 23, 31, 30);

    concatQuadIndices(25, 27, 31, 29); concatQuadIndices(27, 59, 63, 31);
    concatQuadIndices(57, 61, 63, 59); concatQuadIndices(25, 29, 61, 57);

    concatQuadIndices(37, 45, 61, 53); concatQuadIndices(45, 47, 63, 61);
    concatQuadIndices(39, 55, 63, 47); concatQuadIndices(37, 53, 55, 39);

    // Wrap to object
    var model = {
        vertices : vertices,
        indices  : indices,
        numPoints: numPoints
    }
    return model;
}



export function parserObjFile(file) {
    // Internal helper function
    function concatQuadrilateralIndices(arr) {
        model.indices.push(arr[0]); model.indices.push(arr[1]); model.indices.push(arr[2]);
        model.indices.push(arr[2]); model.indices.push(arr[3]); model.indices.push(arr[0]);
        model.numPoints += 6;
    }
    function concatTriangleIndices(arr) {
        model.indices.push(arr[0]); model.indices.push(arr[1]); model.indices.push(arr[2]);
        model.numPoints += 3;
    }

    // Parser helper function
    function getFirstToken(str) {
        var token = "";
        var i     = 0;

        while (i < str.length && str[i] != ' ')
            token = token + str[i++];
        return token;
    }
    function parseVertex(str) {
        var raw_data_str = str.substr(2, str.length);
        var vertex       = [];

        vertex.push(parseFloat(raw_data_str));
        raw_data_str = raw_data_str.substr(raw_data_str.indexOf(' '), raw_data_str.length);
        vertex.push(parseFloat(raw_data_str));
        raw_data_str = raw_data_str.trim();
        raw_data_str = raw_data_str.substr(raw_data_str.indexOf(' '), raw_data_str.length);
        vertex.push(parseFloat(raw_data_str));

        return vertex;
    }
    function parseSurface(str) {
        var raw_data_str = str.substr(2, str.length);
        var temp_indices = [];

        var temp_str_int = "";
        var ignore_token = false;

        for (var i = 0; i < raw_data_str.length; i++) {
            var number_char = !isNaN(parseInt(raw_data_str[i]));

            if (raw_data_str[i] == ' ')
                ignore_token = false;
            else if (!ignore_token && number_char)
                temp_str_int = temp_str_int + raw_data_str[i];
            else if (!ignore_token && !number_char) {
                if (temp_str_int.length)
                    temp_indices.push(parseInt(temp_str_int));
                temp_str_int = "";
                ignore_token = true;
            }
        }

        // WebGL indexing range [0, len-1], .obj [1, len]
        temp_indices.forEach((item, i) => {temp_indices[i] = item - 1;});

        if (temp_indices.length == 4)
            concatQuadrilateralIndices(temp_indices);
        else
            concatTriangleIndices(temp_indices);
    }
    function normalizeLength() {
        var max = model.vertices.reduce((a,b) => {return Math.max(a, b);});
        var min = model.vertices.reduce((a,b) => {return Math.min(a, b);});
        model.vertices.forEach((item, i) => {
            if (item > 0)
                model.vertices[i] = model.vertices[i] / max;
            else
                model.vertices[i] = model.vertices[i] / min;
        });
    }

    var model = {
        vertices : [],
        indices  : [],
        numPoints: 0
    };

    var temp_line = "";
    for (var i = 0; i < file.length; i++) {
        // Get line
        if (file[i] != '\n')
            temp_line = temp_line + file[i];
        else {
            var first_token = getFirstToken(temp_line);

            if (first_token == "v")
                model.vertices = model.vertices.concat(parseVertex(temp_line));
            else if (first_token == "f")
                parseSurface(temp_line);

            temp_line = "";
        }
    }

    normalizeLength();
    return model;
}

export const filetest = `
# Blender 3.1.0
# www.blender.org
mtllib sanitycheck.mtl
o Cube
v 1.000000 1.000000 -1.000000
v 1.000000 -1.000000 -1.000000
v 1.000000 1.000000 1.000000
v 1.000000 -1.000000 1.000000
v -1.000000 1.000000 -1.000000
v -1.000000 -1.000000 -1.000000
v -1.000000 1.000000 1.000000
v -1.000000 -1.000000 1.000000
vn -0.0000 1.0000 -0.0000
vn -0.0000 -0.0000 1.0000
vn -1.0000 -0.0000 -0.0000
vn -0.0000 -1.0000 -0.0000
vn 1.0000 -0.0000 -0.0000
vn -0.0000 -0.0000 -1.0000
vt 0.625000 0.500000
vt 0.375000 0.500000
vt 0.625000 0.750000
vt 0.375000 0.750000
vt 0.875000 0.500000
vt 0.625000 0.250000
vt 0.125000 0.500000
vt 0.375000 0.250000
vt 0.875000 0.750000
vt 0.625000 1.000000
vt 0.625000 0.000000
vt 0.375000 1.000000
vt 0.375000 0.000000
vt 0.125000 0.750000
s 0
usemtl Material
f 1/1/1 5/5/1 7/9/1 3/3/1
f 4/4/2 3/3/2 7/10/2 8/12/2
f 8/13/3 7/11/3 5/6/3 6/8/3
f 6/7/4 2/2/4 4/4/4 8/14/4
f 2/2/5 1/1/5 3/3/5 4/4/5
f 6/8/6 5/6/6 1/1/6 2/2/6
`
