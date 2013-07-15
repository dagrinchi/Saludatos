var app = {

  name: "Saludatos",

  authors: "Alejandro Zarate: azarate@cool4code.com, Marcos Aguilera: maguilera@cool4code.com, Paola Vanegas: pvanegas@cool4code.com, David Alméciga: walmeciga@cool4code.com",

  version: 1.0,

  count: 0,

  data: [],

  results: {},

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
      cols: {
        idsubregion: []
      }
    },
    departamento: {
      cols: {
        iddepto: []
      }
    },
    municipio: {
      cols: {
        idmpio: []
      }
    },
    zona: {
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
    console.log("init: Iniciando app!");
    app.buttonHeight();
    app.btnsEvents();
    app.pageEvents();
    document.addEventListener("deviceready", app.onDeviceReady, false);
  },

  buttonHeight: function() {
    console.log("buttonHeight: Ajustando el alto de los botones!");
    var wh = $("#home").height() - 180;
    $.each($(".sidebar a"), function(i, item) {
      $(item).height(wh / 3);
    });
  },

  btnsEvents: function() {
    console.log("btnsEvents: Asignando eventos a los botones de las gráficas!");
    $(".btn_secundario").on("click", function(e) {
      console.log("btnsEvents: Validando si hay un indicador!");
      if (app.selection.indicador.cols.idindicador[0]) {
        var $this = $(this);
        app.openDB(app.chart[$this.data("graph")]);
      } else {
        navigator.notification.alert(
          'Debe seleccionar una categoría de salud!', function() {
          $.mobile.changePage("#home");
        },
          'Atención',
          'Aceptar');
      }
    });
  },

  pageEvents: function() {
    console.log("pageEvents: Asignando eventos a las páginas!");
    $("#home").on("pagebeforeshow", function() {
      $.each(app.counters, function(k, v) {
        app.counterAnim("#" + k, v);
      });
    });
  },


  onDeviceReady: function() {
    //window.localStorage.removeItem("updated");

    console.log("onDeviceReady: Dispositivo listo!");
    if (app.checkConnection()) {
      app.initGoogleLoader(app.startApp);
    } else {
      navigator.notification.alert('No hay una conexión a internet!', function() {
        navigator.app.exitApp();
      }, 'Atención', 'Aceptar');
    }
  },

  checkConnection: function() {
    console.log("checkConnection: Comprobando conectividad a internet!");
    var networkState = navigator.connection.type;
    if (networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
      console.log("checkConnection: No hay internet!");
      return false;
    } else {
      console.log("checkConnection: Si hay internet!");
      return true;
    }
  },

  initGoogleLoader: function(cb) {
    console.log("initGoogleLoader: Cargando activos google!");
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

    cb();

    // var script = document.createElement("script");
    // script.src = "https://www.google.com/jsapi?callback=app.startApp";
    // script.type = "text/javascript";
    // document.getElementsByTagName("head")[0].appendChild(script);

    // script.addEventListener("error", function(e) {
    //   console.log("Error: " + e);
    // }, false);
  },

  startApp: function() {
    console.log("startApp: Iniciando estructura de la applicación!");
    navigator.splashscreen.hide();
    if (app.checkUpdatedData()) {
      app.openDB(app.queryDB);
    } else {
      app.load();
    }
  },

  checkUpdatedData: function() {
    console.log("checkUpdatedData: Comprobando si los datos están actualizados!");
    var s = new Date();
    s.setMonth(s.getMonth() - 6);
    var updated = window.localStorage.getItem("updated");
    var u = new Date(updated);
    if (updated && u > s) {
      console.log("checkUpdatedData: Los datos están actualizados! " + updated);
      return true;
    } else {
      console.log("checkUpdatedData: Los datos no están actualizados!");
      return false;
    }
  },

  load: function() {
    console.log("load: Consultando open data!");
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
        var msg = "load: Se descargaron los datos completos de open data!";
        console.log(msg);
        app.createDB();
      }
    });
    console.log("load: " + url);
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

  createDB: function() {
    var msg = "createDB: Creando base de datos!";
    console.log(msg);
    var db = window.openDatabase("saludatos", "1.0", "Saludatos", 3145728);
    db.transaction(app.populateDB, app.errorCB, app.successCB);
  },

  populateDB: function(tx) {
    var msg = "populateDB: Creando tabla!";
    console.log(msg);
    var fields = [];
    $.each(app.data[0], function(k, v) {
      fields.push(k);
    });
    var dbFields = fields.join();
    tx.executeSql('DROP TABLE IF EXISTS datos');
    tx.executeSql('CREATE TABLE IF NOT EXISTS datos (' + dbFields + ')');
    tx.executeSql('CREATE TABLE IF NOT EXISTS columnNames (columnName)');

    msg = "populateDB: Creando vistas!";
    console.log(msg);

    tx.executeSql('CREATE VIEW IF NOT EXISTS region AS SELECT DISTINCT idregion, nomregion FROM datos WHERE nomregion <> "" GROUP BY idregion ORDER BY nomregion');
    tx.executeSql('CREATE VIEW IF NOT EXISTS subregion AS SELECT DISTINCT idsubregion, nomsubregion FROM datos WHERE nomsubregion <> "" GROUP BY idsubregion ORDER BY nomsubregion');
    tx.executeSql('CREATE VIEW IF NOT EXISTS departamento AS SELECT DISTINCT iddepto, nomdepto FROM datos WHERE nomdepto <> "" GROUP BY iddepto ORDER BY nomdepto');
    tx.executeSql('CREATE VIEW IF NOT EXISTS municipio AS SELECT DISTINCT idmpio, nommpio FROM datos WHERE nommpio <> "" GROUP BY idmpio ORDER BY nommpio');
    tx.executeSql('CREATE VIEW IF NOT EXISTS zona AS SELECT DISTINCT idzona, nomzona FROM datos WHERE nomzona <> "" GROUP BY idzona ORDER BY nomzona');
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

    console.log("populateDB: Insertando registros en la tabla datos!");
    for (var j = 0; j < fields.length; j++) {
      tx.executeSql('INSERT INTO columnNames(columnName) VALUES ("' + fields[j] + '")');
    }

    msg = "populateDB: Insertando registros en la tabla datos!";
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

  successCB: function() {
    var msg = "successCB: Base de datos creada con éxito!";
    console.log(msg);
    console.log("successCB: Guardando fecha de actualización!");
    var updated = new Date();
    window.localStorage.setItem("updated", updated);
    app.openDB(app.queryDB);
  },

  openDB: function(queryDB) {
    var msg = "openDB: Abriendo base de datos!";
    console.log(msg);
    var db = window.openDatabase("saludatos", "1.0", "Saludatos", 3145728);
    db.transaction(queryDB, app.errorCB);
  },

  queryDB: function(tx) {
    console.log("queryDB: Consultas!");

    tx.executeSql('SELECT COUNT(*) AS counter FROM datos', [], reg, app.errorCB);
    tx.executeSql('SELECT COUNT(*) AS counter FROM region', [], regi, app.errorCB);
    tx.executeSql('SELECT COUNT(*) AS counter FROM municipio', [], mun, app.errorCB);
    tx.executeSql('SELECT columnName from columnNames where columnName like "%yea%"', [], yea, app.errorCB);

    function yea(tx, results) {

      for (var j = 0; j < results.rows.length; j++) {
        console.log("Año " + j + " " + results.rows.item(j).columnName.substring(3));
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

    app.query(tx, function(tx) {
      app.ent.indicador(tx, app.buildSQL("indicador", "AND"), function(tx) {
        app.ent.region(tx, app.buildSQL("region", "AND"), function(tx) {
          app.ent.subregion(tx, app.buildSQL("subregion", "AND"), function(tx) {
            app.ent.departamento(tx, app.buildSQL("departamento", "AND"), function(tx) {
              app.ent.municipio(tx, app.buildSQL("municipio", "AND"), function(tx) {
                app.ent.zona(tx, app.buildSQL("zona", "AND"), function(tx) {
                  app.ent.educacion(tx, app.buildSQL("educacion", "AND"), function(tx) {
                    app.ent.ocupacion(tx, app.buildSQL("ocupacion", "AND"), function(tx) {
                      app.ent.edad(tx, app.buildSQL("edad", "AND"), function(tx) {
                        app.ent.estadocivil(tx, app.buildSQL("estadocivil", "AND"), function(tx) {
                          app.ent.sexo(tx, app.buildSQL("sexo", "AND"), function(tx) {
                            app.ent.etnia(tx, app.buildSQL("etnia", "AND"), function(tx) {
                              app.ent.eps(tx, app.buildSQL("eps", "AND"), function(tx) {
                                app.ent.ips(tx, app.buildSQL("ips", "AND"), function(tx) {
                                  app.ent.regimen(tx, app.buildSQL("regimen", "AND"), function(tx) {
                                    $.mobile.changePage("#home");
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  },

  query: function(tx, cb) {
    console.log("query: Consulta la tabla datos con o sin selección!");
    tx.executeSql(app.buildSQL("datos", "AND"), [], function(tx, results) {
      var len = results.rows.length;
      for (i = 0; i < len; i++) {
        $.each(results.rows.item(i), insert);
      }
      cb(tx);
    }, app.errorCB);

    function insert(k1, v1) {
      if (!$.isArray(app.results[k1])) {
        app.results[k1] = [];
      }
      app.results[k1].push(v1);
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

  buildSQL: function(entity, operator, limit) {
    var fields = [];
    var sql = "SELECT * FROM " + entity;

    $.each(app.selection, function(kr, vr) {
      fields.push(app.selection[kr]["cols"]);
    });

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

    if (typeof limit === "string") {
      sql += " LIMIT " + limit;
    }

    console.log("buildSQL: " + sql);
    return sql;
  },

  errorCB: function(tx, err) {
    console.log("Opps!: " + err.code);
  },

  registerInputs: function(list, type) {
    console.log("registerInputs: Registrando " + type + "(s)!");
    switch (type) {
      case "checkbox":
        $(list + " :" + type).on("click", app.eventCheckboxes);
        break;
      case "radio":
        $(list + " :" + type).on("click", app.eventRadios);
        break;
    }
  },

  eventRadios: function(e) {
    console.log("eventRadios: Graba selección para radios!");
    var $this = $(this);
    app.selection[$this.attr("name")]["cols"][$this.data("col")].length = 0;
    app.selection[$this.attr("name")]["cols"][$this.data("col")].push($this.val());
    $("#cat").dialog('close');
  },

  eventCheckboxes: function(e) {
    console.log("eventCheckboxes: Graba selección para checkboxes!");
    var $checkbox = $(this);

    if ($checkbox.is(':checked')) {
      if ($checkbox.data("checkall")) {
        $("#" + $checkbox.data("checkall") + " :checkbox").each(function(k, v) {
          if (k !== 0) {
            app.selection[$(v).data("vista")]["cols"][$(v).data("col")].push($(v).val());
            $(v).prop("checked", true).checkboxradio('refresh');
          }
        });
      } else {
        app.selection[$checkbox.data("vista")]["cols"][$checkbox.data("col")].push($checkbox.val());
      }
    } else {
      if ($checkbox.data("checkall")) {
        $("#" + $checkbox.data("checkall") + " :checkbox").each(function(k, v) {
          if (k !== 0) {
            app.selection[$(v).data("vista")]["cols"][$(v).data("col")].splice(app.selection[$(v).data("vista")]["cols"][$(v).data("col")].indexOf($(v).val()), 1);
            $(v).prop("checked", false).checkboxradio('refresh');
          }
        });
      } else {
        app.selection[$checkbox.data("vista")]["cols"][$checkbox.data("col")].splice(app.selection[$checkbox.data("vista")]["cols"][$checkbox.data("col")].indexOf($checkbox.val()), 1);
      }
    }
  },

  ent: {

    indicador: function(tx, sql, cb) {

      console.log("ent.indicador: Construye indicadores!");

      tx.executeSql(sql, [], indicador, app.errorCB);

      function indicador(tx, results) {
        var list = "#indList";
        var len = results.rows.length;
        for (var i = 0; i < len; i++) {
          var input = '<input type="radio" name="indicador" data-col="idindicador" id="indicador-' + results.rows.item(i).idindicador + '" value="' + results.rows.item(i).idindicador + '" />';
          var label = '<label for="indicador-' + results.rows.item(i).idindicador + '">' + results.rows.item(i).nomindicador + '</label>';
          $(list).append(input);
          $(list).append(label);
        }
        app.registerInputs(list, "radio");
        cb(tx);
      }
    },

    region: function(tx, sql, cb) {

      console.log("ent.region: Construye regiones!");

      tx.executeSql(sql, [], region, app.errorCB);

      function region(tx, results) {
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
        cb(tx);
      }
    },

    subregion: function(tx, sql, cb) {

      console.log("ent.subregion: Construye subregiones!");

      tx.executeSql(sql, [], subregion, app.errorCB);

      function subregion(tx, results) {
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
        cb(tx);
      }
    },

    departamento: function(tx, sql, cb) {

      console.log("ent.departamento: Construye departamentos!");

      tx.executeSql(sql, [], departamento, app.errorCB);

      function departamento(tx, results) {
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
        cb(tx);
      }

    },

    municipio: function(tx, sql, cb) {

      console.log("ent.municipio: Construye municipios!");

      tx.executeSql(sql, [], municipio, app.errorCB);

      function municipio(tx, results) {
        var list = "#munList";
        var len = results.rows.length;

        $("#municipioCount").html(len);
        for (var i = 0; i < len; i++) {
          var input = '<input type="checkbox" data-vista="municipio" data-col="idmpio" name="municipio-' + results.rows.item(i).idmpio + '" id="municipio-' + results.rows.item(i).idmpio + '" value="' + results.rows.item(i).idmpio + '"/>';
          var label = '<label for="municipio-' + results.rows.item(i).idmpio + '">' + results.rows.item(i).nommpio + '</label>';
          $(list).append(input);
          $(list).append(label);
        }
        //        $(list).html(html).trigger('create');
        app.registerInputs(list, "checkbox");
        cb(tx);
      }

    },

    zona: function(tx, sql, cb) {

      console.log("ent.zona: Construye zonas!");

      tx.executeSql(sql, [], zona, app.errorCB);

      function zona(tx, results) {
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
        cb(tx);
      }

    },

    educacion: function(tx, sql, cb) {

      console.log("ent.educacion: Construye educaciones!");

      tx.executeSql(sql, [], educacion, app.errorCB);

      function educacion(tx, results) {
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
        cb(tx);
      }
    },

    ocupacion: function(tx, sql, cb) {

      console.log("ent.ocupacion: Construye ocupaciones!");

      tx.executeSql(sql, [], ocupacion, app.errorCB);

      function ocupacion(tx, results) {
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
        cb(tx);
      }
    },

    edad: function(tx, sql, cb) {

      console.log("ent.edad: Construye edades!");

      tx.executeSql(sql, [], edad, app.errorCB);

      function edad(tx, results) {
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
        cb(tx);
      }
    },

    estadocivil: function(tx, sql, cb) {

      console.log("ent.estadocivil: Construye estadocivil!");

      tx.executeSql(sql, [], estadocivil, app.errorCB);

      function estadocivil(tx, results) {
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
        cb(tx);
      }
    },

    sexo: function(tx, sql, cb) {

      console.log("ent.genero: Construye genero!");

      tx.executeSql(sql, [], genero, app.errorCB);

      function genero(tx, results) {
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
        cb(tx);
      }
    },

    etnia: function(tx, sql, cb) {

      console.log("ent.etnia: Construye etnias!");

      tx.executeSql(sql, [], etnia, app.errorCB);

      function etnia(tx, results) {
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
        cb(tx);
      }
    },

    eps: function(tx, sql, cb) {

      console.log("ent.eps: Construye eps!");

      tx.executeSql(sql, [], eps, app.errorCB);

      function eps(tx, results) {
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
        cb(tx);
      }
    },

    ips: function(tx, sql, cb) {

      console.log("ent.ips: Construye ips!");

      tx.executeSql(sql, [], ips, app.errorCB);

      function ips(tx, results) {
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
        cb(tx);
      }
    },

    regimen: function(tx, sql, cb) {

      console.log("ent.regimen: Construye regimen!");

      tx.executeSql(sql, [], regimen, app.errorCB);

      function regimen(tx, results) {
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
        cb(tx);
      }

    }
  },

  chart: {
    pie: function(tx) {

      tx.executeSql(app.buildSQL("datos", "OR", "100", false), [], buildGraph, app.errorCB);
      var datatoprint = [];
      var numberofyear = 16;

      function buildGraph(tx, results) {

        var indicator = results.rows.item(0).idindicador;
        var query = 'SELECT idindicador, nomdepto, yea' + app.years[numberofyear] + ' from datos where idindicador = "' + indicator + '" LIMIT 30';
        console.log("La consulta fué: " + query);
        console.log("El indicador fué: " + indicator);
        console.log("El número de resultados fué: " + results.rows.length);
        tx.executeSql(query, [], printData(tx, results, app.years[numberofyear]), app.errorCB);
        console.log("Consulta realizada");
        console.log("Numero de resultados de la consulta " + results.rows.length);

      }

      function printData(tx, results, theyear) {
        console.log("Inicia pushData");
        var indicator = results.rows.item(0).idindicador;
        console.log("Indicador para insertar datos en el gráfico:" + indicator);

        if (theyear === '2005') {
          for (var j = 0; j < results.rows.length; j++) {
            if (results.rows.item(j).yea2005 != null && results.rows.item(j).yea2005 != '' && parseFloat(results.rows.item(j).yea2005) != 0.0) {
              console.log(results.rows.item(j).nomdepto + " " + results.rows.item(j).yea2005);
              datatoprint.push([results.rows.item(j).nomdepto, parseFloat(results.rows.item(j).yea2005)]);
            }
          }
        }

        if (theyear === '2006') {
          for (var k = 0; k < results.rows.length; k++) {
            if (results.rows.item(k).yea2006 != null && results.rows.item(k).yea2006 != '' && parseFloat(results.rows.item(k).yea2006) != 0.0) {
              console.log(results.rows.item(k).nomdepto + " " + results.rows.item(k).yea2006);
              datatoprint.push([results.rows.item(k).nomdepto, parseFloat(results.rows.item(k).yea2006)]);
            }
          }
        }

        chart = new Highcharts.Chart({
          chart: {
            renderTo: 'piechartdiv',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            // spacingTop: 10,
            height: 500
          },
          legend : {
            align : "center",
            verticalAlign : "top",
            x: 0,
            y: 20,
            borderWidth: 1,
            margin : 20 //define el espacio entre el legend y la zona de grafico
          },
          title: {
            text: '****TITULO DINAMICO****',
            align: "center",
            x: 0,
            y: 10,
            floating: true
            // margin: 10 //define el espacio entre el titulo y la zona de grafico, si existe un subtitulo entonces sera desde el subTitulo
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: false,
                color: '#000000',
                connectorColor: '#000000',
                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
              },
              showInLegend : true
            }
          },

          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },

          series: [{
              type: 'pie',
              name: 'Browser share',
              data: datatoprint
            }
          ]
        });
      }


    },

    lineal: function(tx, results) {

    },

    bars: function(tx) {

      tx.executeSql(app.buildSQL("datos", "AND"), [], buildGraph, app.errorCB);

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

      tx.executeSql(app.buildSQL("datos", "AND"), [], buildGraph, app.errorCB);

      function buildGraph(tx, results) {

        var datafromresults = [];
        var header = ['Departamento', '2005', '2006'];

        datafromresults.push(header);

        var len = results.rows.length;
        for (var i = 0; i < len; i++) {
          datafromresults.push([results.rows.item(i).nomdepto, parseFloat(results.rows.item(i).yea2005), parseFloat(results.rows.item(i).yea2006)]);
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
    $({
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
  }
};