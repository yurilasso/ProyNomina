sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/m/UploadCollectionParameter"

    ],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.m.UploadCollectionParameter} UploadCollectionParameter
     */
    function (Controller, MessageBox, UploadCollectionParameter) {
        "use strict";


        function onBeforeRendering() {
            this._wizard = this.byId("wizard");
            //Se crea el modelo principal que contendrá todos los datos
            this._model = new sap.ui.model.json.JSONModel({});
            this.getView().setModel(this._model);
            //Se resetea los pasos por si ya se ha ejecutado la aplicacion antes
            var oFirstStep = this._wizard.getSteps()[0];
            this._wizard.discardProgress(oFirstStep);
            // scroll to top
            this._wizard.goToStep(oFirstStep);
            // invalidate first step
            oFirstStep.setValidated(false);
            //
        }

        function goStep2(oEvent) {
            //Step 1
             var typeEmployeeStep = this.byId("typeEmployeeStep");
            //Step 2
            var dataEmployeeStep = this.byId("dataEmployeeStep");
            //Se obtiene el tipo seleccionado con el "CustomData"
            var button = oEvent.getSource();
            var typeEmployee = button.data("typeEmployee");
            //Dependiendo del tipo, el salario bruto por defecto es:
            // Interno: 24000
            // autonomo : 400
            // Gerente : 70000
            var Salary, Type;
            switch (typeEmployee) {
                case "interno":
                    Salary = 24000;
                    Type = "0";
                    break;
                case "autonomo":
                    Salary = 400;
                    Type = "1";
                    break;
                case "gerente":
                    Salary = 70000;
                    Type = "2";
                    break;
                default:
                    break;
            }
            //Al pulsar sobre el tipo, se sobreescribe el modelo registrando el tipo  y el valor del salario por defecto
            this._model.setData({
                _type: typeEmployee,
                Type: Type,
                _Salary: Salary
            });
            //Se comprueba si se está en el paso 1, ya que se debe usar la función "nextStep" para activar el paso 2.
            if (this._wizard.getCurrentStep() === typeEmployeeStep.getId()) {
                this._wizard.nextStep();
            } else {
                // En caso de que ya se encuentre activo el paso 2, se navega directamente a este paso 
                this._wizard.goToStep(dataEmployeeStep);
            }
        }

        //Valida los datos del nuevo empleado y determina si se puede pasar al paso 3
        //Esto servirá para que en la funcion "wizardCompletedHandler" se devuelva el valor "isValid"
        function dataEmployeeValidate(oEvent, callback) {
            var object = this._model.getData();
            var isValid = true;
            //Nombre
            if (!object.FirstName) {
                object._FirstNameState = "Error";
                isValid = false;
            } else {
                object._FirstNameState = "None";
            }

            //Apellidos
            if (!object.LastName) {
                object._LastNameState = "Error";
                isValid = false;
            } else {
                object._LastNameState = "None";
            }

            //Fecha
            if (!object.CreationDate) {
                object._CreationDateState = "Error";
                isValid = false;
            } else {
                object._CreationDateState = "None";
            }

            //DNI
            if (!object.Dni) {
                object._DniState = "Error";
                isValid = false;
            } else {
                object._DniState = "None";
            }

            if (isValid) {
                this._wizard.validateStep(this.byId("dataEmployeeStep"));
            } else {
                this._wizard.invalidateStep(this.byId("dataEmployeeStep"));
            }
            //Si hay callback se devuelve el valor isValid
            if (callback) {
                callback(isValid);
            }
        }

        //Función para validar el dni
	function validateDNI(oEvent){
		//Se comprueba si es dni o cif. En caso de dni, se comprueba su valor. Para ello se comprueba que el tipo no sea "autonomo"
		if(this._model.getProperty("_type") !== "autonomo"){
			var dni = oEvent.getParameter("value");
			var number;
			var letter;
			var letterList;
			var regularExp = /^\d{8}[a-zA-Z]$/;
			//Se comprueba que el formato es válido
			if(regularExp.test (dni) === true){
				//Número
				 number = dni.substr(0,dni.length-1);
				 //Letra
				 letter = dni.substr(dni.length-1,1);
				 number = number % 23;
				 letterList="TRWAGMYFPDXBNJZSQVHLCKET";
				 letterList=letterList.substring(number,number+1);
			if (letterList !== letter.toUpperCase()) {
				this._model.setProperty("/_DniState","Error");
			 }else{
				this._model.setProperty("/_DniState","None");
				this.dataEmployeeValidate();
			 }
			}else{
				this._model.setProperty("/_DniState","Error");
			}
		}
	}

        function onCancel() {
            //Se muestra un mensaje de confirmación
            var msgcancelar = this.oView.getModel("i18n").getResourceBundle().getText("preguntaCancelar");
            sap.m.MessageBox.confirm(msgcancelar, {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        //Regresamos al menú principal de la app
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        oRouter.navTo("RouteMenu", {}, true);
                    }
                }.bind(this)
            });
        }

        //Función generica para editar un step
	function _editStep(step){
		var wizardNavContainer = this.byId("wizardNavContainer");
		//Se añade un función al evento afterNavigate, ya que se necesita 
		//que la función se ejecute una vez ya se haya navegado a la vista principal
		var fnAfterNavigate = function () {
				this._wizard.goToStep(this.byId(step));
				//Se quita la función para que no vuelva a ejecutar al volver a nevagar
				wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
			}.bind(this);

		wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
		wizardNavContainer.back();
	}
	
	//Función al darle al botón editar de la sección "Tipo de empleado"
	function editStepOne(){
		_editStep.bind(this)("typeEmployeeStep");
	}
	
	//Función al darle al botón editar de la sección "Datos de empleado"
	function editStepTwo(){
		_editStep.bind(this)("dataEmployeeStep");
	}
	
	//Función al darle al botón editar de la sección "Información adicional"
	function editStepThree(){
		_editStep.bind(this)("OptionalInfoStep");
	}

    //Función que se ejecuta al cargar un fichero en el uploadCollection
	//Se agrega el parametro de cabecera x-csrf-token con el valor del token del modelo
	function onChange (oEvent) {
        var oUploadCollection = oEvent.getSource();
        // Header Token
        var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
         name: "x-csrf-token",
         value: this.getView().getModel("odataNomina").getSecurityToken()
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
      }

    //Función que se ejecuta por cada fichero que se va a subir a sap
	//Se debe agregar el parametro de cabecera "slug" con el valor "id de sap del alumno",
    //id del nuevo usuario y nombre del fichero, separados por ;
	 function onBeforeUploadStart (oEvent) {
        var oCustomerHeaderSlug = new UploadCollectionParameter({
                 name: "slug",
                 value: this.getOwnerComponent().SapId+";"+this.newUser+";"+oEvent.getParameter("fileName")
             });
             oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
       }
       
       function onStartUpload (ioNum) {
        var that = this;
        var oUploadCollection = that.byId("UploadCollection");
        oUploadCollection.upload();
       }

    //Función para guardar el nuevo empleado
	function onSaveEmployee(){
		var json = this.getView().getModel().getData();
		var body = {};
        body.SapId = this.getOwnerComponent().SapId;
        
		//Solo los campos que no empicen por "_", ya que son los que vamos a enviar
		for(var i in json){
			if(i.indexOf("_") !== 0){
				body[i] = json[i];
			}
		}
         
		body.UserToSalary = [{
			Amount   : parseFloat(json._Salary).toString(),
			Comments : json.Comments,
			Waers    : "EUR"
		}];
		this.getView().setBusy(true);
		this.getView().getModel("odataNomina").create("/Users",body,{
			success : function(data){
				this.getView().setBusy(false);
				//Se almacena el nuevo usuario
				this.newUser = data.EmployeeId;
				sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoNuevo") + ": " + this.newUser,{
					onClose : function(){
						//Se vuelve al wizard, para que al vovler a entrar a la aplicacion aparezca ahi
						var wizardNavContainer = this.byId("wizardNavContainer");
						wizardNavContainer.back();
						//Regresamos al menú principal
						var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						oRouter.navTo("menu",{},true);
					}.bind(this)
				});
				//Se llama a la función "upload" del uploadCollection
				this.onStartUpload();
			}.bind(this),
			error : function(){
				this.getView().setBusy(false);
			}.bind(this)
		});
	}

    //Función al dar al botón verificar
	function wizardCompletedHandler(oEvent){
		//Se comprueba que no haya error
		this.dataEmployeeValidate(oEvent,function(isValid){
			if(isValid){
				//Se navega a la página review
				var wizardNavContainer = this.byId("wizardNavContainer");
				wizardNavContainer.to(this.byId("ReviewPage"));
				//Se obtiene los archivos subidos
				var uploadCollection = this.byId("UploadCollection");
				var files = uploadCollection.getItems();
				var numFiles = uploadCollection.getItems().length;
				this._model.setProperty("/_numFiles",numFiles);
				if (numFiles > 0) {
					var arrayFiles = [];
					for(var i in files){
						arrayFiles.push({DocName:files[i].getFileName(),MimeType:files[i].getMimeType()});	
					}
					this._model.setProperty("/_files",arrayFiles);
				}else{
					this._model.setProperty("/_files",[]);
				}
			}else{
				this._wizard.goToStep(this.byId("dataEmployeeStep"));
			}
		}.bind(this));
	}

        //return Controller.extend("logaligroup.nomina.controller.CreateEmp", {
        //  onInit() { }
        //});
        var Main = Controller.extend("logaligroup.nomina.controller.CreateEmp", {});

        Main.prototype.onBeforeRendering = onBeforeRendering;
        Main.prototype.goStep2 = goStep2;
        Main.prototype.onCancel = onCancel;
        Main.prototype.dataEmployeeValidate = dataEmployeeValidate;
        Main.prototype._editStep = _editStep;
        Main.prototype.editStepOne = editStepOne;
        Main.prototype.editStepTwo = editStepTwo;
        Main.prototype.editStepThree = editStepThree;
        Main.prototype.wizardCompletedHandler = wizardCompletedHandler;
	    Main.prototype.validateDNI = validateDNI;
        Main.prototype.onSaveEmployee = onSaveEmployee;
        Main.prototype.onChange = onChange;
        Main.prototype.onBeforeUploadStart = onBeforeUploadStart;
        
        return Main;
    }
);