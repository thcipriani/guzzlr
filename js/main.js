(function($){
  /*
  * ===========Models============
  */
  window.Mileage = Backbone.Model.extend({
    "urlRoot": "../api/mileage",
    "defaults" : {
      "date": mysqlDate.call(new Date()),
      "miles": 0.00,
      "gallons": 0.00,
      "price": 0.00
    }
  });

  window.SummaryStat =  Backbone.Model.extend({}); 
 /*
  * ===========Collections============
  */
  window.TotalMileage = Backbone.Collection.extend({
    "model": window.Mileage,
    "url": "../api/mileage"
  });

  window.SummaryStats = Backbone.Collection.extend({
    "model": window.SummaryStat,
    "url": "../api/summary",
  });
 /*
  * ===========Views============
  */
  window.TotalMileageView = Backbone.View.extend({
    "tagName": "table",
    "className": "table table-striped",

    "initialize": function() {
      var self = this;
      this.collection.bind("reset", this.render, this);
    },

    "render": function(e) {
      _.each(this.collection.models, function(mileage) {
        $(this.el).append(new MileageView({"model": mileage}).render().el);
      }, this);
      return this;
    }
  });

  window.MileageView = Backbone.View.extend({
    "tagName": "tr",

    "template": _.template($("#tmpl-mileage-item").html()),

    "initialize": function() {},

    "render": function(e) {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  window.HeaderView = Backbone.View.extend({
      "className": "container",
      "template": _.template($("#tmpl-header").html()),

      "initialize": function() {
        this.model.bind("reset", this.render, this);
      },

      "events": {
        "click .add": "newRecord"
      },

      "newRecord": function(e) {
        app.navigate("addMileage", true);
        false;
      },

      "render": function(e) {
        $(this.el).html(this.template());
        _.each(this.model.models, function(mileage) {
          $(".hero-unit").append(new StatsView({"model": mileage}).render().el);
        }, this);
        return this;
      } 
  });

  window.StatsView = Backbone.View.extend({
    "template": _.template($("#tmpl-stats-item").html()),

    "initialize": function() {},

    "render": function(e) {
      console.log(this.model.toJSON());
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }

  });

  window.AddMileageView = Backbone.View.extend({
      "template": _.template($("#tmpl-add-mileage").html()),

      "initialize": function() {
        this.model.bind("change", this.render, this);
      },

      "render": function(e) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
      },

      "events": {
        "click .cancel": "backHome",
        "click .saveRecord": "saveRecord",
        "click .deleteRecord": "deleteRecord"
      },

      "backHome": function(e) {
        app.navigate("", true);
        false;
      },

      "saveRecord": function(e) {
        this.model.set({
          "date": $("#date").val(),
          "miles": $("#miles").val(),
          "gallons": $("#gallons").val(),
          "price": $("#price").val()
        });

        if (this.model.isNew()) {
          app.totalMileage.create(this.model, {
            "success": function() {
              app.navigate("", true);
            }
          });

        } else {
          this.model.save();
          app.navigate("", true);
        }

      },

      "deleteRecord": function(e) {
        this.model.destroy({
          success:function () {
            alert('Record deleted successfully');
            window.history.back();
          }
        });
        return false;
      }

  });

 /*
  * ===========Routes============
  */
  var AppRouter = Backbone.Router.extend({
    "routes": {
      "": "totals",
      "mileage/:id": "mileage-detail",
      "addMileage": "add-mileage"
    },

    "totals": function() {
      this.summaryStats = new SummaryStats();
      this.summaryStats.fetch();
      this.headerView = new HeaderView({"model": this.summaryStats});
      $("header").html(this.headerView.render().el);


      this.totalMileage = new TotalMileage();
      this.totalMileageView = new TotalMileageView({"collection": this.totalMileage});
      this.totalMileage.fetch();
      $("#app-main").html(this.totalMileageView.render().el);
    },

    "mileage-detail": function(id) {
      this.mileage = this.totalMileage.get(id);
      this.addMileageView = new AddMileageView({model: this.mileage});
      $("#app-main").html(this.addMileageView.render().el);
    },

    "add-mileage": function() {
      this.newModel = new Mileage();
      this.addMileageView = new AddMileageView({model: this.newModel});
      $("#app-main").html(this.addMileageView.render().el);
    }
  });

  var app = new AppRouter();
  Backbone.history.start();

  function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
  }


  function mysqlDate() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
  }

})(jQuery);
