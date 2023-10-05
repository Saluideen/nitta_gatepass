// Copyright (c) 2023, Ideenkreise and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Nitta Gatepass Report"] = {

	"filters": [
		{
			"fieldname": "division",
			"label": __("Division"),
			"fieldtype": "Link",
			"options": "Division",
			// "reqd": 1,
			// // "get_query": function () {
			// // 	return {
			// // 		query: "nitta.nitta_gate_pass.doctype.division.division.get_division",
			// // 	};
			// // }
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
		
		{
			"fieldname": "from_date",
			"label": __("From"),
			"fieldtype": "Date",
			"reqd": 1,
			default: new Date(new Date().getFullYear(), new Date().getMonth(), 1),

		},
		{
			"fieldname": "to_date",
			"label": __("To"),
			"fieldtype": "Date",
			"reqd": 1,
			default: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),

		},
		{
			"fieldname": "status",
			"label": __("Status"),
			"fieldtype": "Link",
			"options": "Report Status",
			"reqd": 1,
			default: 'All'


		},

	]
};
