$(document).bind("mobileinit", function() {
  $.mobile.page.prototype.options.addBackBtn = true;
});

var app = {

  name: "SaluDatos",

  authors: "Alejandro Zarate: azarate@cool4code.com, Marcos Aguilera: maguilera@cool4code.com, Paola Vanegas: pvanegas@cool4code.com, David Alméciga: walmeciga@cool4code.com",

  version: 1.0,

  count: 0,

  total: 0,

  totalCount: 0,

  totalCount2: 1000,

  data: [],

  results: {},

  years: [],

  start: true,

  counters: {
    "counter-reg": 0,
    "counter-dep": 0,
    "counter-mun": 0
  },

  selection: {
    indicador: {
      cols: {
        idindicador: []
      }
    },
    pais: {
      cols: {
        iddepto: []
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

  initialize: function() {
    console.log("init: Iniciando app!");
    this.bindEvents();
  },

  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  onDeviceReady: function() {
    //window.localStorage.removeItem("updated");
    app.receivedEvent('deviceready');

    console.log("onDeviceReady: Dispositivo listo!");

    app.buttonHeight();
    app.btnsEvents(app.sliderEvents);
    app.pageEvents();   
    app.chartSize();

    $("#options").on("change", function(e) {
      $.mobile.changePage($(this).val());
    });

    app.initGoogleLoader(app.startApp);
  },

  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  },

  chartSize: function() {
    var charts = ["#linealchartdiv", "#piechartdiv", "#columnchartdiv"];
    var ww = $(window).width();
    var wh = $(window).height();
    $.each(charts, function(k, v) {
      //$(v).width($($(v).parents()[1]).width());
      $(v).width(ww);
      $(v).height(wh - 106);
    });
    $("#geochartdiv").width(ww);
    $("#geochartdiv").height(ww);
  },

  buttonHeight: function() {
    console.log("buttonHeight: Ajustando el alto de los botones!");
    var wh = $("#home").height() - 200;
    $.each($(".sidebar a"), function(i, item) {
      $(item).height(wh / 3);
    });
    app["homeheight"] = wh;
  },

  btnsEvents: function(cb) {

    console.log("btnsEvents: Asignando eventos a los botones de las gráficas!");

    $("#inczoom").on("click", increase);
    function increase() {
        app["mapopt"].width = app["mapopt"].width * 2;
        app["mapopt"].height = app["mapopt"].height * 2;
        app["mapobj"].draw(app["mapdata"], app["mapopt"]);

        centerGeoChart();
        $("#inczoom").off("click");
        $("#deczoom").on("click", decrease);
    }

    //$("#deczoom").on("click", decrease);
    function decrease() {
        app["mapopt"].width = app["mapopt"].width / 2;
        app["mapopt"].height = app["mapopt"].height / 2;
        app["mapobj"].draw(app["mapdata"], app["mapopt"]);

        centerGeoChart();
        $("#deczoom").off("click");
        $("#inczoom").on("click", increase);
    }

    function centerGeoChart() {
      var myDiv = $("#geochartdiv");
      var scrollTop = myDiv.height() / 2;
      var scrollLeft = myDiv.width() / 2;
      myDiv.animate({
        scrollTop: scrollTop,
        scrollLeft: scrollLeft
      });
    }

    $("#update").on("click", function() {
      app.start = false;
      app.data = [];
      app.count = 0;
      if (app.checkConnection()) {
        app.getTotal(app.load);
      } else {
        navigator.notification.alert('No hay una conexión a internet!', function() {
          app.onDeviceReady();
        }, 'Atención', 'Reintentar');
      }
    });

    $(".share").on("click", function(e) {
      console.log("btnsEvents: Convirtiendo a canvas!");

      app.showLoadingBox("Descargando gráfico!");

      var pageID = $(this).parents('[data-role="page"]').prop("id");
      /*  var content = $('#' + pageID + ' [data-role="content"] > div'); */
      var title = $('#' + pageID + ' .Title-Size').text();
      var chartType = $(this).data("chart");
      var canvasObj;

      if (chartType === "table") {
        html2canvas($(".table-cont"), {
          onrendered: function(canvas) {
            canvasObj = canvas;
          }
        });
      } else {
        canvasObj = document.createElement("canvas");
        canvg(canvasObj, $("#" + chartType + " svg").clone().wrap('<div/>').parent().html());
      }

      setTimeout(function() {
        switch (device.platform) {
          case "Android":
            console.log("Compartiendo en Android!");
            var social = window.plugins.social;
            social.share(title, canvasObj);
            //          document.body.appendChild(canvasObj);
            break;
          case "iOS":
            console.log("Compartiendo en iOS!");
            var social = window.plugins.social;
            social.share(title, 'http://www.minsalud.gov.co', canvasObj);
            //          document.body.appendChild(canvasObj);
            break;
        }
        app.hideLoadingBox();
      }, 3000);
    });

    $(".btn_secundario").on("click", function(e) {
      console.log("btnsEvents: Validando si hay un indicador!");
      if (app.selection.indicador.cols.idindicador[0]) {
        var graph = $(this).data("graph");
        cb(app.chart[graph]);
        //app.openDB(app.chart[$this.data("graph")]);
      } else {
        navigator.notification.alert(
          'Debe seleccionar un indicador de salud!', function() {
            $.mobile.changePage("#home");
          },
          'Atención',
          'Aceptar');
      }
    });

    $("#reset").on("click", function(e) {
      //$("#paisReferente").html("");
      //$("#maps-slider").val(0);
      // if (app["dataTable"] === "object") {
      //   app.dataTable.fnClearTable(1);
      //   app.dataTable.fnDestroy();  
      // }
      // $("#dtable").empty();
      $.each(app.selection, function(k1, v1) {
        $.each(v1['cols'], function(k2, v2) {
          app.selection[k1]['cols'][k2] = [];
        });
      });
    });
  },

  sliderEvents: function(chart) {
    chart();
    console.log("sliderEvents: Asignando eventos a sliders!");
    var sliders = ["#pie-slider", "#maps-slider"];
    $.each(sliders, function(k, v) {
      $(document).on("slidestop", v, function() {
        chart();
      });
    });
  },

  pageEvents: function() {
    console.log("pageEvents: Asignando eventos a las páginas!");
    var pages = ["home", "ubicaciones", "demografia"];
    $.each(pages, function(k, v) {
      $("#" + v).on("pagebeforeshow", function() {
        if (v === "home") {
          $("select#options").prop('selectedIndex', 0).selectmenu("refresh");
        }
        $(window).off('scroll');
        app.openDB(app.queryDB[v]);
      });
    });

    $("#table").on("pageshow", function() {
      $(".table-cont").scrollTo("100%", {
        duration: 1500,
        onAfter: function() {
          $(".table-cont").scrollTo(0, {
            duration: 1000
          });
        }
      });
    });
  },

  createFile: function(fileName, dataURI) {
    console.log("createFile: Escribiendo " + fileName + "!");

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, FSfail);

    function gotFS(fileSystem) {
      fileSystem.root.getFile(fileName, {
        create: true,
        exclusive: false
      }, gotFileEntry, FSfail);
    }

    function gotFileEntry(fileEntry) {
      var localPath = fileEntry.fullPath;
      if (device.platform === "Android" && localPath.indexOf("file://") === 0) {
        localPath = localPath.substring(7);
      }

      var ft = new FileTransfer();
      ft.download(dataURI, localPath, function(entry) {
        app.hideLoadingBox();
      }, FSfail);
    }

    // function gotFileWriter(writer) {
    //   writer.onwriteend = function(evt) {
    //     console.log("createFile: Imagen guardada con exito!");
    //   };
    //   var reader = new FileReader();
    //   reader.onloadend = function(evt) {
    //     if (evt.target.readyState == FileReader.DONE) {
    //       writer.write(evt.target.result);
    //     }
    //   };
    //   reader.readAsBinaryString(blob);
    // }

    function FSfail(error) {
      console.log("FSfail: Opps! " + error.code);
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

    if (app.checkConnection()) {
      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);

      var script = document.createElement("script");
      script.src = "https://www.google.com/jsapi?callback=app.googleVisualization";
      script.type = "text/javascript";
      document.getElementsByTagName("head")[0].appendChild(script);

      script.addEventListener("error", function(e) {
        console.log("Error: " + e);
      }, false);
    } else {
      navigator.notification.alert('No hay una conexión a internet, el mapa no podrá funcionar correctamente!', function() {
        $('[data-graph="maps"]').addClass("ui-disabled");
        $('[data-graph="maps"]').on("click", function(e) {
          e.preventDefault();
        });
      }, 'Atención', 'Aceptar');
    }

    cb();
  },

  startApp: function() {
    console.log("startApp: Iniciando estructura de la applicación!");
    if (app.checkUpdatedData()) {
      setTimeout(function() {
        $.mobile.changePage("#home");
      }, 4000);
    } else {
      app.getTotal(app.load);
    }
  },

  getTotal: function(cb) {
    var url = "http://servicedatosabiertoscolombia.cloudapp.net/v1/Ministerio_de_Salud/indicadoresdesalud/consecutivo?$top=1&$orderby=consecutivo%20desc&$format=json";
    var xhr = app.getJson2(url);
    app.total = 0;
    app.count = 0;
    app.totalCount = 0;
    app.totalCount2 = 1000;
    xhr.success(function(r) {
      app.totalCount = parseInt(r.d[0]["consecutivo"]);
      app.total = parseInt(r.d[0]["consecutivo"]);
    });

    cb();
  },

  checkUpdatedData: function() {
    console.log("checkUpdatedData: Comprobando si los datos están actualizados!");
    var s = new Date();
    s.setMonth(s.getMonth() - 6);
    var updated = window.localStorage.getItem("updated");
    var u = new Date(updated);
    if (updated && u > s) {
      console.log("checkUpdatedData: Los datos están actualizados! " + updated);
      $("#date").html("<strong>" + updated + "</strong>");
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
      app.totalCount -= 1000;
      if (app.totalCount > 1000) {
        app.totalCount2 = 1000;
      } else {
        app.totalCount2 = app.totalCount; 
      }
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

  getJson2: function(url) {
    return $.ajax({
      type: "GET",
      url: url,
      dataType: 'json'
    });
  },

  getJson: function(url) {
    return $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
      error: function() {
        navigator.notification.alert('El repositorio de datos Open Data no está disponible ó se ha perdido la conexión con la red, inténtalo más tarde!', function() {
          app.load();
        }, 'Atención', 'Reintentar');
      },
      progress: function(evt) {
        if (evt.lengthComputable) {
          var unit = app.totalCount2 / evt.total;
          cant = parseInt(unit * evt.loaded, 10) + app.count;
          porcentaje = parseInt((cant / app.total * 100), 10);
          app.progressBar(porcentaje, $("#progressBar"));
          $("#progressLabel").html("Cargando " + cant + " de " + app.total + " registros!");
        } else {
          console.log("Length not computable.");
        }
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

    console.log("populateDB: Insertando registros en la tabla datos!");
    for (var j = 0; j < fields.length; j++) {
      tx.executeSql('INSERT INTO columnNames(columnName) VALUES ("' + fields[j] + '")');
    }

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
    $("#date").html("<strong>" + updated + "</strong>");
    if (app.start) {
      $.mobile.changePage("#help_step1");
    } else {
      $.mobile.changePage("#home");
    }
    
  },

  yea: function(tx, results) {
    for (var j = 0; j < results.rows.length; j++) {
      app.years.push(results.rows.item(j).columnName.substring(3));
    }
  },

  openDB: function(q) {
    console.log("openDB: Abriendo base de datos!");
    app.showLoadingBox("Abriendo base de datos!");
    var db = window.openDatabase("saludatos", "1.0", "Saludatos", 3145728);
    db.transaction(q, app.errorCB);
  },

  queryDB: {
    home: function(tx) {

      console.log("queryDB: Consultas!");
      app.showLoadingBox("Consultando!");

      tx.executeSql('SELECT COUNT(*) AS counter FROM (' + app.buildSQL() + ')', [], reg, app.errorCB);
      app.years = [];
      tx.executeSql('SELECT DISTINCT columnName FROM columnNames WHERE columnName LIKE "yea%"', [], app.yea, app.errorCB);

      tx.executeSql("SELECT DISTINCT iddepto, nomdepto FROM (" + app.buildSQL() + ") WHERE nomdepto <> ''  AND iddepto <> '170' AND iddepto <> '09' AND iddepto <> '75' GROUP BY iddepto ORDER BY nomdepto", [], function(tx, results) {
        app.counters["counter-dep"] = results.rows.length;
      }, app.errorCB);

      tx.executeSql("SELECT DISTINCT idmpio, nommpio FROM (" + app.buildSQL() + ") WHERE nommpio <> '' GROUP BY idmpio ORDER BY nommpio", [], function(tx, results) {
        app.counters["counter-mun"] = results.rows.length;
      }, app.errorCB);

      function reg(tx, results) {
        app.counters["counter-reg"] = results.rows.item(0).counter;
        console.log("COUNTER: >>>>>>>>>>>>>>>>>>>>>>>> " + results.rows.item(0).counter);
      }

      app.ent.indicador(tx, "SELECT DISTINCT idindicador, nomindicador FROM (" + app.buildSQL() + ") WHERE nomindicador <> '' GROUP BY idindicador ORDER BY nomindicador", function(tx) {
        $.each(app.counters, function(k, v) {
          app.counterAnim("#" + k, v);
        });
        app.hideLoadingBox();
      });
    },
    ubicaciones: function(tx) {

      console.log("queryDB: Consultas!");
      app.showLoadingBox("Consultando!");

      // app.ent.pais(tx, "SELECT DISTINCT iddepto, nomdepto FROM (" + app.buildSQL() + ") WHERE nomdepto <> '' AND iddepto = '170' OR iddepto = '09' OR iddepto = '75' GROUP BY iddepto ORDER BY nomdepto");
      // app.ent.region(tx, "SELECT DISTINCT idregion, nomregion FROM (" + app.buildSQL() + ") WHERE nomregion <> '' GROUP BY idregion ORDER BY nomregion");
      // app.ent.subregion(tx, "SELECT DISTINCT idsubregion, nomsubregion FROM (" + app.buildSQL() + ") WHERE nomsubregion <> '' GROUP BY idsubregion ORDER BY nomsubregion");
      // app.ent.departamento(tx, "SELECT DISTINCT iddepto, nomdepto FROM (" + app.buildSQL() + ") WHERE nomdepto <> '' AND iddepto <> '170' AND iddepto <> '09' AND iddepto <> '75' GROUP BY iddepto ORDER BY nomdepto");
      // app.ent.municipio(tx, "SELECT DISTINCT idmpio, nommpio FROM (" + app.buildSQL() + ") WHERE nommpio <> '' GROUP BY idmpio ORDER BY nommpio");
      // app.ent.zona(tx, "SELECT DISTINCT idzona, nomzona FROM (" + app.buildSQL() + ") WHERE nomzona <> '' GROUP BY idzona ORDER BY nomzona");
      // app.hideLoadingBox();

      app.ent.pais(tx, "SELECT DISTINCT iddepto, nomdepto FROM (" + app.buildSQL() + ") WHERE nomdepto <> '' AND iddepto = '170' OR iddepto = '09' OR iddepto = '75' GROUP BY iddepto ORDER BY nomdepto", function() {
        app.ent.region(tx, "SELECT DISTINCT idregion, nomregion FROM (" + app.buildSQL() + ") WHERE nomregion <> '' GROUP BY idregion ORDER BY nomregion", function() {
          app.ent.subregion(tx, "SELECT DISTINCT idsubregion, nomsubregion FROM (" + app.buildSQL() + ") WHERE nomsubregion <> '' GROUP BY idsubregion ORDER BY nomsubregion", function() {
            app.ent.departamento(tx, "SELECT DISTINCT iddepto, nomdepto FROM (" + app.buildSQL() + ") WHERE nomdepto <> '' AND iddepto <> '170' AND iddepto <> '09' AND iddepto <> '75' GROUP BY iddepto ORDER BY nomdepto", function() {
              app.ent.municipio(tx, "SELECT DISTINCT idmpio, nommpio FROM (" + app.buildSQL() + ") WHERE nommpio <> '' GROUP BY idmpio ORDER BY nommpio", function() {
                app.ent.zona(tx, "SELECT DISTINCT idzona, nomzona FROM (" + app.buildSQL() + ") WHERE nomzona <> '' GROUP BY idzona ORDER BY nomzona", function() {
                  app.hideLoadingBox();
                });
              });
            });
          });
        });
      });
    },
    demografia: function(tx) {

      console.log("queryDB: Consultas!");
      app.showLoadingBox("Consultando!");

      app.ent.educacion(tx, "SELECT DISTINCT ideducacion, nomeducacion FROM (" + app.buildSQL() + ") WHERE nomeducacion <> '' GROUP BY ideducacion ORDER BY nomeducacion", function(tx) {
        app.ent.ocupacion(tx, "SELECT DISTINCT idocupacion, nomocupacion FROM (" + app.buildSQL() + ") WHERE nomocupacion <> '' GROUP BY idocupacion ORDER BY nomocupacion", function(tx) {
          app.ent.edad(tx, "SELECT DISTINCT idedad, nomedad FROM (" + app.buildSQL() + ") WHERE nomedad <> '' GROUP BY idedad ORDER BY nomedad", function(tx) {
            app.ent.estadocivil(tx, "SELECT DISTINCT idestadocivil, nomestadocivil FROM (" + app.buildSQL() + ") WHERE nomestadocivil <> '' GROUP BY idestadocivil ORDER BY nomestadocivil", function(tx) {
              app.ent.sexo(tx, "SELECT DISTINCT idsexo, nomsexo FROM (" + app.buildSQL() + ") WHERE nomsexo <> '' GROUP BY idsexo ORDER BY nomsexo", function(tx) {
                app.ent.etnia(tx, "SELECT DISTINCT idetnia, nometnia FROM (" + app.buildSQL() + ") WHERE nometnia <> '' GROUP BY idetnia ORDER BY nometnia", function(tx) {
                  app.ent.eps(tx, "SELECT DISTINCT ideps, nomeps FROM (" + app.buildSQL() + ") WHERE nomeps <> '' GROUP BY ideps ORDER BY nomeps", function(tx) {
                    app.ent.ips(tx, "SELECT DISTINCT idips, nomips FROM (" + app.buildSQL() + ") WHERE nomips <> '' GROUP BY idips ORDER BY nomips", function(tx) {
                      app.ent.regimen(tx, "SELECT DISTINCT idregimen, nomregimen FROM (" + app.buildSQL() + ") WHERE nomregimen <> '' GROUP BY idregimen ORDER BY nomregimen", function(tx) {
                        app.hideLoadingBox();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    }
  },

  googleVisualization: function() {
    if (google && google.visualization) {
      console.log("googleVisualization: Librería graficos ya existe!");
    } else {
      console.log("googleVisualization: Cargando librería graficos!");
      google.load("visualization", "1", {
        packages: ['geochart'],
        callback: ok
      });
    }

    function ok() {
      console.log("googleVisualization: Librería google OK!");
    }
  },

  buildSQL: function(limit) {
    var selection = [];
    var sql = "SELECT * FROM datos ";

    $.each(app.selection, function(k1, v1) {
      var item = [];
      $.each(v1["cols"], function(k2, v2) {
        $.each(v2, function(k3, v3) {
          var val = {};
          val[k2] = v3;
          item.push(val);
        });
      });
      if (item[0]) {
        selection.push(item);
      }
    });

    $.each(selection, function(k1, v1) {
      if (k1 === 0) {
        sql += "WHERE ";
      } else {
        sql += " AND (";
      }
      $.each(v1, function(k2, v2) {
        if (k2 > 0) {
          sql += " OR ";
        }
        $.each(v2, function(k3, v3) {
          sql += k3 + " = " + "'" + v3 + "'";
        });
      });
      if (k1 !== 0) {
        sql += ")";
      }
    });

    if (typeof limit === "string") {
      sql += " LIMIT " + limit;
    }

    console.log("buildSQL: " + sql);
    return sql;
  },

  errorCB: function(tx, err) {
    console.log("errorCB: Opps!: " + err.code);
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
      default:
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
        app.selection[$checkbox.data("vista")]["cols"][$checkbox.data("col")] = [];
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
        app.selection[$checkbox.data("vista")]["cols"][$checkbox.data("col")] = [];
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

        var html = "<legend>Seleccione un indicador para evaluar:</legend> \n";
        for (var i = 0; i < len; i++) {
          html += '<input type="radio" name="indicador" data-col="idindicador" id="indicador-' + results.rows.item(i).idindicador + '" value="' + results.rows.item(i).idindicador + '" />';
          html += '<label for="indicador-' + results.rows.item(i).idindicador + '">' + results.rows.item(i).nomindicador + '</label>';
        }
        $(list).html(html).trigger('create');
        app.registerInputs(list, "radio");
        cb(tx);
      }
    },

    pais: function(tx, sql, cb) {

      console.log("ent.region: Construye paises!");

      tx.executeSql(sql, [], pais, app.errorCB);

      function pais(tx, results) {
        var list = "#paisList";
        var len = results.rows.length;

        var html = '<legend>Seleccione uno varias opciones para evaluar:</legend> \n';
        html += '<input name="selectall-pais" id="selectall-pais" data-vista="pais" data-col="iddepto" data-checkall="paisList" type="checkbox" /> \n';
        html += '<label for="selectall-pais">Seleccionar todos</label> \n';

        if (len === 0) {
          $("#paisBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#paisBtn").off();
        }
        $("#paisCount").html(len);

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="pais" data-col="iddepto" name="pais-' + results.rows.item(i).iddepto + '" id="pais-' + results.rows.item(i).iddepto + '" value="' + results.rows.item(i).iddepto + '"/>';
          html += '<label for="pais-' + results.rows.item(i).iddepto + '">' + results.rows.item(i).nomdepto + '</label>';
        }
        $(list).html(html).trigger('create');
        app.registerInputs(list, "checkbox");
        
        cb();
      }
    },

    region: function(tx, sql, cb) {

      console.log("ent.region: Construye regiones!");

      tx.executeSql(sql, [], region, app.errorCB);

      function region(tx, results) {
        var list = "#regList";
        var len = results.rows.length;

        var html = '<legend>Seleccione uno varias regiones para evaluar:</legend> \n';
        html += '<input name="selectall-region" id="selectall-region" data-vista="region" data-col="idregion" data-checkall="regList" type="checkbox" /> \n';
        html += '<label for="selectall-region">Seleccionar todos</label> \n';

        if (len === 0) {
          $("#regionBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#regionBtn").off();
        }
        $("#regionCount").html(len);

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="region" data-col="idregion" name="region-' + results.rows.item(i).idregion + '" id="region-' + results.rows.item(i).idregion + '" value="' + results.rows.item(i).idregion + '"/>';
          html += '<label for="region-' + results.rows.item(i).idregion + '">' + results.rows.item(i).nomregion + '</label>';
        }
        $(list).html(html).trigger('create');
        app.registerInputs(list, "checkbox");
        
        cb();
      }
    },

    subregion: function(tx, sql, cb) {

      console.log("ent.subregion: Construye subregiones!");

      tx.executeSql(sql, [], subregion, app.errorCB);

      function subregion(tx, results) {
        var list = "#subregList";
        var len = results.rows.length;
        var html = '<legend>Seleccione uno varias subregiones para evaluar:</legend> \n';
        html += '<input name="selectall-subregion" id="selectall-subregion" data-vista="subregion" data-col="idsubregion" data-checkall="subregList" type="checkbox" /> \n';
        html += '<label for="selectall-subregion">Seleccionar todos</label> \n';
        if (len === 0) {
          $("#subregionCount").html("PROXIMAMENTE");
          $("#subregionBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#subregionCount").html(len);
          $("#subregionBtn").off();
        }
        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="subregion" data-col="idsubregion" name="subregion-' + results.rows.item(i).idsubregion + '" id="subregion-' + results.rows.item(i).idsubregion + '" value="' + results.rows.item(i).idsubregion + '"/>';
          html += '<label for="subregion-' + results.rows.item(i).idsubregion + '">' + results.rows.item(i).nomsubregion + '</label>';
        }
        $(list).html(html).trigger('create');
        app.registerInputs(list, "checkbox");
        
        cb();
      }
    },

    departamento: function(tx, sql, cb) {

      app["scroll"] = false;

      console.log("ent.departamento: Construye departamentos!");

      tx.executeSql(sql, [], departamento, app.errorCB);

      function departamento(tx, results) {
        var list = "#depList";
        var len = results.rows.length;
        var html = '<legend>Seleccione uno varios departamentos para evaluar:</legend> \n';
        html += '<input name="selectall-departamento" id="selectall-departamento" data-vista="departamento" data-col="iddepto" data-checkall="depList" type="checkbox" /> \n';
        html += '<label for="selectall-departamento">Seleccionar todos</label> \n';

        if (len === 0) {
          $("#departamentoBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#departamentoBtn").off();
        }
        $("#departamentoCount").html(len);

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="departamento" data-col="iddepto" name="departamento-' + results.rows.item(i).iddepto + '" id="departamento-' + results.rows.item(i).iddepto + '" value="' + results.rows.item(i).iddepto + '"/>';
          html += '<label for="departamento-' + results.rows.item(i).iddepto + '">' + results.rows.item(i).nomdepto + '</label>';
        }
        $(list).html(html).trigger('create');
        app.registerInputs(list, "checkbox");        

        cb();
      }

    },

    municipio: function(tx, sql, cb) {

      console.log("ent.municipio: Construye municipios!");      

      tx.executeSql(sql, [], municipio, app.errorCB);

      function municipio(tx, results) {
        var list = "#munList";
        var len = results.rows.length;
        var html = "<legend>Seleccione uno varios municipios para evaluar:</legend> \n";
        html += '<input name="selectall-municipio" id="selectall-municipio" data-vista="municipio" data-col="idmpio" data-checkall="munList" type="checkbox" /> \n';
        html += '<label for="selectall-municipio">Seleccionar todos</label>';

        if (len === 0) {
          $("#municipioBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#municipioBtn").off();
        }
        $("#municipioCount").html(len);

        if (len > 100) {
          var h = $(window).height();
          var unit = h / 30;
          var init = 0;
          draw(init, unit);

          $(window).on("scroll", function(e) {
            console.log(len);
            var st = $(this).scrollTop();
            if (unit <= len) {
              if (st >= h / 2) {
                h += $(window).height();
                draw(init, unit);
              }
            }
          });

          function draw(a, b) {
            for (var i = parseInt(a, 10); i < parseInt(b, 10); i++) {
              html += '<input type="checkbox" data-vista="municipio" data-col="idmpio" name="municipio-' + results.rows.item(i).idmpio + '" id="municipio-' + results.rows.item(i).idmpio + '" value="' + results.rows.item(i).idmpio + '"/> \n';
              html += '<label for="municipio-' + results.rows.item(i).idmpio + '">' + results.rows.item(i).nommpio + '</label> \n';
            }
            init = b;
            unit += $(window).height() / 30;
            $(list).html(html).trigger('create');
            app.registerInputs(list, "checkbox");
          }
        } else {
          $(window).off('scroll');
          for (var i = 0; i < len; i++) {
            html += '<input type="checkbox" data-vista="municipio" data-col="idmpio" name="municipio-' + results.rows.item(i).idmpio + '" id="municipio-' + results.rows.item(i).idmpio + '" value="' + results.rows.item(i).idmpio + '"/> \n';
            html += '<label for="municipio-' + results.rows.item(i).idmpio + '">' + results.rows.item(i).nommpio + '</label> \n';
          }
          $(list).html(html).trigger('create');
          app.registerInputs(list, "checkbox");  
        }

        cb();        
      }

    },

    zona: function(tx, sql, cb) {

      console.log("ent.zona: Construye zonas!");

      tx.executeSql(sql, [], zona, app.errorCB);

      function zona(tx, results) {
        var list = "#zonList";
        var len = results.rows.length;
        var html = '<legend>Seleccione uno varias zonas para evaluar:</legend> \n';
        html += '<input name="selectall-zona" id="selectall-zona" data-vista="zona" data-col="idzona" data-checkall="zonList" type="checkbox" /> \n';
        html += '<label for="selectall-zona">Seleccionar todos</label>';
        if (len === 0) {
          $("#zonaCount").html("PROXIMAMENTE");
          $("#zonaBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#zonaCount").html(len);
          $("#zonaBtn").off();
        }
        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="zona" data-col="idzona" name="zona-' + results.rows.item(i).idzona + '" id="zona-' + results.rows.item(i).idzona + '" value="' + results.rows.item(i).idzona + '"/>';
          html += '<label for="zona-' + results.rows.item(i).idzona + '">' + results.rows.item(i).nomzona + '</label>';
        }
        $(list).html(html).trigger('create');
        app.registerInputs(list, "checkbox");
        
        cb();
      }

    },

    educacion: function(tx, sql, cb) {

      console.log("ent.educacion: Construye educaciones!");

      tx.executeSql(sql, [], educacion, app.errorCB);

      function educacion(tx, results) {
        var list = "#eduList";
        var len = results.rows.length;
        var html = '<legend>Seleccione uno varias categorías de educación:</legend> \n';
        html += '<input name="selectall-educacion" id="selectall-educacion" data-vista="educacion" data-col="ideducacion" data-checkall="eduList" type="checkbox" /> \n';
        html += '<label for="selectall-educacion">Seleccionar todos</label> \n';

        if (len === 0) {
          $("#educacionBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#educacionBtn").off();
        }
        $("#eduCount").html(len);

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="educacion" data-col="ideducacion" name="educacion-' + results.rows.item(i).ideducacion + '" id="educacion-' + results.rows.item(i).ideducacion + '" value="' + results.rows.item(i).ideducacion + '"/>';
          html += '<label for="educacion-' + results.rows.item(i).ideducacion + '">' + results.rows.item(i).nomeducacion + '</label>';
        }
        $(list).html(html).trigger('create');
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
        var html = '<legend>Seleccione uno varias categorías de ocupación:</legend>\n';
        html += '<input name="selectall-ocupacion" id="selectall-ocupacion" data-vista="ocupacion" data-col="idocupacion" data-checkall="ocuList" type="checkbox" />\n';
        html += '<label for="selectall-ocupacion">Seleccionar todos</label>\n';

        if (len === 0) {
          $("#ocupacionBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#ocupacionBtn").off();
        }
        $("#ocuCount").html(len);

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="ocupacion" data-col="idocupacion" name="ocupacion-' + results.rows.item(i).idocupacion + '" id="ocupacion-' + results.rows.item(i).idocupacion + '" value="' + results.rows.item(i).idocupacion + '"/>';
          html += '<label for="ocupacion-' + results.rows.item(i).idocupacion + '">' + results.rows.item(i).nomocupacion + '</label>';
        }
        $(list).html(html).trigger('create');
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
        var html = '<legend>Seleccione uno varias categorías de edad:</legend>\n';
        html += '<input name="selectall-edad" id="selectall-edad" data-vista="edad" data-col="idedad" data-checkall="edaList" type="checkbox" /> \n';
        html += '<label for="selectall-edad">Seleccionar todos</label> \n';

        if (len === 0) {
          $("#edadBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#edadBtn").off();
        }
        $("#edaCount").html(len);

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="edad" data-col="idedad" name="edad-' + results.rows.item(i).idedad + '" id="edad-' + results.rows.item(i).idedad + '" value="' + results.rows.item(i).idedad + '"/>';
          html += '<label for="edad-' + results.rows.item(i).idedad + '">' + results.rows.item(i).nomedad + '</label>';
        }
        $(list).html(html).trigger('create');
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
        var html = '<legend>Seleccione uno varias categorías de estado civil:</legend> \n';
        html += '<input name="selectall-estadocivil" id="selectall-estadocivil" data-vista="estadocivil" data-col="idestadocivil" data-checkall="estList" type="checkbox" /> \n';
        html += '<label for="selectall-estadocivil">Seleccionar todos</label> \n';

        if (len === 0) {
          $("#estadocivilBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#estadocivilBtn").off();
        }
        $("#estCount").html(len);

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="estadocivil" data-col="idestadocivil" name="estadocivil-' + results.rows.item(i).idestadocivil + '" id="estadocivil-' + results.rows.item(i).idestadocivil + '" value="' + results.rows.item(i).idestadocivil + '"/>';
          html += '<label for="estadocivil-' + results.rows.item(i).idestadocivil + '">' + results.rows.item(i).nomestadocivil + '</label>';
        }
        $(list).html(html).trigger('create');
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
        var html = '<legend>Seleccione uno varias categorías de género:</legend> \n';
        html += '<input name="selectall-genero" id="selectall-genero" data-vista="sexo" data-col="idsexo" data-checkall="genList" type="checkbox" /> \n';
        html += '<label for="selectall-genero">Seleccionar todos</label> \n';

        if (len === 0) {
          $("#generoBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#generoBtn").off();
        }
        $("#genCount").html(len);

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="sexo" data-col="idsexo" name="genero-' + results.rows.item(i).idsexo + '" id="genero-' + results.rows.item(i).idsexo + '" value="' + results.rows.item(i).idsexo + '"/>';
          html += '<label for="genero-' + results.rows.item(i).idsexo + '">' + results.rows.item(i).nomsexo + '</label>';
        }
        $(list).html(html).trigger('create');
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
        var html = '<legend>Seleccione uno varias categorías de etnia:</legend> \n';
        html += '<input name="selectall-etnia" id="selectall-etnia" data-vista="etnia" data-col="idetnia" data-checkall="etnList" type="checkbox" /> \n';
        html += '<label for="selectall-etnia">Seleccionar todos</label> \n';
        if (len === 0) {
          $("#etnCount").html("PROXIMAMENTE");
          $("#etniaBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#etnCount").html(len);
          $("#etniaBtn").off();
        }

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="etnia" data-col="idetnia" name="etnia-' + results.rows.item(i).idetnia + '" id="etnia-' + results.rows.item(i).idetnia + '" value="' + results.rows.item(i).idetnia + '"/>';
          html += '<label for="etnia-' + results.rows.item(i).idetnia + '">' + results.rows.item(i).nometnia + '</label>';
        }
        $(list).html(html).trigger('create');
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
        var html = '<legend>Seleccione uno varias EPS:</legend> \n';
        html += '<input name="selectall-eps" id="selectall-eps" data-vista="eps" data-col="ideps" data-checkall="epsList" type="checkbox" /> \n';
        html += '<label for="selectall-eps">Seleccionar todos</label> \n';

        if (len === 0) {
          $("#epsCount").html("PROXIMAMENTE");
          $("#epsBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#epsCount").html(len);
          $("#epsBtn").off();
        }

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="eps" data-col="ideps" name="eps-' + results.rows.item(i).ideps + '" id="eps-' + results.rows.item(i).ideps + '" value="' + results.rows.item(i).ideps + '"/>';
          html += '<label for="eps-' + results.rows.item(i).ideps + '">' + results.rows.item(i).nomeps + '</label>';
        }
        $(list).html(html).trigger('create');
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
        var html = '<legend>Seleccione uno varias IPS:</legend> \n';
        html += '<input name="selectall-ips" id="selectall-ips" data-vista="ips" data-col="idips" data-checkall="ipsList" type="checkbox" /> \n';
        html += '<label for="selectall-ips">Seleccionar todos</label> \n';
        if (len === 0) {
          $("#ipsCount").html("PROXIMAMENTE");
          $("#ipsBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#ipsCount").html(len);
          $("#ipsBtn").off();
        }

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="ips" data-col="idips" name="ips-' + results.rows.item(i).idips + '" id="ips-' + results.rows.item(i).idips + '" value="' + results.rows.item(i).idips + '"/>';
          html += '<label for="ips-' + results.rows.item(i).idips + '">' + results.rows.item(i).nomips + '</label>';
        }
        $(list).html(html).trigger('create');
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
        var html = '<legend>Seleccione uno varias categorías de régimen:</legend> \n';
        html += '<input name="selectall-regimen" id="selectall-regimen" data-vista="regimen" data-col="idregimen" data-checkall="regimenList" type="checkbox" /> \n';
        html += '<label for="selectall-regimen">Seleccionar todos</label> \n';

        if (len === 0) {
          $("#regiCount").html("PROXIMAMENTE");
          $("#regimenBtn").on("click", function(e) {
            e.preventDefault();
          });
        } else {
          $("#regiCount").html(len);
          $("#regimenBtn").off();
        }

        for (var i = 0; i < len; i++) {
          html += '<input type="checkbox" data-vista="regimen" data-col="idregimen" name="regimen-' + results.rows.item(i).idregimen + '" id="regimen-' + results.rows.item(i).idregimen + '" value="' + results.rows.item(i).idregimen + '"/>';
          html += '<label for="regimen-' + results.rows.item(i).idregimen + '">' + results.rows.item(i).nomregimen + '</label>';
        }
        $(list).html(html).trigger('create');
        app.registerInputs(list, "checkbox");
        cb(tx);
      }

    }
  },

  chart: {

    pie: function() {

      var datatoprint = [];
      var regiones = [];
      var subregiones = [];
      var departamentos = [];
      var municipios = [];
      var zonas = [];
      var geograficas = [];
      var theseries = [];
      var thecategories = [];
      var yearstoprint = [];

      //Determinan que tipos de ubicaciones geográficas se mostrarán en el gráfico


      for (c = 0; c < app.years.length; c++) {
        yearstoprint.push(false);
      }

      app.openDB(query);

      function query(tx) {

        tx.executeSql(app.buildSQL(), [], printData, app.errorCB);

        function printData(tx, results) {

          for (a = 0; a < app.years.length; a++) {


            for (b = 0; b < results.rows.length; b++) {
              var row = results.rows.item(b);
              if (row["yea" + app.years[a]] !== '' && row["yea" + app.years[a]] !== '-' && row["yea" + app.years[a]] !== null && parseFloat(row["yea" + app.years[a]]) !== 0.0) {
                yearstoprint[a] = true;
              }

            }

          }

          console.log("AÑOS A IMPRIMIR: ");
          for (d = 0; d < app.years.length; d++) {
            if (yearstoprint[d]) {
              thecategories.push(app.years[d]);
              console.log(app.years[d] + ",");
            }
          }
          console.log("LAS CATEGORIAS");
          for (e = 0; e < thecategories.length; e++) {
            console.log(thecategories[e] + ",");
          }

          $("#pie-slider").prop({
            min: 0,
            max: thecategories.length - 1
          });

          var theyear = thecategories[$("#pie-slider").val()];

          $("#pie-slider-label").html(theyear);

          var indicator = results.rows.item(0).idindicador;
          var printstate = true;
          var printtown = true;
          var printzone = true;
          var printregion = true;
          var printsubregion = true;
          var printdemographic = true;

          for (var j = 0; j < results.rows.length; j++) {
            var dataresults = results.rows.item(j);

            if (!(isNaN(parseFloat(dataresults["yea" + theyear]))) && parseFloat(dataresults["yea" + theyear]) !== 0.0) {
              var thestring = [];
              thestring = dataresults["nomregimen"] + dataresults["nomeps"] + dataresults["nomips"] + dataresults["nomregimen"] + dataresults["nomeducacion"] + dataresults["nomocupacion"] + dataresults["nomsexo"] + dataresults["nometnia"] + dataresults["nomedad"] + dataresults["nomestadocivil"];
              var thelocation = [];
              thelocation = dataresults["nommpio"] + dataresults["nomdepto"] + dataresults["nomzona"] + dataresults["nomsubregion"] + dataresults["nomregion"];

              if (dataresults["nommpio"] !== null && dataresults["nommpio"] !== '' && dataresults["nommpio"] !== '-' && printtown) {
                datatoprint.push([results.rows.item(j).nommpio + " " + thestring, parseFloat(dataresults["yea" + theyear])]);
                printstate = false;
                console.log("Ubicacion " + results.rows.item(j).nommpio + " valor: " + parseFloat(dataresults["yea" + theyear]))
              } else if (dataresults["nomdepto"] !== null && dataresults["nomdepto"] !== '' && dataresults["nomdepto"] !== '-' && printstate) {
                datatoprint.push([results.rows.item(j).nomdepto + " " + thestring, parseFloat(dataresults["yea" + theyear])]);
                console.log("Ubicacion " + results.rows.item(j).nomdepto + " valor: " + parseFloat(dataresults["yea" + theyear]))
              } else if (dataresults["nomzona"] !== null && dataresults["nomzona"] !== '' && dataresults["nomzona"] !== '-' && printzone) {
                datatoprint.push([results.rows.item(j).nomzona + " " + thestring, parseFloat(dataresults["yea" + theyear])]);
                console.log("Ubicacion " + results.rows.item(j).nomzona + " valor: " + parseFloat(dataresults["yea" + theyear]))
              } else if (dataresults["nomsubregion"] !== null && dataresults["nomsubregion"] !== '' && dataresults["nomsubregion"] !== '-' && printsubregion) {
                datatoprint.push([results.rows.item(j).nomsubregion + " " + thestring, parseFloat(dataresults["yea" + theyear])]);
                console.log("Ubicacion " + results.rows.item(j).nomsubregion + " valor: " + parseFloat(dataresults["yea" + theyear]))
                printregion = false;
              } else if (dataresults["nomregion"] !== null && dataresults["nomregion"] !== '' && dataresults["nomregion"] !== '-' && printregion) {
                datatoprint.push([results.rows.item(j).nomregion + " " + thestring, parseFloat(dataresults["yea" + theyear])]);

                console.log("Ubicacion " + results.rows.item(j).nomregion + " valor: " + parseFloat(dataresults["yea" + theyear]))
              } else if (printdemographic) {

                datatoprint.push([thelocation + " " + thestring, parseFloat(dataresults["yea" + theyear])]);

              }

            }
          }

          $("#pie .Title-Size").html(results.rows.item(0).nomindicador + " - Año " + theyear);
          var chart = new Highcharts.Chart({
            chart: {
              renderTo: 'piechartdiv',
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              // spacingTop: 10,
              height: app.homeheight,
              borderRadius: 0,
              width: $($("#piechartdiv").parents()[1]).width()
            },
            exporting: {
              enabled: false
            },
            credits: {
              enabled: false
            },
            legend: {
              align: "center",
              verticalAlign: "top",
              x: 0,
              y: 20,
              borderWidth: 1,
              margin: 20 //define el espacio entre el legend y la zona de grafico
            },
            title: {
              text: "",
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
                showInLegend: true
              }
            },

            tooltip: {
              //pointFormat: '{series.name}: <b>{point.percentage:.1f}</b>'
            },

            series: [{
              type: 'pie',
              name: results.rows.item(0).nomunidad,
              data: datatoprint
            }]
          });
          app.hideLoadingBox();
        }
      }
    },

    lineal: function() {

      // if (app.selection.departamento.cols.iddepto.length > 0 && app.selection.departamento.cols.iddepto.indexOf("170") === -1) {
      //   app.selection.departamento.cols.iddepto.push("170");
      // }

      app.openDB(query);

      function query(tx) {

        tx.executeSql(app.buildSQL(), [], printData, app.errorCB);
        var datatoprint = [];
        //var theyear = [];
        var regiones = [];
        var subregiones = [];
        var departamentos = [];
        var municipios = [];
        var zonas = [];
        var geograficas = [];
        var theseries = [];
        var thecategories = [];
        var yearstoprint = [];

        //Determinan que tipos de ubicaciones geográficas se mostrarán en el gráfico
        var printstate = true;
        var printtown = true;
        var printzone = true;
        var printregion = true;
        var printsubregion = true;


        for (c = 0; c < app.years.length; c++) {
          yearstoprint.push(false);
        }

        function printData(tx, results, theyear) {

          var indicator = results.rows.item(0).idindicador;
          console.log("El indicador fué: " + indicator);
          console.log("El número de resultados fué: " + results.rows.length);
          console.log("Consulta realizada");
          console.log("Numero de resultados de la consulta " + results.rows.length);
          console.log("Indicador para insertar datos en el gráfico:" + indicator);


          //Verificar años para cuáles hay datos


          for (a = 0; a < app.years.length; a++) {


            for (b = 0; b < results.rows.length; b++) {
              var row = results.rows.item(b);
              if (row["yea" + app.years[a]] !== null && row["yea" + app.years[a]] !== '') {
                yearstoprint[a] = true;
              }

            }

          }

          // Insertar las categorias segun los años que tienen datos

          console.log("AÑOS A IMPRIMIR: ");
          for (d = 0; d < app.years.length; d++) {
            if (yearstoprint[d]) {
              thecategories.push(app.years[d]);
              console.log(app.years[d] + ",");
            }
          }
          console.log("LAS CATEGORIAS");
          for (e = 0; e < thecategories.length; e++) {
            console.log(thecategories[e] + ",");
          }

          // Inserción de datos en la serie

          for (var p = 0; p < results.rows.length; p++) {
            var dataresults = results.rows.item(p);
            var serie = {};
            var rowdata = [];


            var thestring = [];
            thestring = dataresults["nomregimen"] + dataresults["nomeps"] + dataresults["nomips"] + dataresults["nomregimen"] + dataresults["nomeducacion"] + dataresults["nomocupacion"] + dataresults["nomsexo"] + dataresults["nometnia"] + dataresults["nomedad"] + dataresults["nomestadocivil"];
            var thelocation = [];
            thelocation = dataresults["nommpio"] + dataresults["nomdepto"] + dataresults["nomzona"] + dataresults["nomsubregion"] + dataresults["nomregion"];

            //Verificacion de Regiones

            if (dataresults["nomregion"] !== null && dataresults["nomregion"] !== '' && printregion) {
              console.log(" Region" + p + ": " + dataresults["nomregion"]);
              departamentos.push(dataresults["nomregion"]);
              geograficas.push(dataresults["nomregion"]);
              console.log("Numero de años:" + app.years.length);
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nomregion"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            }


            //Verificacion de Subregiones
            else if (dataresults["nomsubregion"] !== null && dataresults["nomsubregion"] !== '' && printsubregion) {
              console.log(" Subregion" + p + ": " + dataresults["nomsubregion"]);
              departamentos.push(dataresults["nomsubregion"]);
              geograficas.push(dataresults["nomsubregion"]);
              console.log("Numero de años:" + app.years.length);
              for (var z = 0; z < app.years.length; z++) {
                if (yearstoprint[z]) {
                  if (dataresults["yea" + app.years[z]] !== '' && dataresults["yea" + app.years[z]] !== null && dataresults["yea" + app.years[z]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[z]]));
                    console.log(z + " Año " + app.years[z] + " :" + dataresults["yea" + app.years[z]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nomsubregion"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            }

            //Verificación de municipios
            else if (dataresults["nommpio"] !== null && dataresults["nommpio"] !== '' && printtown) {
              printstate = false;
              console.log(" Municipio " + p + ": " + dataresults["nommpio"]);
              municipios.push(dataresults["nommpio"]);
              geograficas.push(dataresults["nommpio"]);
              console.log("Numero de años:" + app.years.length);
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nommpio"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            }


            //Verificación de departamentos
            else if (dataresults["nomdepto"] !== null && dataresults["nomdepto"] !== '' && printstate) {
              console.log(" Departamento " + p + ": " + dataresults["nomdepto"]);
              departamentos.push(dataresults["nomdepto"]);
              geograficas.push(dataresults["nomdepto"]);
              console.log("Numero de años:" + app.years.length);
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nomdepto"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            }

            //Verificación de zonas
            else if (dataresults["nomzona"] !== null && dataresults["nomzona"] !== '' && printzone) {
              console.log(" Zona " + p + ": " + dataresults["nomzona"]);
              municipios.push(dataresults["nomzona"]);
              geograficas.push(dataresults["nomzona"]);
              console.log("Numero de años:" + app.years.length);
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nomzona"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            } else {
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              serie["name"] = thestring + " " + thelocation;
              serie["data"] = rowdata;
              theseries.push(serie);
            }


            //FIN DE printData
          }

          //Datos para etiquetas en el gráfico
          var dataforlabels = results.rows.item(0);
          $("#lineal .Title-Size").html(results.rows.item(0).nomindicador);

          var chart = new Highcharts.Chart({
            chart: {
              renderTo: 'linealchartdiv',
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              height: app.homeheight,
              borderRadius: 0,
              width: $(document).width() - 5
              //              margin: [10, 10, 10, 10]
            },
            exporting: {
              enabled: false
            },
            credits: {
              enabled: false
            },
            title: {
              text: '',
              x: 20 //center
            },
            subtitle: {
              text: dataforlabels['fue' + [theyear]],
              x: -20
            },
            xAxis: {
              categories: thecategories,
              labels: {
                rotation: -45,
                align: 'right'
              }
            },
            yAxis: {
              title: {
                text: results.rows.item(0).nomunidad
              },
              min: 0,
              plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
              }]
            },
            tooltip: {
              //valueSuffix: '%'
            },
            legend: {
              align: "center",
              verticalAlign: "top",
              borderWidth: 1,
              //margin: 5,
              x: 15,
            },
            series: theseries


            //[{name:'Amazonas',data:[15.0,30]},{name:'Cundinamarca',data:[19.0,10]}]
          });

          app.hideLoadingBox();
        }


      }

    },

    bars: function() {

      // if (app.selection.departamento.cols.iddepto.length > 0 && app.selection.departamento.cols.iddepto.indexOf("170") === -1) {
      //   app.selection.departamento.cols.iddepto.push("170");
      // }

      app.openDB(query);

      function query(tx) {

        tx.executeSql(app.buildSQL(), [], printData, app.errorCB);
        var datatoprint = [];
        var regiones = [];
        var subregiones = [];
        var departamentos = [];
        var municipios = [];
        var zonas = [];
        var geograficas = [];
        var theseries = [];
        var thecategories = [];
        var yearstoprint = [];

        //Determinan que tipos de ubicaciones geográficas se mostrarán en el gráfico
        var printstate = true;
        var printtown = true;
        var printzone = true;
        var printregion = true;
        var printsubregion = true;


        for (c = 0; c < app.years.length; c++) {
          yearstoprint.push(false);
        }

        function printData(tx, results) {

          var indicator = results.rows.item(0).idindicador;
          console.log("El indicador fué: " + indicator);
          console.log("El número de resultados fué: " + results.rows.length);
          console.log("Consulta realizada");
          console.log("Numero de resultados de la consulta " + results.rows.length);
          console.log("Indicador para insertar datos en el gráfico:" + indicator);


          //Verificar años para cuáles hay datos


          for (a = 0; a < app.years.length; a++) {


            for (b = 0; b < results.rows.length; b++) {
              var row = results.rows.item(b);
              if (row["yea" + app.years[a]] !== null && row["yea" + app.years[a]] !== '') {
                yearstoprint[a] = true;
              }

            }

          }

          // Insertar las categorias segun los años que tienen datos

          console.log("AÑOS A IMPRIMIR: ");
          for (d = 0; d < app.years.length; d++) {
            if (yearstoprint[d]) {
              thecategories.push(app.years[d]);
              console.log(app.years[d] + ",");
            }
          }
          console.log("LAS CATEGORIAS");
          for (e = 0; e < thecategories.length; e++) {
            console.log(thecategories[e] + ",");
          }

          // Inserción de datos en la serie

          for (var p = 0; p < results.rows.length; p++) {
            var dataresults = results.rows.item(p);
            var serie = {};
            var rowdata = [];

            var thestring = [];
            thestring = dataresults["nomregimen"] + dataresults["nomeps"] + dataresults["nomips"] + dataresults["nomregimen"] + dataresults["nomeducacion"] + dataresults["nomocupacion"] + dataresults["nomsexo"] + dataresults["nometnia"] + dataresults["nomedad"] + dataresults["nomestadocivil"];
            var thelocation = [];
            thelocation = dataresults["nommpio"] + dataresults["nomdepto"] + dataresults["nomzona"] + dataresults["nomsubregion"] + dataresults["nomregion"];


            //Verificacion de Regiones

            if (dataresults["nomregion"] !== null && dataresults["nomregion"] !== '' && printregion) {
              console.log(" Region" + p + ": " + dataresults["nomregion"]);
              departamentos.push(dataresults["nomregion"]);
              geograficas.push(dataresults["nomregion"]);
              console.log("Numero de años:" + app.years.length);
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nomregion"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            }


            //Verificacion de Subregiones
            else if (dataresults["nomsubregion"] !== null && dataresults["nomsubregion"] !== '' && printsubregion) {
              console.log(" Subregion" + p + ": " + dataresults["nomsubregion"]);
              departamentos.push(dataresults["nomsubregion"]);
              geograficas.push(dataresults["nomsubregion"]);
              console.log("Numero de años:" + app.years.length);
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nomsubregion"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            }

            //Verificación de municipios
            else if (dataresults["nommpio"] !== null && dataresults["nommpio"] !== '' && printtown) {
              printstate = false;
              console.log(" Municipio " + p + ": " + dataresults["nommpio"]);
              municipios.push(dataresults["nommpio"]);
              geograficas.push(dataresults["nommpio"]);
              console.log("Numero de años:" + app.years.length);
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nommpio"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            }


            //Verificación de departamentos
            else if (dataresults["nomdepto"] !== null && dataresults["nomdepto"] !== '' && printstate) {
              console.log(" Departamento " + p + ": " + dataresults["nomdepto"]);
              departamentos.push(dataresults["nomdepto"]);
              geograficas.push(dataresults["nomdepto"]);
              console.log("Numero de años:" + app.years.length);
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nomdepto"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            }

            //Verificación de zonas
            else if (dataresults["nomzona"] !== null && dataresults["nomzona"] !== '' && printzone) {
              console.log(" Zona " + p + ": " + dataresults["nomzona"]);
              municipios.push(dataresults["nomzona"]);
              geograficas.push(dataresults["nomzona"]);
              console.log("Numero de años:" + app.years.length);
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              for (var q = 0; q < rowdata.length; q++) {
                console.log("Datos guardado " + rowdata[q]);
              }

              serie["name"] = dataresults["nomzona"] + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            } else {
              for (var l = 0; l < app.years.length; l++) {
                if (yearstoprint[l]) {
                  if (dataresults["yea" + app.years[l]] !== '' && dataresults["yea" + app.years[l]] !== null && dataresults["yea" + app.years[l]] !== '-') {
                    rowdata.push(parseFloat(dataresults["yea" + app.years[l]]));
                    console.log(l + " Año " + app.years[l] + " :" + dataresults["yea" + app.years[l]]);
                  } else {
                    rowdata.push(0.0);
                    console.log(l + " Año " + app.years[l] + " : 0");
                  }
                }
              }

              serie["name"] = thelocation + " " + thestring;
              serie["data"] = rowdata;
              theseries.push(serie);
            }

            //FIN DE printData
          }

          $("#bars .Title-Size").html(results.rows.item(0).nomindicador);
          var chart = new Highcharts.Chart({
            chart: {
              type: 'column',
              renderTo: 'columnchartdiv',
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              height: app.homeheight,
              borderRadius: 0,
              width: $(document).width()
            },
            exporting: {
              enabled: false
            },
            credits: {
              enabled: false
            },
            xAxis: {
              categories: thecategories,
              labels: {
                rotation: -45,
                align: 'right',
                style: {
                  fontSize: '13px',
                  fontFamily: 'Open Sans, sans-serif'
                }
              }
            },
            yAxis: {
              title: {
                text: results.rows.item(0).nomunidad
              },
              plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
              }]
            },
            legend: {
              align: "center",
              verticalAlign: "top",
              borderWidth: 0,
              //margin: 5,
              x: 10
            },
            title: {
              text: '',
              align: "center",
              x: 0,
              y: 10,
              floating: true
            },
            tooltip: {
              // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },

            series: theseries
          });

          chart.redraw();
          app.hideLoadingBox();
        }
      }
    },

    maps: function() {

      if (app.selection.departamento.cols.iddepto.length > 0 && app.selection.departamento.cols.iddepto.indexOf("170") === -1) {
        app.selection.departamento.cols.iddepto.push("170");
      }

      var datatoprint = [];
      var regiones = [];
      var subregiones = [];
      var departamentos = [];
      var municipios = [];
      var zonas = [];
      var geograficas = [];
      var theseries = [];
      var thecategories = [];
      var yearstoprint = [];

      //Determinan que tipos de ubicaciones geográficas se mostrarán en el gráfico
      var printstate = true;
      var printtown = true;
      var printzone = true;
      var printregion = true;
      var printsubregion = true;


      for (c = 0; c < app.years.length; c++) {
        yearstoprint.push(false);
      }

      app.openDB(query);

      function query(tx) {
        var sql = app.buildSQL();
        tx.executeSql(sql, [], printData, app.errorCB);

        function printData(tx, results) {

          for (a = 0; a < app.years.length; a++) {


            for (b = 0; b < results.rows.length; b++) {
              var row = results.rows.item(b);
              if (row["yea" + app.years[a]] !== null && row["yea" + app.years[a]] !== '') {
                yearstoprint[a] = true;
              }

            }

          }

          console.log("AÑOS A IMPRIMIR: ");
          for (d = 0; d < app.years.length; d++) {
            if (yearstoprint[d]) {
              thecategories.push(app.years[d]);
              console.log(app.years[d] + ",");
            }
          }
          console.log("LAS CATEGORIAS");
          for (e = 0; e < thecategories.length; e++) {
            console.log(thecategories[e] + ",");
          }

          var theyear = thecategories[$("#maps-slider").val()];

          var indicator = results.rows.item(0).idindicador;
          var nomindicador = results.rows.item(0).nomindicador;

          $("#maps .Title-Size").html(nomindicador);

          $("#maps-slider-label").html(theyear);

          $("#maps-slider").prop({
            min: 0,
            max: thecategories.length - 1
          });

          datatoprint.push(["Departamento", results.rows.item(0).nomunidad]);

          for (var j = 0; j < results.rows.length; j++) {
            var dataresults = results.rows.item(j);
            if (!(isNaN(parseFloat(dataresults["yea" + theyear])))) {

              if (dataresults["iddepto"] === "170") {
                $("#paisReferente").html("<strong>" + dataresults["nomdepto"] + ": </strong>" + parseFloat(dataresults["yea" + theyear]) + " " + dataresults["nomunidad"]);
              }


              if (dataresults["nommpio"] !== null && dataresults["nommpio"] !== '' && dataresults["nommpio"] !== '-' && printtown) {
                datatoprint.push([results.rows.item(j).nommpio, parseFloat(dataresults["yea" + theyear])]);
                //printstate = false;
                console.log("Ubicacion " + results.rows.item(j).nommpio + " valor: " + parseFloat(dataresults["yea" + theyear]))
              } else if (dataresults["nomdepto"] !== null && dataresults["nomdepto"] !== '' && dataresults["nomdepto"] !== '-' && printstate) {
                if(dataresults["iddepto"] === '170'){
                  datatoprint.push(["COLOMBIA", parseFloat(dataresults["yea" + theyear])]);
                }else{
                datatoprint.push([results.rows.item(j).nomdepto, parseFloat(dataresults["yea" + theyear])]);}
                console.log("Ubicacion " + results.rows.item(j).nomdepto + " valor: " + parseFloat(dataresults["yea" + theyear]))
              

              } else if (dataresults["nomzona"] !== null && dataresults["nomzona"] !== '' && dataresults["nomzona"] !== '-' && printzone) {
                datatoprint.push([results.rows.item(j).nomzona, parseFloat(dataresults["yea" + theyear])]);
                console.log("Ubicacion " + results.rows.item(j).nomzona + " valor: " + parseFloat(dataresults["yea" + theyear]))
              } else if (dataresults["nomsubregion"] !== null && dataresults["nomsubregion"] !== '' && dataresults["nomsubregion"] !== '-' && printsubregion) {
                datatoprint.push([results.rows.item(j).nomsubregion, parseFloat(dataresults["yea" + theyear])]);
                console.log("Ubicacion " + results.rows.item(j).nomsubregion + " valor: " + parseFloat(dataresults["yea" + theyear]))
                printregion = false;
              } else if (dataresults["nomregion"] !== null && dataresults["nomregion"] !== '' && dataresults["nomregion"] !== '-' && printregion) {
                datatoprint.push([results.rows.item(j).nomregion, parseFloat(dataresults["yea" + theyear])]);
                console.log("Ubicacion " + results.rows.item(j).nomregion + " valor: " + parseFloat(dataresults["yea" + theyear]))
              } else {

                datatoprint.push(["Colombia", parseFloat(dataresults["yea" + theyear])]);


              }

            }
          }
          app["mapdata"] = new google.visualization.arrayToDataTable(datatoprint);
          app["mapobj"] = new google.visualization.GeoChart(document.getElementById('geochartdiv'));
          app["mapopt"] = {
            tooltip : { trigger : 'none' },
            sizeAxis: { 
              minSize : 12
            },
            legend: 'none',
            region: 'CO',
            resolution: 'provinces',
            displayMode: 'markers',
            height: $(window).width(),
            width: $(window).width(),
            //keepAspectRatio: false,
             magnifyingGlass: {
               enable: "true",
               zoomFactor: "20.0"
             },
            backgroundColor: {
              fill: "transparent"
            },
            colors: [
              "#C23B22", "#FDFD96", "#77DD77",
              "#E90AA5", "#725263", "#1A9E03", "#55962E", "#C41B0D",
              "#1F6290", "#813D3A", "#054A44", "#E9A70C", "#6C0781",
              "#4A0BC9", "#C4AF1E", "#A23ED7", "#3B1D31", "#99EA07",
              "#B51C1E", "#6D20D4", "#F77254", "#A80B63", "#DFCBAD",
              "#262423", "#28159E", "#9861BC", "#56562B", "#9FB6B6",
              "#4EC62F", "#A58BB1", "#A4A156", "#DBC22E", "#DCE929"
            ]
          };

          
          app["mapobj"].draw(app["mapdata"], app["mapopt"]);

          google.visualization.events.addListener(app["mapobj"], 'select', function() {
            var message = '';
            var selection = app["mapobj"].getSelection();
            for (var i = 0; i < selection.length; i++) {
              var item = selection[i];
              if (item.row != null) {
                message += app["mapdata"].getValue(item.row, 0) + ": " + app["mapdata"].getValue(item.row, 1) + " " + app["mapdata"].getColumnLabel(1);
              } 
            }
            if (message == '') {
              message = 'Selecciona el marcador nuevamente!';
            }
            navigator.notification.alert(message, function() {}, nomindicador, 'Aceptar');
          });
        }
      }
      app.hideLoadingBox();

    },

    table: function() {

      // if (app.selection.departamento.cols.iddepto.length > 0 && app.selection.departamento.cols.iddepto.indexOf("170") === -1) {
      //   app.selection.departamento.cols.iddepto.push("170");
      // }

      if (typeof app.dataTable === "object") {
        app.dataTable.fnDestroy();
        $("#dtable").empty();
      }

      app.openDB(query);

      function query(tx) {

        tx.executeSql(app.buildSQL(), [], buildTable, app.errorCB);

        function buildTable(tx, results) {

          $("#table .Title-Size").html(results.rows.item(0).nomindicador);

          var indicator = results.rows.item(0).idindicador;

          checkYears(printYears, categories, dataset);

          function checkYears(cb1, cb2, cb3) {
            app["colums"] = [];
            app["tabledata"] = [];

            console.log("chart.table: checkYears");
            var yearstoprint = [];
            for (c = 0; c < app.years.length; c++) {
              yearstoprint.push(false);
            }

            for (a = 0; a < app.years.length; a++) {
              for (b = 0; b < results.rows.length; b++) {
                var row = results.rows.item(b);
                if (row["yea" + app.years[a]] !== null && row["yea" + app.years[a]] !== '') {
                  yearstoprint[a] = true;
                }
              }
            }
            cb1(yearstoprint, cb2, cb3);

          }



          function printYears(yearstoprint, cb1, cb2) {
            console.log("chart.table: printYears");
            var thecategories = [];
            for (d = 0; d < app.years.length; d++) {
              if (yearstoprint[d]) {
                thecategories.push(app.years[d]);
              }
            }
            cb1(thecategories, yearstoprint, cb2);
          }

          function categories(thecategories, yearstoprint, cb) {
            console.log("chart.table: categories");
            var theseries = [];
            var datatoprint = [];
            var regiones = [];
            var subregiones = [];
            var departamentos = [];
            var municipios = [];
            var zonas = [];
            var geograficas = [];

            //Determinan que tipos de ubicaciones geográficas se mostrarán en el gráfico
            var printstate = true;
            var printtown = true;
            var printzone = true;
            var printregion = true;
            var printsubregion = true;

            for (var p = 0; p < results.rows.length; p++) {
              var dataresults = results.rows.item(p);
              var serie = {};
              var rowdata = [];


              var thestring = [];
              thestring = dataresults["nomregimen"] + dataresults["nomeps"] + dataresults["nomips"] + dataresults["nomregimen"] + dataresults["nomeducacion"] + dataresults["nomocupacion"] + dataresults["nomsexo"] + dataresults["nometnia"] + dataresults["nomedad"] + dataresults["nomestadocivil"];
              var thelocation = [];
              thelocation = dataresults["nommpio"] + dataresults["nomdepto"] + dataresults["nomzona"] + dataresults["nomsubregion"] + dataresults["nomregion"];


              //Verificacion de Regiones

              if (dataresults["nomregion"] !== null && dataresults["nomregion"] !== '' && printregion) {
                departamentos.push(dataresults["nomregion"]);
                geograficas.push(dataresults["nomregion"]);
                for (var l = 0; l < app.years.length; l++) {
                  if (yearstoprint[l]) {
                    
                      rowdata.push(dataresults["yea" + app.years[l]]);
                    
                  }
                }

                serie["name"] = dataresults["nomregion"] + " " + thestring;
                serie["data"] = rowdata;
                theseries.push(serie);
              }


              //Verificacion de Subregiones
              else if (dataresults["nomsubregion"] !== null && dataresults["nomsubregion"] !== '' && printsubregion) {
                departamentos.push(dataresults["nomsubregion"]);
                geograficas.push(dataresults["nomsubregion"]);
                for (var l = 0; l < app.years.length; l++) {
                  if (yearstoprint[l]) {
                    
                      rowdata.push(dataresults["yea" + app.years[l]]);
                    
                  }
                }

                serie["name"] = dataresults["nomsubregion"] + " " + thestring;
                serie["data"] = rowdata;
                theseries.push(serie);
              }

              //Verificación de municipios
              else if (dataresults["nommpio"] !== null && dataresults["nommpio"] !== '' && printtown) {
                printstate = false;
                municipios.push(dataresults["nommpio"]);
                geograficas.push(dataresults["nommpio"]);

                for (var l = 0; l < app.years.length; l++) {
                  if (yearstoprint[l]) {
                    
                      rowdata.push(dataresults["yea" + app.years[l]]);
                    
                  }
                }

                serie["name"] = dataresults["nommpio"] + " " + thestring;
                serie["data"] = rowdata;
                theseries.push(serie);
              }

              //Verificación de departamentos
              else if (dataresults["nomdepto"] !== null && dataresults["nomdepto"] !== '' && printstate) {
                departamentos.push(dataresults["nomdepto"]);
                geograficas.push(dataresults["nomdepto"]);

                for (var l = 0; l < app.years.length; l++) {
                  if (yearstoprint[l]) {                    
                      rowdata.push(dataresults["yea" + app.years[l]]);                                      }
                }                

                serie["name"] = dataresults["nomdepto"] + " " + thestring;
                serie["data"] = rowdata;
                
                if (dataresults["iddepto"] === "170") {
                  theseries.unshift(serie);
                } else {
                  theseries.push(serie);
                }
              }

              //Verificación de zonas
              else if (dataresults["nomzona"] !== null && dataresults["nomzona"] !== '' && printzone) {
                municipios.push(dataresults["nomzona"]);
                geograficas.push(dataresults["nomzona"]);
                console.log("Numero de años:" + app.years.length);
                for (var l = 0; l < app.years.length; l++) {
                  if (yearstoprint[l]) {
                      rowdata.push(dataresults["yea" + app.years[l]]);
                  }
                }

                serie["name"] = dataresults["nomzona"] + " " + thestring;
                serie["data"] = rowdata;
                theseries.push(serie);
              }
              else {
                for (var l = 0; l < app.years.length; l++) {
                  if (yearstoprint[l]) {
                      rowdata.push(dataresults["yea" + app.years[l]]);
                  }
                }

                serie["name"] = thelocation + " " + thestring;
                serie["data"] = rowdata;
                theseries.push(serie);
              }


            }
            cb(theseries, thecategories);
          }

          function dataset(theseries, thecategories) {
            console.log("chart.table: dataset");
            var aDataSet = [];

            for (s = 0; s < theseries.length; s++) {
              var aSingle = [];
              aSingle.push(theseries[s].name);
              for (t = 0; t < theseries[s].data.length; t++) {
                aSingle.push(theseries[s].data[t]);
              }
              aDataSet.push(aSingle);
            }

            var theaoColumns = [];
            theaoColumns.push({
              "bSortable": false,
              sTitle: "Ubicación Geográfica"
            });
            for (q = 0; q < thecategories.length; q++) {
              var aoColumn = {};
              aoColumn["sTitle"] = thecategories[q];
              theaoColumns.push(aoColumn);
            }

            app["colums"] = theaoColumns;
            app["tabledata"] = aDataSet;
            
            app["dataTable"] = $('#dtable').dataTable({
              "fnInitComplete": function(oSettings, json) {
                $('#dtable').table();
                app.hideLoadingBox();
              },
              "bFilter": false,
              "bInfo": false,
              "bPaginate": false,
              "aaData": aDataSet,
              "bDestroy": true,
              "aoColumns": theaoColumns,
              "aaSorting": [],
            });
          }
        }
      }
    }
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
        $(selector).html(number);
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
  },

  progressBar: function(percent, $element) {
    var progressBarWidth = percent * $element.width() / 100;
    $element.find('div').animate({
      width: progressBarWidth
    }, 20);
    $("#pbLabel").html(percent + "%&nbsp;");
  }
};

(function addXhrProgressEvent($) {
  var originalXhr = $.ajaxSettings.xhr;
  $.ajaxSetup({
    progress: function() {
      console.log("standard progress callback");
    },
    xhr: function() {
      var req = originalXhr(),
        that = this;
      if (req) {
        if (typeof req.addEventListener == "function") {
          req.addEventListener("progress", function(evt) {
            that.progress(evt);
          }, false);
        }
      }
      return req;
    }
  });
})(jQuery);