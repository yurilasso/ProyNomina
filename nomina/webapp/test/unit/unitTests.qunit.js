/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"logaligroup/nomina/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
