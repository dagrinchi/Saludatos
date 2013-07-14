var app = {

  name: "Saludatos",

  authors: "Alejandro Zarate: azarate@cool4code.com, Marcos Aguilera: maguilera@cool4code.com, Paola Vanegas: pvanegas@cool4code.com, David Alméciga: walmeciga@cool4code.com",

  version: 1.0,

  count: 0,

  data: [],
    
  years: [],
    
  counters: {
    "counter-reg": 0,
    "counter-regi": 0,
    "counter-mun": 0
  },

  selection: {
    indicador: {
      cols: {
        idindicador: []
      }
    },
    region: {
      cols: {
        idregion: []
      }
    },
    subregion: {
      relations: [],
      cols: {
        idsubregion: []
      }
    },
    departamento: {
      relations: [],
      cols: {
        iddepto: []
      }
    },
    municipio: {
      relations: ["departamento"],
      cols: {
        idmpio: []
      }
    },
    zona: {
      relations: [],
      cols: {
        idzona: []
      }
    },
    educacion: {
      cols: {
        ideducacion: []
      }
    },
    ocupacion: {
      cols: {
        idocupacion: []
      }
    },
    edad: {
      cols: {
        idedad: []
      }
    },
    estadocivil: {
      cols: {
        idestadocivil: []
      }
    },
    sexo: {
      cols: {
        idsexo: []
      }
    },
    etnia: {
      cols: {
        idetnia: []
      }
    },
    eps: {
      cols: {
        ideps: []
      }
    },
    ips: {
      cols: {
        idips: []
      }
    },
    regimen: {
      cols: {
        idregimen: []
      }
    }
  },

  init: function() {
    console.log("Iniciando app!");
    app.buttonHeight();
    document.addEventListener("deviceready", app.onDeviceReady, false);
  },

  buttonHeight: function() {
    console.log("Ajustando el alto de los botones!");
    var wh = $("#home").height() - 180;
    $.each($(".sidebar a"), function(i, item) {
      $(item).height(wh / 3);
    });
  },

  onDeviceReady: function() {
    //window.localStorage.removeItem("updated");

    console.log("Dispositivo listo!");
    if (app.checkConnection()) {
      console.log("Cargando google js!");
      app.initGoogleLoader();
      app.startApp();
    } else {
      navigator.notification.alert('No hay una conexión a internet!', function() {
        navigator.app.exitApp();
      }, 'Atención', 'Aceptar');
    }
  },

  checkConnection: function() {
    console.log("Comprobando conectividad a internet!");
    var networkState = navigator.connection.type;
    if (networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
      console.log("No hay internet!");
      return false;
    } else {
      console.log("Si hay internet!");
      return true;
    }
  },

  initGoogleLoader: function() {

    WebFontConfig = {
      google: {
        families: ['Open+Sans:300,400:latin']
      }
    };

    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);

    // var script = document.createElement("script");
    // script.src = "https://www.google.com/jsapi?callback=app.startApp";
    // script.type = "text/javascript";
    // document.getElementsByTagName("head")[0].appendChild(script);

    // script.addEventListener("error", function(e) {
    //   console.log("Error: " + e);
    // }, false);
  },

  startApp: function() {
    navigator.splashscreen.hide();
    if (app.checkUpdatedData()) {
      app.openDB(app.queryDB);
    } else {
      app.load();
    }
    app.pageEvents();
    app.btnsEvents();
  },

  showLoadingBox: function(txt) {
    $.mobile.loading('show', {
      text: txt,
      textVisible: true,
      theme: 'a'
    });
  },

  hideLoadingBox: function() {
    $.mobile.loading('hide');
  },

  checkUpdatedData: function() {
    var s = new Date();
    s.setMonth(s.getMonth() - 6);
    var updated = window.localStorage.getItem("updated");
    var u = new Date(updated);
    if (updated && u > s) {
      console.log("Los datos están actualizados! " + updated);
      return true;
    } else {
      console.log("Los datos no están actualizados!");
      return false;
    }
  },

  googleVisualization: function() {
    if (google && google.visualization) {
      console.log("Librería graficos ya existe!");
      app.startApp();
    } else {
      console.log("Cargando librería graficos!");
      google.load("visualization", "1", {
        packages: ['corechart', 'geochart'],
        callback: app.startApp
      });
    }
  },

  btnsEvents: function() {
    $(".btn_secundario").on("click", function(e) {
      var $this = $(this);
      app.openDB(app.ent[$this.data("graph")]);
    });
  },

  pageEvents: function() {
    $("#ubicaciones").on("pagebeforeshow", function() {
      app.openDB(app.queryUbicaciones);
    });

    $("#home").on("pagebeforeshow", function() {
      $.each(app.counters, function(k, v) {
        app.counterAnim("#" + k, v);
      });
    });
  },

  buildSQL: function(entity, operator, limit, relations) {
    var fields = [];
    var sql = "SELECT * FROM " + entity;
    if (relations) {
      console.log("Consultando relaciones!");
      $.each(app.selection[entity]["relations"], function(kr, vr) {
        fields.push(app.selection[vr]["cols"]);
      });
    } else {
      console.log("Consultando entidades!");
      $.each(app.selection, function(kr, vr) {
        fields.push(app.selection[kr]["cols"]);
      });
    }
    $.each(fields, function(k1, v1) {
      $.each(v1, function(k2, v2) {
        $.each(v2, function(k3, v3) {
          if (k1 === 0 && k3 === 0) {
            sql += " WHERE " + k2 + " = '" + v3 + "'";
          } else {
            sql += " " + operator + " " + k2 + " = '" + v3 + "'";
          }
        });
      });
    });
    sql += " LIMIT " + limit;
    console.log(sql);
    return sql;
  },

  queryUbicaciones: function(tx) {
    var msg = "Consultando ubicaciones!";
    console.log(msg);
    tx.executeSql(app.buildSQL("municipio", "OR", "250", true), [], app.ent.municipio, app.errorCB);
  },

  createDB: function() {
    var msg = "Creando base de datos!";
    console.log(msg);
    var db = window.openDatabase("saludatos", "1.0", "Saludatos", 3145728);
    db.transaction(app.populateDB, app.errorCB, app.successCB);
  },

  openDB: function(queryDB) {
    var msg = "Abriendo base de datos!";
    console.log(msg);
    var db = window.openDatabase("saludatos", "1.0", "Saludatos", 3145728);
    db.transaction(queryDB, app.errorCB);
  },

  populateDB: function(tx) {
    var msg = "Creando tabla!";
    console.log(msg);
    var fields = [];
    $.each(app.data[0], function(k, v) {
      fields.push(k);
    });
    var dbFields = fields.join();
    tx.executeSql('DROP TABLE IF EXISTS datos');
    tx.executeSql('CREATE TABLE IF NOT EXISTS datos (' + dbFields + ')');
    tx.executeSql('CREATE TABLE IF NOT EXISTS columnNames (columnName)');

    for (var j = 0; j < fields.length; j++) {
      tx.executeSql('INSERT INTO columnNames(columnName) VALUES ("' + fields[j] + '")');
    }

    msg = "Creando vistas!";
    console.log(msg);

    tx.executeSql('CREATE VIEW IF NOT EXISTS region AS SELECT DISTINCT idregion, nomregion FROM datos WHERE nomregion <> "" GROUP BY idregion ORDER BY nomregion');
    tx.executeSql('CREATE VIEW IF NOT EXISTS subregion AS SELECT DISTINCT idregion, idsubregion, nomsubregion FROM datos WHERE nomsubregion <> "" GROUP BY idsubregion ORDER BY nomsubregion');
    tx.executeSql('CREATE VIEW IF NOT EXISTS departamento AS SELECT DISTINCT idregion, idsubregion, iddepto, nomdepto FROM datos WHERE nomdepto <> "" GROUP BY iddepto ORDER BY nomdepto');
    tx.executeSql('CREATE VIEW IF NOT EXISTS municipio AS SELECT DISTINCT idregion, idsubregion, iddepto, idmpio, nommpio FROM datos WHERE nommpio <> "" GROUP BY idmpio ORDER BY nommpio');
    tx.executeSql('CREATE VIEW IF NOT EXISTS zona AS SELECT DISTINCT idregion, idsubregion, iddepto, idmpio, idzona, nomzona FROM datos WHERE nomzona <> "" GROUP BY idzona ORDER BY nomzona');
    tx.executeSql('CREATE VIEW IF NOT EXISTS edad AS SELECT DISTINCT idedad, nomedad FROM datos WHERE nomedad <> "" GROUP BY idedad ORDER BY nomedad');
    tx.executeSql('CREATE VIEW IF NOT EXISTS educacion AS SELECT DISTINCT ideducacion, nomeducacion FROM datos WHERE nomeducacion <> "" GROUP BY ideducacion ORDER BY nomeducacion');
    tx.executeSql('CREATE VIEW IF NOT EXISTS eps AS SELECT DISTINCT ideps, nomeps FROM datos WHERE nomeps <> "" GROUP BY ideps ORDER BY nomeps');
    tx.executeSql('CREATE VIEW IF NOT EXISTS estadocivil AS SELECT DISTINCT idestadocivil, nomestadocivil FROM datos WHERE nomestadocivil <> "" GROUP BY idestadocivil ORDER BY nomestadocivil');
    tx.executeSql('CREATE VIEW IF NOT EXISTS etnia AS SELECT DISTINCT idetnia, nometnia FROM datos WHERE nometnia <> "" GROUP BY idetnia ORDER BY nometnia');
    tx.executeSql('CREATE VIEW IF NOT EXISTS indicador AS SELECT DISTINCT idindicador, nomindicador FROM datos WHERE nomindicador <> "" GROUP BY idindicador ORDER BY nomindicador');
    tx.executeSql('CREATE VIEW IF NOT EXISTS ips AS SELECT DISTINCT idips, nomips FROM datos WHERE nomips <> "" GROUP BY idips ORDER BY nomips');
    tx.executeSql('CREATE VIEW IF NOT EXISTS ocupacion AS SELECT DISTINCT idocupacion, nomocupacion FROM datos WHERE nomocupacion <> "" GROUP BY idocupacion ORDER BY nomocupacion');
    tx.executeSql('CREATE VIEW IF NOT EXISTS regimen AS SELECT DISTINCT idregimen, nomregimen FROM datos WHERE nomregimen <> "" GROUP BY idregimen ORDER BY nomregimen');
    tx.executeSql('CREATE VIEW IF NOT EXISTS sexo AS SELECT DISTINCT idsexo, nomsexo FROM datos WHERE nomsexo <> "" GROUP BY idsexo ORDER BY nomsexo');

    msg = "Insertando registros en la base!";
    console.log(msg);
    $.each(app.data, function(k1, v1) {
      var values = [];
      $.each(v1, function(k2, v2) {
        values.push('"' + v2 + '"');
      });
      var dbValues = values.join();
      var sql = 'INSERT INTO datos (' + dbFields + ') VALUES (' + dbValues + ')';
      tx.executeSql(sql);
    });
  },

  errorCB: function(tx, err) {
    console.log("Opps!: " + err.code);
  },

  successCB: function() {
    var msg = "Base de datos creada con éxito!";
    console.log(msg);
    console.log("Guardando fecha de actualización!");
    var updated = new Date();
    window.localStorage.setItem("updated", updated);
    app.openDB(app.queryDB);
  },

  queryDB: function(tx) {
    var msg = "Consultas iniciales!";
    console.log(msg);

    tx.executeSql('SELECT * FROM indicador', [], app.ent.indicador, app.errorCB);
    tx.executeSql('SELECT * FROM educacion', [], app.ent.educacion, app.errorCB);
    tx.executeSql('SELECT * FROM ocupacion', [], app.ent.ocupacion, app.errorCB);
    tx.executeSql('SELECT * FROM edad', [], app.ent.edad, app.errorCB);
    tx.executeSql('SELECT * FROM estadocivil', [], app.ent.estadocivil, app.errorCB);
    tx.executeSql('SELECT * FROM sexo', [], app.ent.genero, app.errorCB);
    tx.executeSql('SELECT * FROM etnia', [], app.ent.etnia, app.errorCB);
    tx.executeSql('SELECT * FROM eps', [], app.ent.eps, app.errorCB);
    tx.executeSql('SELECT * FROM ips', [], app.ent.ips, app.errorCB);
    tx.executeSql('SELECT * FROM regimen', [], app.ent.regimen, app.errorCB);
    tx.executeSql('SELECT * FROM region', [], app.ent.region, app.errorCB);
    tx.executeSql('SELECT * FROM subregion', [], app.ent.subregion, app.errorCB);
    tx.executeSql('SELECT * FROM departamento', [], app.ent.departamento, app.errorCB);
    tx.executeSql('SELECT * FROM municipio', [], app.ent.municipio, app.errorCB);
    tx.executeSql('SELECT * FROM zona', [], app.ent.zona, app.errorCB);
    tx.executeSql('SELECT COUNT(*) AS counter FROM datos', [], reg, app.errorCB);
    tx.executeSql('SELECT COUNT(*) AS counter FROM region', [], regi, app.errorCB);
    tx.executeSql('SELECT COUNT(*) AS counter FROM municipio', [], mun, app.errorCB);
    tx.executeSql('SELECT columnName from columnNames where columnName like "%yea%"', [], yea, app.errorCB);

    function yea(tx, results){
        
        for(var j = 0; j < results.rows.length; j++){
            console.log("Año "+j+" "+results.rows.item(j).columnName.substring(3));
            app.years.push(results.rows.item(j).columnName.substring(3));
        }
        /*for(var k = 0; k < app.years.length; k++){
            console.log("Año guardado "+app.years[k]);
        }*/
        
    }
      
    function reg(tx, results) {
      app.counters["counter-reg"] = results.rows.item(0).counter;
    }

    function regi(tx, results) {
      app.counters["counter-regi"] = results.rows.item(0).counter;
    }

    function mun(tx, results) {
      app.counters["counter-mun"] = results.rows.item(0).counter;
    }

    setTimeout(function() {
      $.mobile.changePage("#home");
    }, 7000);
  },

  registerInputs: function(list, type) {
    if (type === "checkbox") {
      $(list + " :" + type).on("click", app.eventCheckboxes);
    } else {
      $(list + " :" + type).on("click", app.eventRadios);
    }
  },

  eventRadios: function(e) {
    var $this = $(this);
    app.selection[$this.attr("name")]["cols"][$this.data("col")].length = 0;
    app.selection[$this.attr("name")]["cols"][$this.data("col")].push($this.val());
    $("#cat").dialog('close');
  },

  eventCheckboxes: function(e) {
    var $this = $(this);
    if ($this.is(':checked')) {
      app.selection[$this.data("vista")]["cols"][$this.data("col")].push($this.val());
    } else {
      app.selection[$this.data("vista")]["cols"][$this.data("col")].splice(app.selection[$this.data("vista")]["cols"][$this.data("col")].indexOf($this.val()), 1);
    }
  },

  load: function() {
    var url = "http://servicedatosabiertoscolombia.cloudapp.net/v1/Ministerio_de_Salud/indicadoresdesalud?$format=json&$filter=id>" + app.count;
    var xhr = app.getJson(url);
    xhr.success(function(r) {
      $.each(r.d, function(k, v) {
        app.data.push(v);
      });
      if (r.d.length == 1000) {
        app.count = app.count + 1000;
        app.load();
      } else {
        var msg = "Se descargaron los datos completos de open data!";
        console.log(msg);
        app.createDB();
      }
    });
    console.log("Cargando: " + url);
  },

  getJson: function(url) {
    return $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
      error: function() {
        alert('Error');
      }
    });
  },

  ent: {

    indicador: function(tx, results) {
      var list = "#indList";
      var len = results.rows.length;
      for (var i = 0; i < len; i++) {
        var input = '<input type="radio" name="indicador" data-col="idindicador" id="indicador-' + results.rows.item(i).idindicador + '" value="' + results.rows.item(i).idindicador + '" />';
        var label = '<label for="indicador-' + results.rows.item(i).idindicador + '">' + results.rows.item(i).nomindicador + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "radio");
    },

    region: function(tx, results) {
      var list = "#regList";
      var len = results.rows.length;
      $("#regionCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="region" data-col="idregion" name="region-' + results.rows.item(i).idregion + '" id="region-' + results.rows.item(i).idregion + '" value="' + results.rows.item(i).idregion + '"/>';
        var label = '<label for="region-' + results.rows.item(i).idregion + '">' + results.rows.item(i).nomregion + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    subregion: function(tx, results) {
      var list = "#subregList";
      var len = results.rows.length;
      $("#subregionCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="subregion" data-col="idsubregion" name="subregion-' + results.rows.item(i).idsubregion + '" id="subregion-' + results.rows.item(i).idsubregion + '" value="' + results.rows.item(i).idsubregion + '"/>';
        var label = '<label for="subregion-' + results.rows.item(i).idsubregion + '">' + results.rows.item(i).nomsubregion + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },
    departamento: function(tx, results) {
      var list = "#depList";
      var len = results.rows.length;

      $("#departamentoCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="departamento" data-col="iddepto" name="departamento-' + results.rows.item(i).iddepto + '" id="departamento-' + results.rows.item(i).iddepto + '" value="' + results.rows.item(i).iddepto + '"/>';
        var label = '<label for="departamento-' + results.rows.item(i).iddepto + '">' + results.rows.item(i).nomdepto + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    municipio: function(tx, results) {
      var list = "#munList";
      var len = results.rows.length;
      var html = "<legend>Seleccione uno varios municipios para evaluar:</legend> \n";
      $("#municipioCount").html(len);
      for (var i = 0; i < len; i++) {
        html += '<input type="checkbox" data-vista="municipio" data-col="idmpio" name="municipio-' + results.rows.item(i).idmpio + '" id="municipio-' + results.rows.item(i).idmpio + '" value="' + results.rows.item(i).idmpio + '"/> \n';
        html += '<label for="municipio-' + results.rows.item(i).idmpio + '">' + results.rows.item(i).nommpio + '</label> \n';
      }
      $(list).html(html).trigger('create');
      app.registerInputs(list, "checkbox");
    },

    zona: function(tx, results) {
      var list = "#zonList";
      var len = results.rows.length;
      $("#zonaCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="zona" data-col="idzona" name="zona-' + results.rows.item(i).idzona + '" id="zona-' + results.rows.item(i).idzona + '" value="' + results.rows.item(i).idzona + '"/>';
        var label = '<label for="zona-' + results.rows.item(i).idzona + '">' + results.rows.item(i).nomzona + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    educacion: function(tx, results) {
      var list = "#eduList";
      var len = results.rows.length;
      $("#eduCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="educacion" data-col="ideducacion" name="educacion-' + results.rows.item(i).ideducacion + '" id="educacion-' + results.rows.item(i).ideducacion + '" value="' + results.rows.item(i).ideducacion + '"/>';
        var label = '<label for="educacion-' + results.rows.item(i).ideducacion + '">' + results.rows.item(i).nomeducacion + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    ocupacion: function(tx, results) {
      var list = "#ocuList";
      var len = results.rows.length;
      $("#ocuCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="ocupacion" data-col="idocupacion" name="ocupacion-' + results.rows.item(i).idocupacion + '" id="ocupacion-' + results.rows.item(i).idocupacion + '" value="' + results.rows.item(i).idocupacion + '"/>';
        var label = '<label for="ocupacion-' + results.rows.item(i).idocupacion + '">' + results.rows.item(i).nomocupacion + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    edad: function(tx, results) {
      var list = "#edaList";
      var len = results.rows.length;
      $("#edaCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="edad" data-col="idedad" name="edad-' + results.rows.item(i).idedad + '" id="edad-' + results.rows.item(i).idedad + '" value="' + results.rows.item(i).idedad + '"/>';
        var label = '<label for="edad-' + results.rows.item(i).idedad + '">' + results.rows.item(i).nomedad + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },
    estadocivil: function(tx, results) {
      var list = "#estList";
      var len = results.rows.length;
      $("#estCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="estadocivil" data-col="idestadocivil" name="estadocivil-' + results.rows.item(i).idestadocivil + '" id="estadocivil-' + results.rows.item(i).idestadocivil + '" value="' + results.rows.item(i).idestadocivil + '"/>';
        var label = '<label for="estadocivil-' + results.rows.item(i).idestadocivil + '">' + results.rows.item(i).nomestadocivil + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    genero: function(tx, results) {
      var list = "#genList";
      var len = results.rows.length;
      $("#genCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="sexo" data-col="idsexo" name="genero-' + results.rows.item(i).idsexo + '" id="genero-' + results.rows.item(i).idsexo + '" value="' + results.rows.item(i).idsexo + '"/>';
        var label = '<label for="genero-' + results.rows.item(i).idsexo + '">' + results.rows.item(i).nomsexo + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    etnia: function(tx, results) {
      var list = "#etnList";
      var len = results.rows.length;
      $("#etnCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="etnia" data-col="idetnia" name="etnia-' + results.rows.item(i).idetnia + '" id="etnia-' + results.rows.item(i).idetnia + '" value="' + results.rows.item(i).idetnia + '"/>';
        var label = '<label for="etnia-' + results.rows.item(i).idetnia + '">' + results.rows.item(i).nometnia + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    eps: function(tx, results) {
      var list = "#epsList";
      var len = results.rows.length;
      $("#epsCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="eps" data-col="ideps" name="eps-' + results.rows.item(i).ideps + '" id="eps-' + results.rows.item(i).ideps + '" value="' + results.rows.item(i).ideps + '"/>';
        var label = '<label for="eps-' + results.rows.item(i).ideps + '">' + results.rows.item(i).nomeps + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    ips: function(tx, results) {
      var list = "#ipsList";
      var len = results.rows.length;
      $("#ipsCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="ips" data-col="idips" name="ips-' + results.rows.item(i).idips + '" id="ips-' + results.rows.item(i).idips + '" value="' + results.rows.item(i).idips + '"/>';
        var label = '<label for="ips-' + results.rows.item(i).idips + '">' + results.rows.item(i).nomips + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    regimen: function(tx, results) {
      var list = "#regimenList";
      var len = results.rows.length;
      $("#regiCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-vista="regimen" data-col="idregimen" name="regimen-' + results.rows.item(i).idregimen + '" id="regimen-' + results.rows.item(i).idregimen + '" value="' + results.rows.item(i).idregimen + '"/>';
        var label = '<label for="regimen-' + results.rows.item(i).idregimen + '">' + results.rows.item(i).nomregimen + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerInputs(list, "checkbox");
    },

    pie: function(tx) {

      tx.executeSql(app.buildSQL("datos", "OR", "100", false), [], buildGraph, app.errorCB);
      var datatoprint = [];
      var numberofyear = 16;
      
      function buildGraph(tx, results) {
        
        
       
        var indicator = results.rows.item(0).idindicador;
        var query = 'SELECT idindicador, nomdepto, yea'+app.years[numberofyear]+' from datos where idindicador = "'+indicator+'" LIMIT 30';
        console.log("La consulta fué: "+query);
        console.log("El indicador fué: "+indicator);
        console.log("El número de resultados fué: "+results.rows.length);
        tx.executeSql(query, [], printData(tx,results,app.years[numberofyear]), app.errorCB);
        console.log("Consulta realizada");
        console.log("Numero de resultados de la consulta "+results.rows.length);
        
      }

      
      function printData(tx, results, theyear){
        console.log("Inicia pushData");
        var indicator = results.rows.item(0).idindicador;
        console.log("Indicador para insertar datos en el gráfico:"+indicator);
        
        if(theyear === '2005'){
          for(var j=0; j < results.rows.length ; j ++){
            if( results.rows.item(j).yea2005 != null && results.rows.item(j).yea2005 != '' && parseFloat(results.rows.item(j).yea2005) != 0.0){
              console.log(results.rows.item(j).nomdepto+" "+results.rows.item(j).yea2005);
              datatoprint.push([results.rows.item(j).nomdepto,parseFloat(results.rows.item(j).yea2005)]);
            }
          }
        }
        
        
        if(theyear === '2006'){
          for(var k=0; k < results.rows.length ; k ++){
            if( results.rows.item(k).yea2006 != null && results.rows.item(k).yea2006 != '' && parseFloat(results.rows.item(k).yea2006) != 0.0)
            {
              console.log(results.rows.item(k).nomdepto+" "+results.rows.item(k).yea2006);
              datatoprint.push([results.rows.item(k).nomdepto,parseFloat(results.rows.item(k).yea2006)]);
            }
          }
        }
        
        chart = new Highcharts.Chart(
                                     {
                                     chart: {
                                     renderTo: 'piechartdiv',
                                     plotBackgroundColor: null,
                                     plotBorderWidth: null,
                                     plotShadow: false
                                     },
                                     title: {
                                     text: 'Monthly Average Temperature',
                                     x: -20 //center
                                     },
                                     
                                     plotOptions: {
                                     pie: {
                                     allowPointSelect: true,
                                     cursor: 'pointer',
                                     dataLabels: {
                                     enabled: true,
                                     color: '#000000',
                                     connectorColor: '#000000',
                                     format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                                     }
                                     }
                                     },
                                     
                                     tooltip: {
                                     pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                                     },
                                     
                                     series: [{
                                              type: 'pie',
                                              name: 'Browser share',
                                              data: datatoprint
                                              }]
                                     });


  
      }

      
    },

    lineal: function(tx, results) {

    },

    bars: function(tx) {

      tx.executeSql(app.buildSQL("datos", "AND", "1000", false), [], buildGraph, app.errorCB);

      function buildGraph(tx, results) {

        var datafromresults = [];
        var header = ['Departamento', '2005', '2006'];

        datafromresults.push(header);

        var len = results.rows.length;
        for (var i = 0; i < len; i++) {
          var item = results.rows.item(i);
          var colums = [];
          for (var j = 0; j < columnNames.length; i++) {
            if (typeof columnNames[j] === "string") {

            }
            colums.push(item[columnNames[j]]);
          }

          datafromresults.push([item["nomdepto"], parseFloat(item["yea2005"]), parseFloat(item["yea2006"])]);
        }

        if (google && google.visualization) {
          googleChart();
        } else {
          google.load("visualization", "1", {
            callback: googleChart
          });
        }

        function googleChart() {
          var data = google.visualization.arrayToDataTable(datafromresults);
          var bars = new google.visualization.ColumnChart(document.getElementById('columnchartdiv'));
          var options = {
            hAxis: {
              title: "y2005 y2006"
            },
            vAxis: {
              title: "miles"
            }
          };
          bars.draw(data, options);
        }
      }
    },

    maps: function(tx) {

      tx.executeSql(app.buildSQL("datos", "AND", "1000", false), [], buildGraph, app.errorCB);

      function buildGraph(tx, results) {

        var datafromresults = [];
        var header = ['Departamento', '2005', '2006'];

        datafromresults.push(header);

        var len = results.rows.length;
        for (var i = 0; i < len; i++) {
          datafromresults.push([results.rows.item(i).nomdepto, parseFloat(results.rows.item(i).yea2005),parseFloat(results.rows.item(i).yea2006)]);
        }

        if (google && google.visualization) {
          googleChart();
        } else {
          google.load("visualization", "1", {
            'packages': ['geochart'],
            callback: googleChart
          });
        }

        function googleChart() {
          var data = google.visualization.arrayToDataTable(datafromresults);
          var map = new google.visualization.GeoChart(document.getElementById('geochartdiv'));
          var options = {
            region: 'CO',
            resolution: 'provinces',
            displayMode: 'markers',
            height: $("#maps").height() - 200 + "px",
            // magnifyingGlass: {
            //   enable: "true",
            //   zoomFactor: "10.0"
            // },
            backgroundColor: {
              fill: "transparent"
            },
            colorAxis: {
              colors: ['green', 'red']
            }
          };

          map.draw(data, options);
        }
      }
    },

    table: function(tx, results) {}
  },

  counterAnim: function(selector, number) {
    jQuery({
      value: 0
    }).animate({
      value: number
    }, {
      duration: 1000,
      easing: 'swing',
      step: function() {
        $(selector).text(Math.ceil(this.value));
      },
      complete: function() {
        $(selector).css({
          color: '#ddd'
        });
      }
    });
  }
};