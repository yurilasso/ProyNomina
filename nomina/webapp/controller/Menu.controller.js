sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("logaligroup.nomina.controller.Menu", {
            onInit: function () {

            },
            navToCreate: function(){
             //Obtengo  los routers del App
			 var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Navega hacia el router "CreateEmployee" y abre la vista alli especificada
			oRouter.navTo("RouteCreateEmployee",{},false);
            },
            navToConsulta: function(){
			 var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
             //Navego hacia el router "CreateEmployee"
             oRouter.navTo("RouteConsultaEmployee",{},false);
            }

        });
    });
