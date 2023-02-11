function parserObjFile(file, normalize = false) {
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
        var max   = model.vertices.reduce((a,b) => {return Math.max(a, b);});
        var min   = model.vertices.reduce((a,b) => {return Math.min(a, b);});
        var range = max - min;

        model.vertices.forEach((item, i) => {
            var normed = (item - min) / range;
            model.vertices[i] = normed - 0.5;
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

    if (normalize)
        normalizeLength();

    return model;
}






function drawObject4(obj4) {
  let vertices = [];

  let content = obj4.split("\n");
  let tempVertex = []

  content.map((el) => {
    if(el[0] === 'v'  && el[1] === ' ') {
      tempVertex.push(el.substring(2).split(' '));
    }
  })

  for(let i = 0; i<tempVertex.length; i++){
    for(let j=0; j<tempVertex[i].length; j++){
      tempVertex[i][j] = parseFloat(tempVertex[i][j]);
    }
  }

  let tempFace = []
  content.map((el) => {
    if(el[0] === 'f' && el[1] === ' '){
      tempFace.push(el.substring(2).split(' '));
    }
  })

  for(let i = 0; i<tempFace.length; i++){
    for(let j = 0; j<tempFace[i].length; j++){
      tempFace[i][j] = parseInt(tempFace[i][j])-1;
    }
  }

  for(let i = 0; i<tempFace.length; i++){
    let face = tempFace[i];
    vertices = vertices.concat(tempVertex[face[0]]);
    vertices = vertices.concat(tempVertex[face[1]]);
    vertices = vertices.concat(tempVertex[face[2]]);
    if(face.length === 4){
      vertices = vertices.concat(tempVertex[face[2]]);
      vertices = vertices.concat(tempVertex[face[3]]);
      vertices = vertices.concat(tempVertex[face[0]]);
    }
  }

  return vertices;
}























function dumpArray() {
    payload = drawObject4(payload);
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(payload)], {type : "text/plain"});
    a.href = URL.createObjectURL(file);
    a.download = "array_dump.json";
    console.log(payload)
    a.click();
}

function dumpElements() {
    payload = parserObjFile(payload);
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(payload)], {type : "text/plain"});
    a.href = URL.createObjectURL(file);
    a.download = "element_dump.json";
    console.log(payload)
    a.click();
}

var payload;

function main() {
    function callbackFile(e) {
        var file = e.target.files[0];
        if (!file) {
            console.log("File not found");
            return;
        }

        var reader    = new FileReader();
        reader.onload = function(e) {
          payload = e.target.result;
        };
        reader.readAsText(file);
    }

    document.getElementById("de").addEventListener('click', dumpElements, false);
    document.getElementById("da").addEventListener('click', dumpArray, false);
    document.getElementById('load_src').addEventListener('change', callbackFile, false);
}



window.onload = main();
