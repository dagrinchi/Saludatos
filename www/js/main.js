var app = {

  name: "Saludatos",

  authors: "Alejandro Zarate: azarate@cool4code.com, Marcos Aguilera: maguilera@cool4code.com, Paola Vanegas: pvanegas@cool4code.com, David Alméciga: walmeciga@cool4code.com",

  version: 1.0,

  count: 0,

  data: [],

  checkConnection: function() {
    var networkState = navigator.connection.type;
    if (networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
      console.log("No hay internet!");
      return false;
    } else {
      console.log("Si hay internet!");
      return true;
    }
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

  onDeviceReady: function() {
    //window.localStorage.removeItem("updated");
    var msg = "Dispositivo listo!";
    app.showLoadingBox(msg);
    console.log(msg);
    if (app.checkUpdatedData()) {
      app.openDB();
      app.pageEvents();
    } else {
      if (app.checkConnection()) {
        navigator.splashscreen.hide();
        app.showLoadingBox("Descargando información");
        app.load();
      }
    }
  },

  pageEvents : function() {
    var pages = ["#ubicaciones", "#demografia"];
    $("#ubicaciones").on("pagebeforeshow", function() {
      $.each(app.selection["region"], function(k, v) {
        console.log("Ud. ha seleccionado: " + v);
      });
    });
  },

  createDB: function() {
    var msg = "Creando base de datos!";
    app.showLoadingBox(msg);
    console.log(msg);
    var db = window.openDatabase("saludatos", "1.0", "Saludatos", 3145728);
    db.transaction(app.populateDB, app.errorCB, app.successCB);
  },

  openDB: function() {
    var msg = "Abriendo base de datos!";
    app.showLoadingBox(msg);
    console.log(msg);
    var db = window.openDatabase("saludatos", "1.0", "Saludatos", 3145728);
    db.transaction(app.queryDB, app.errorCB);
  },

  populateDB: function(tx) {
    var msg = "Creando tabla!";
    app.showLoadingBox(msg);
    console.log(msg);
    var fields = [];
    $.each(app.data[0], function(k, v) {
      fields.push(k);
    });
    var dbFields = fields.join();
    tx.executeSql('DROP TABLE IF EXISTS datos');
    tx.executeSql('CREATE TABLE IF NOT EXISTS datos (' + dbFields + ')');

    msg = "Creando vistas!";
    app.showLoadingBox(msg);
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
    app.showLoadingBox(msg);
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
    app.showLoadingBox(msg);
    console.log(msg);
    console.log("Guardando fecha de actualización!");
    var updated = new Date();
    window.localStorage.setItem("updated", updated);
    app.hideLoadingBox();
    app.openDB();
  },

  queryDB: function(tx) {
    var msg = "Consultas iniciales!";
    app.showLoadingBox(msg);
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
    app.hideLoadingBox();
  },

  selection : {
    region : [],
    subregion : [],
    departamento : [],
    municipio : [],
    zona : [],
    educacion : [],
    ocupacion : [],
    edad : [],
    estadocivil : [],
    genero : [],
    etnia : [],
    eps : [],
    ips : [],
    regimen : []
  },

  registerCheckboxes : function(list) {
    $(list + " :checkbox").on("click", app.eventCheckboxes);
  },

  eventCheckboxes : function(e) {
    var $this = $(this);
    if ($this.is(':checked')) {
      app.selection[$this.data("name")].push($this.val());
    } else {
      app.selection[$this.data("name")].splice(app.selection[$this.data("name")].indexOf($this.val()),1);
    }
  },

  queryLocations : function() {

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
        app.showLoadingBox(msg);
        console.log(msg);
        app.createDB();
      }
    });
    app.showLoadingBox("Cargando registros!");
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
      var len = results.rows.length;
      for (var i = 0; i < len; i++) {
        var input = '<input type="radio" name="indicador" id="indicador-' + results.rows.item(i).idindicador + '" value="' + results.rows.item(i).idindicador + '" />';
        var label = '<label for="indicador-' + results.rows.item(i).idindicador + '">' + results.rows.item(i).nomindicador + '</label>';
        $("#indList").append(input);
        $("#indList").append(label);
      }
    },
    region: function(tx, results) {
      var list = "#regList";
      var len = results.rows.length;
      $("#regionCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="region" name="region-' + results.rows.item(i).idregion + '" id="region-' + results.rows.item(i).idregion + '" value="'+results.rows.item(i).idregion+'"/>';
        var label = '<label for="region-' + results.rows.item(i).idregion + '">' + results.rows.item(i).nomregion + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    subregion: function(tx, results) {
      var list = "#subregList";
      var len = results.rows.length;
      $("#subregionCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="subregion" name="subregion-' + results.rows.item(i).idsubregion + '" id="subregion-' + results.rows.item(i).idsubregion + '" value="'+results.rows.item(i).idsubregion+'"/>';
        var label = '<label for="subregion-' + results.rows.item(i).idsubregion + '">' + results.rows.item(i).nomsubregion + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    departamento: function(tx, results) {
      var list = "#depList";
      var len = results.rows.length;
      $("#departamentoCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="departamento" name="departamento-' + results.rows.item(i).iddepto + '" id="departamento-' + results.rows.item(i).iddepto + '" value="'+results.rows.item(i).iddepto+'"/>';
        var label = '<label for="departamento-' + results.rows.item(i).iddepto + '">' + results.rows.item(i).nomdepto + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    municipio: function(tx, results) {
      var list = "#munList";
      var len = results.rows.length;
      $("#municipioCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="municipio" name="municipio-' + results.rows.item(i).idmpio + '" id="municipio-' + results.rows.item(i).idmpio + '" value="'+results.rows.item(i).idmpio+'"/>';
        var label = '<label for="municipio-' + results.rows.item(i).idmpio + '">' + results.rows.item(i).nommpio + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    zona: function(tx, results) {
      var list = "#zonList";
      var len = results.rows.length;
      $("#zonaCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="zona" name="zona-' + results.rows.item(i).idzona + '" id="zona-' + results.rows.item(i).idzona + '" value="'+results.rows.item(i).idzona+'"/>';
        var label = '<label for="zona-' + results.rows.item(i).idzona + '">' + results.rows.item(i).nomzona + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    educacion: function(tx, results) {
      var list = "#eduList";
      var len = results.rows.length;
      $("#eduCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="educacion" name="educacion-' + results.rows.item(i).ideducacion + '" id="educacion-' + results.rows.item(i).ideducacion + '" value="'+results.rows.item(i).ideducacion+'"/>';
        var label = '<label for="educacion-' + results.rows.item(i).ideducacion + '">' + results.rows.item(i).nomeducacion + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    ocupacion: function(tx, results) {
      var list = "#ocuList";
      var len = results.rows.length;
      $("#ocuCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="ocupacion" name="ocupacion-' + results.rows.item(i).idocupacion + '" id="ocupacion-' + results.rows.item(i).idocupacion + '" value="'+results.rows.item(i).idocupacion+'"/>';
        var label = '<label for="ocupacion-' + results.rows.item(i).idocupacion + '">' + results.rows.item(i).nomocupacion + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    edad: function(tx, results) {
      var list = "#edaList";
      var len = results.rows.length;
      $("#edaCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="edad" name="edad-' + results.rows.item(i).idedad + '" id="edad-' + results.rows.item(i).idedad + '" value="'+results.rows.item(i).idedad+'"/>';
        var label = '<label for="edad-' + results.rows.item(i).idedad + '">' + results.rows.item(i).nomedad + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    estadocivil: function(tx, results) {
      var list = "#estList";
      var len = results.rows.length;
      $("#estCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="estadocivil" name="estadocivil-' + results.rows.item(i).idestadocivil + '" id="estadocivil-' + results.rows.item(i).idestadocivil + '" value="'+results.rows.item(i).idestadocivil+'"/>';
        var label = '<label for="estadocivil-' + results.rows.item(i).idestadocivil + '">' + results.rows.item(i).nomestadocivil + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    genero: function(tx, results) {
      var list = "#genList";
      var len = results.rows.length;
      $("#genCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="genero" name="genero-' + results.rows.item(i).idsexo + '" id="genero-' + results.rows.item(i).idsexo + '" value="'+results.rows.item(i).idsexo+'"/>';
        var label = '<label for="genero-' + results.rows.item(i).idsexo + '">' + results.rows.item(i).nomsexo + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    etnia: function(tx, results) {
      var list = "#etnList";
      var len = results.rows.length;
      $("#etnCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="etnia" name="etnia-' + results.rows.item(i).idetnia + '" id="etnia-' + results.rows.item(i).idetnia + '" value="'+results.rows.item(i).idetnia+'"/>';
        var label = '<label for="etnia-' + results.rows.item(i).idetnia + '">' + results.rows.item(i).nometnia + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    eps: function(tx, results) {
      var list = "#epsList";
      var len = results.rows.length;
      $("#epsCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="eps" name="eps-' + results.rows.item(i).ideps + '" id="eps-' + results.rows.item(i).ideps + '" value="'+results.rows.item(i).ideps+'"/>';
        var label = '<label for="eps-' + results.rows.item(i).ideps + '">' + results.rows.item(i).nomeps + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    ips: function(tx, results) {
      var list = "#ipsList";
      var len = results.rows.length;
      $("#ipsCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="ips" name="ips-' + results.rows.item(i).idips + '" id="ips-' + results.rows.item(i).idips + '" value="'+results.rows.item(i).idips+'"/>';
        var label = '<label for="ips-' + results.rows.item(i).idips + '">' + results.rows.item(i).nomips + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    },
    regimen: function(tx, results) {
      var list = "#regimenList";
      var len = results.rows.length;
      $("#regiCount").html(len);
      for (var i = 0; i < len; i++) {
        var input = '<input type="checkbox" data-name="regimen" name="regimen-' + results.rows.item(i).idregimen + '" id="regimen-' + results.rows.item(i).idregimen + '" value="'+results.rows.item(i).idregimen+'"/>';
        var label = '<label for="regimen-' + results.rows.item(i).idregimen + '">' + results.rows.item(i).nomregimen + '</label>';
        $(list).append(input);
        $(list).append(label);
      }
      app.registerCheckboxes(list);
    }
  },

  buttonHeight: function() {
    var wh = $(window).height() - 150;
    $("#homelogo").height(wh + 10);
    $.each($(".btn_primario a"), function(i, item) {
      $(item).height(wh / 3);
    });
  },

  init: function() {
    console.log("Iniciando app!");
    document.addEventListener("deviceready", app.onDeviceReady, false);
    app.buttonHeight();
  }
};