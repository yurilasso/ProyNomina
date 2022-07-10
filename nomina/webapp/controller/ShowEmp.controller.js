sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"

    ],

    /** 
    * @param {typeof sap.ui.core.mvc.Controller} Controller
    * @param {typeof sap.ui.model.Filter} Filter
    * @param {typeof sap.ui.model.FilterOperator} FilterOperator
    */
    function (Controller, Filter, FilterOperator) {
        "use strict";


        function onInit() {
            this._splitAppEmployee = this.byId("splitAppEmployee");
        }

        function onPressBack() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMenu", {}, true);
        }

        function onSelectEmployee(oEvent) {
            //Navego al detalle del empleado
            this._splitAppEmployee.to(this.createId("detailEmployee"));
            var context = oEvent.getParameter("listItem").getBindingContext("odataNomina");
            //Se almacena el usuario seleccionado
            this.employeeId = context.getProperty("EmployeeId");
            var detailEmployee = this.byId("detailEmployee");
            //Se bindea a la vista con la entidad Users y las claves del id del empleado y el id del alumno
            detailEmployee.bindElement("odataNomina>/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");
        }

        //Función para filtrar empleados
        function onSearchEmployee(oEvent) {
            var queryValue = oEvent.getParameter("query");
          
        }

        //Función que se ejecuta al cargar un fichero en el uploadCollection
        //Se agrega el parametro de cabecera x-csrf-token con el valor del token del modelo
        function onChange(oEvent) {
            var oUploadCollection = oEvent.getSource();
            // Header Token
            var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataNomina").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        }


        //Función para eliminar el empleado seleccionado
        function onDeleteEmployee(oEvent) {
            //Se muestra un mensaje de confirmación
            sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("estaSegurodeEliminar"), {
                title: this.getView().getModel("i18n").getResourceBundle().getText("confirm"),
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        //Se llama a la función remove
                        this.getView().getModel("odataNomina").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                            success: function (data) {
                                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("seHaEliminadoUsuario"));
                                //En el detalle se muestra el mensaje "Seleecione empleado"
                                this._splitAppEmployee.to(this.createId("detailSelectEmployee"));
                            }.bind(this),
                            error: function (e) {
                                sap.base.Log.info(e);
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        }

        //Función para crear un nuevo ascenso
        function addAscend(oEvent) {
            //Se obtiene el modelo newRise y los datos
            var newRise = this.riseDialog.getModel("newRise");
            var odata = newRise.getData();
            //Se prepara la informacion para enviar a sap y se agrega el campo sapId con el id del alumno y el id del empleado
            var body = {
                Amount: odata.Ammount,
                CreationDate: odata.CreationDate,
                Comments: odata.Comments,
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: this.employeeId
            };
            this.getView().setBusy(true);
            this.getView().getModel("odataNomina").create("/Salaries", body, {
                success: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrectamente"));
                    this.onCloseRiseDialog();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoErroneo"));
                }.bind(this)
            });

        }

        //Función que se ejecuta por cada fichero que se va a subir a sap
        //Se debe agregar el parametro de cabecera "slug" con el valor "id de sap del alumno",id del nuevo usuario y nombre del fichero, separados por ;
        function onBeforeUploadStart(oEvent) {
            var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.employeeId + ";" + oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        }

        function onUploadComplete(oEvent) {
            var oUploadCollection = oEvent.getSource();
            oUploadCollection.getBinding("items").refresh();
        }

        function downloadFile(oEvent){
            var sPath = oEvent.getSource().getBindingContext("odataNomina").getPath();
            window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV"+sPath+"/$value");
        }

        function onCloseRiseDialog(){
            this.riseDialog.close();
        }

        function onFileDeleted(oEvent) {
            var oUploadCollection = oEvent.getSource();
            var sPath = oEvent.getParameter("item").getBindingContext("odataNomina").getPath();
            this.getView().getModel("odataNomina").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function () {

                }
            });
        }

        //Función para ascender a un empleado
        function onAscendEmployee(oEvent) {
            if (!this.riseDialog) {
                //this.riseDialog = sap.ui.xmlfragment("logaligroup/rrhh/fragment/RiseEmployee", this);
                this.riseDialog = sap.ui.xmlfragment("logaligroup/nomina/fragment/RiseEmployee", this);
                this.getView().addDependent(this.riseDialog);
            }
            this.riseDialog.setModel(new sap.ui.model.json.JSONModel({}), "newRise");
            this.riseDialog.open();
        }


        //return Controller.extend("logaligroup.nomina.controller.ShowEmp", {
        //  onInit() { }
        //});

        var Main = Controller.extend("logaligroup.nomina.controller.ShowEmp", {});

        Main.prototype.onInit = onInit;
        Main.prototype.onSelectEmployee = onSelectEmployee;
        Main.prototype.onPressBack = onPressBack;
        Main.prototype.onSearchEmployee = onSearchEmployee;
        Main.prototype.onDeleteEmployee = onDeleteEmployee;
        Main.prototype.onAscendEmployee = onAscendEmployee;
        Main.prototype.onChange = onChange;
        Main.prototype.addAscend = addAscend;
        Main.prototype.onBeforeUploadStart = onBeforeUploadStart;
        Main.prototype.onUploadComplete = onUploadComplete;
        Main.prototype.onFileDeleted = onFileDeleted;
        Main.prototype.downloadFile = downloadFile;
        Main.prototype.onCloseRiseDialog = onCloseRiseDialog;

        return Main;

    }
);