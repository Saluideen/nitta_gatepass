// Copyright (c) 2023, Ideenkreise and contributors
// For license information, please see license.txt
let s_department;
frappe.ui.form.on('Nitta Gatepass Return Data', {
	
  refresh: function (frm) {
    // set Current date
    // Check if the date field is empty before setting the current date
    if (!frm.doc.from_date) {
      var currentDate = frappe.datetime.get_today();
      frm.set_value("from_date", currentDate);
    }
    // set current user department if department is Stores change some field state
    frm.events.Stores_department(frm);

    // initiate button
    frm.events.initiate_button(frm);
    // hide security role fields
    frm.events.hide_security(frm);
    // approve Button
    frm.events.approve_button(frm);
    //  apply filter in department field
    frm.events.department_filter(frm);
    // hide child table completed row
    frm.events.hide_child_row(frm);
    // filter for workflow employee
    frm.events.set_employee_filter(frm);
    //  hide child table add row button
      //apply workflow style
	frm.events.apply_workflow_table_style(frm)
  // add default value to other attachments and disable attachment button
  frm.events.attachment_settings(frm)
   
    cur_frm.fields_dict ['product'].grid.wrapper.find ('.grid-add-row').hide (); 
    cur_frm.fields_dict ['product'].grid.wrapper.find ('.grid-remove-rows').hide ();
    // Hide delivery chellan details
    frm.events.hide_delivery_chellan(frm);
  },
  //  show alert box when gatepass status change

  validate: function (frm) {
    if (s_department == "Stores") {
      var itemState = frm.doc.item_state;
      // Show an alert box when the item_state field changes
      return new Promise(function (resolve, reject) {
        frappe.confirm(
          "Gatepass Status: " +
            itemState +
            "<br><br> Do you want to save the changes?",
          function () {
            var negative = "frappe.validated = false";
            resolve(negative);
          },
          function () {
            reject();
          }
        );
      });
    }
  },
  // update delivery chellan
  if_delivery_chellan: function (frm) {
    if (frm.doc.if_delivery_chellan == "1") {
      frm.set_df_property("delivery_chellan", "hidden", 0);
    }
    if (frm.doc.if_delivery_chellan == "0") {
      frm.set_df_property("delivery_chellan", "hidden", 1);
    }
  },

  // hide fields
  way_of_return: function (frm) {
    frm.doc.recipient_name = undefined;
    frm.doc.phone = undefined;
    frm.doc.courier_number = undefined;
    frm.doc.courier_company = undefined;
    frm.doc.driver_name = undefined;
    frm.doc.contact_number = undefined;
    frm.doc.registration_number = undefined;
    frm.refresh_field("recipient_name");
    frm.refresh_field("phone");
    frm.refresh_field("courier_number");
    frm.refresh_field("courier_company");
    frm.refresh_field("driver_name");
    frm.refresh_field("contact_number");
    frm.refresh_field("registration_number");
    let way_of_dispatch = frm.doc.way_of_return;
    if (way_of_dispatch == "By Hand") {
      frm.set_df_property("recipient_name", "read_only", 0);
      frm.set_df_property("phone", "read_only", 0);
      frm.set_df_property("courier_number", "read_only", 1);
      frm.set_df_property("courier_company", "read_only", 1);
      frm.set_df_property("driver_name", "read_only", 1);
      frm.set_df_property("contact_number", "read_only", 1);
      frm.set_df_property("registration_number", "read_only", 1);
    } else if (way_of_dispatch == "Vehicle") {
      frm.set_df_property("driver_name", "read_only", 0);
      frm.set_df_property("contact_number", "read_only", 0);
      frm.set_df_property("registration_number","read_only", 0);
      frm.set_df_property("recipient_name", "read_only", 1);
      frm.set_df_property("phone", "read_only", 1);
      frm.set_df_property("courier_number", "read_only", 1);
      frm.set_df_property("courier_company", "read_only", 1);
    } else {
      frm.set_df_property("courier_company","read_only", 0);
      frm.set_df_property("courier_number", "read_only", 0);
      frm.set_df_property("driver_name", "read_only", 1);
      frm.set_df_property("contact_number", "read_only", 1);
      frm.set_df_property("registration_number", "read_only", 1);
      frm.set_df_property("recipient", "read_only", 1);
      frm.set_df_property("phone", "read_only", 1);
    }
  },

  // insert gate pass material details in return document
  gate_pass: function (frm) {
    frappe.call({
      method:
        "nitta_gatepass.nitta_gatepass.doctype.nitta_gatepass_return_data.nitta_gatepass_return_data.get_gatepass_details",
      args: {
        gate_pass: frm.doc.gate_pass,
      },
      callback: function (r) {

        r.message[0].forEach((el) => {
          frm.add_child("product", {
            item: el.item,
            work_to_be_done: el.work_to_be_done,
            quantity: el.quantity,
            remaining_quantity: el.remaining,
            remarks: el.remarks,
            previous_return_quantity: el.return_quantity,
            expected_delivery_date: el.expected_delivery_date,
            item_name: el.name,
            previous_remaining: el.remaining,
            status: el.status,
          });

          frm.refresh_field("product");
          // }
        });
        r.message[1].forEach((el) => {
		
          frm.set_value("department", el.department);
          frm.set_value("division", el.division);
		  frm.refresh_field("department")
		  frm.refresh_field("division")
        });
      },
    });
  },

  ////////////////////////////////////////custom functions///////////////////////////////////////////////////////\
  
  hide_delivery_chellan: function (frm) {
    if(roles.includes("Security")){
      frm.set_df_property("if_delivery_chellan", "hidden", 0);
    }
    else if ((frm.doc.if_delivery_chellan == "1") && (!roles.includes("Security"))) {
      frm.set_df_property("delivery_chellan", "hidden", 0);
      frm.set_df_property("if_delivery_chellan", "hidden", 0);
    } else {
      frm.set_df_property("delivery_chellan", "hidden", 1);
      frm.set_df_property("if_delivery_chellan", "hidden", 1);
    }
  },
  set_employee_filter: function (frm) {
    frm.fields_dict["workflow"].grid.get_field("user").get_query =
      function (doc, cdt, cdn) {
        var child = locals[cdt][cdn];

        return {
          query:
            "nitta_gatepass.nitta_gatepass.doctype.gatepass_workflow.gatepass_workflow.get_employee",
          filters: {
            division: frm.doc.division,
            department: child.department,
            role: child.role,
          },
        };
      };
  },

  hide_child_row: function (frm) {
    let non_editable_fields = [
      "item",
      "work_to_be_done",
      "return_quantity",
      "status",
      "remark",
    ];
    frm.fields_dict["product"].grid.grid_rows.forEach((grid_row) => {
      if (grid_row.doc.status === "Completed") {
        grid_row.docfields.forEach((df) => {
          if (non_editable_fields.includes(df.fieldname)) {
            df.read_only = 1;
          }
        });
      }
    });

    refresh_field("product");
  },
  Stores_department: function (frm) {
    frappe.call({
      method:
        "nitta_gatepass.nitta_gatepass.doctype.nitta_gatepass_return_data.nitta_gatepass_return_data.get_employee_details",
      async: false,
      args: {
        name: frappe.session.user,
      },
      callback: function (r) {
        s_department = r.message[0].department;

        if (r.message[0].department == "Stores") {
          // frm.fields_dict['product'].grid.get_field('status').reqd = 1;
          // frm.refresh_field('product');
          frm.set_df_property("item_state", "hidden", 0);
          frm.set_df_property("from_date", "read_only", 1);
          frm.set_df_property("vendor_name", "read_only", 1);
          frm.set_df_property("workflow", "read_only", 1);
          frm.set_df_property("product", "read_only", 0);
          frm.set_df_property("delivery_chellan", "read_only", 1);
          frm.set_df_property("if_delivery_chellan", "read_only", 1);
          frm.set_df_property("gate_pass", "read_only", 1);
          frm.set_df_property("way_of_return", "read_only", 1);
        }
        if (frm.doc.status !== "Draft" && r.message[0].department != "Stores") {
          frm.disable_save();
          frm.disable_form();
        }
        if (
          frm.doc.status == "Final Approved" &&
          r.message[0].department == "Stores"
        ) {
          frm.disable_save();
          frm.disable_form();
        }
      },
    });
  },
  initiate_button: function (frm) {
    if (!frm.is_new() && frm.doc.status == "Draft") {
      cur_frm.page.add_action_item("Initiate", function () {
        frm.doc.status = "Initiated";
        frm.refresh_field("status");
        frm.dirty();
        frm.save();
      });
      frm.change_custom_button_type("Initiate", null, "primary");
    }
  },
  hide_security: function (frm) {
    if (roles.includes("Security")) {
     
      frm.set_df_property("way_of_return", "hidden", 0);
      frm.set_df_property("product", "hidden", 1);
      frm.set_df_property("from_date", "read_only", 1);
      frm.set_df_property("vendor_name", "read_only", 1);
      // frm.set_df_property("workflow", "read_only", 1);
    }
  },
  approve_button: function (frm) {
    if (
      frm.doc.next_approved_by == frappe.session.user &&
      frm.doc.status != "Final Approved"
    ) {
      frm.page.add_action_item("Approve ", () => {
        let index = frm.doc.workflow.findIndex(
          (el) => el.user == frappe.session.user && el.status != "Approved"
        );
        frm.doc.workflow[index].status = "Approved";
        frm.refresh_field("workflow");
        frm.dirty();
        frm.save();
      });
    }
  },
  attachment_settings: function (frm) {
		//disable sidebar attachments section
		$(".form-attachments").hide();
	},
	apply_workflow_table_style: function (frm) {
		$(".frappe-control[data-fieldname='workflow']")
			.find(".grid-body")
			.find("[data-fieldname='status']")
			.each(function () {
				if ($(this).text() === "Approved") {
					$(this).css({
						"color": "#05B01F",
						"background-color": "#D9F0D8",
						"font-weight": "bold"
					});
				}
				else if ($(this).text() === "Rejected") {
					$(this).css({
						"color": "#B00505",
						"background-color": "#F0D8D8",
						"font-weight": "bold"
					});
				} else if ($(this).text() === "Modify") {
					$(this).css({
						"color": "#FFA500",
						"background-color": "#FBFCDE",
						"font-weight": "bold"
					});
				}
				else {
					$(this).css({
						"color": "black",
						"background-color": "#FFFFFF",
						"font-weight": "bold"
					});
				}
			});
	},
  department_filter: function (frm) {
    frm.set_query("gate_pass", function () {
      return {
        filters: { status: ["in", ["Dispatched", "Partially Completed"]] },
      };
    });
  },
});
frappe.ui.form.on("Return product Details", {
  return_quantity: function (frm, cdt, cdn) {
    var row = locals[cdt][cdn];
    let remains =
      (parseFloat(row.remaining_quantity) || 0) -
      (parseFloat(row.return_quantity) || 0);
    let previous =
      (parseFloat(row.previous_remaining) || 0) -
      (parseFloat(row.return_quantity) || 0);
    if ((remains = previous)) {
      frappe.model.set_value(cdt, cdn, "remaining_quantity", remains);
    } else {
      frappe.model.set_value(cdt, cdn, "remaining_quantity", previous);
    }
  },
  status: function (frm, cdt, cdn) {
    var row = locals[cdt][cdn];
    let status = undefined;
    let i = frm.doc.product.findIndex((el) => {
      return el.status == "Partially Completed";
    });

    let close = frm.doc.product.findIndex((el) => {
      return el.status == "Completed" || el.status == "Assembled";
    });
    let id = frm.doc.product.findIndex((el) => {
      return el.status == "";
    });
    if (i > -1) {
      status = "Partially Completed";
    } else if (id > -1) {
      status = "Select";
    } else {
      status = "Close";
    }

   
    frm.doc.item_state = status;
    frm.refresh_field("item_state");
  },
});
