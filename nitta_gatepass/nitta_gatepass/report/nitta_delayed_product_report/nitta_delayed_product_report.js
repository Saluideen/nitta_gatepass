// Copyright (c) 2023, Ideenkreise and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Nitta Delayed Product Report"] = {

	"filters": [
		{
			"fieldname": "division",
			"label": __("Division"),
			"fieldtype": "Link",
			"options": "Division",
			// "reqd": 1,
			
			// default:"All"


		}, {
			"fieldname": "department",
			"label": __("Department"),
			"fieldtype": "Link",
			"options": "Department and Function",
			// "reqd": 1,
			// default: 'All',
			"get_query": function () {
				return {
					query: "nitta_gatepass.nitta_gatepass.report.nitta_gatepass_report.nitta_gatepass_report.get_department",
				};
			}


		},
		

	]
};
