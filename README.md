# Tugas Besar 2 - IF3260 - Hollow Object
## Tips
Untuk menghindari *insanity*, direkomendasikan untuk membuat Wavefront `.obj` file format parser. Technical specification dari `.obj` ada pada Wikipedia dan sudah cukup lengkap untuk pengerjaan tugas besar ini. Meskipun terdengar menakutkan ("membuat `.obj` parser"), file `.obj` singkatnya adalah text file dengan informasi koordinat vertex dan face, sehingga tidak terlalu susah untuk menuliskan parser, terutama jika menggunakan JavaScript. Pada repo ini sudah dicantumkan `obj-dumper` yang membaca `.obj` file dan mengkonversikannya menjadi JSON.

Mengapa `.obj`? Kenapa tidak manual saja? mango gan, penulis mager nulis 16 vertices hollow cube atau 2k+ vertices icosahedron. Tinggal cari model di-Internet, buka di-Blender, export as `.obj`, load with `obj-dumper`, done

Wikipedia: https://en.wikipedia.org/wiki/Wavefront_.obj_file

## Deskripsi
Kode utama terletak difolder `src`.

![cube](other/img/cube.gif)

Objek-objek yang ada pada tugas ini diperoleh dari `obj-dumper`. Kode `obj-dumper` & tugas besar dapat menampilkan file-file .obj dalam skala yang relatif besar, stress test berhasil hingga 1k vertices (model pistol). 

![icosahedron](other/img/ico.gif)

`obj-dumper` melakukan output dalam bentuk Array yang ditujukan untuk `drawArrays` dan Elements yang ditujukan untuk `drawElements`. Format objek hasil dump mungkin perlu sedikit adjustment jika digunakan pada program lain.


## Gambar Objek
1. Kubus: Alip
2. Tetrahedral: Dika
3. Icosahedron: Tanur
