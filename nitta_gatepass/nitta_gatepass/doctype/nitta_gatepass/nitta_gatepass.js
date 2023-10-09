// Copyright (c) 2023, Ideenkreise and contributors
// For license information, please see license.txt

frappe.ui.form.on("Nitta Gatepass", {
  refresh: function (frm) {
    // set Current date
    // Check if the date field is empty before setting the current date
    if (!frm.doc.from_date) {
      var currentDate = frappe.datetime.get_today();
      frm.set_value("from_date", currentDate);
    }
    // Apply filter to workflow employee based on division and department
    frm.events.set_employee_filter(frm);
    //set initiator  department nd division and hide workflow and product table
    frm.events.set_initiator_data(frm);

    if (frm.doc.status == "Dispatched") {
      frm.disable_save();
      frm.disable_form();
    }
    // hide dashboard based on condition (return data linked document)
    //  hide connection + icon
    $(".btn.btn-new.btn-secondary.btn-xs.icon-btn").hide();
    // hide connection based on status
    if (
      frm.doc.status !== "Dispatched" &&
      frm.doc.status !== "Partially Completed" &&
      frm.doc.status !== "Close"
    ) {
      frm.dashboard.hide();
    }

    // hide is_emergency field
    frm.events.hide_emergency(frm);

    // Initiate only creator. initiate button function
    frm.events.initiate(frm);
    //disable save and form based  on conditions
    frm.events.disable_forms(frm);
    //  hide  fields of security role
    frm.events.hide_security_fields(frm);

    //  Approve & Reject  button
    frm.events.approve_reject(frm);
    // add preview
    frm.events.add_preview(frm);
    // add print
    frm.events.add_print(frm);
    //apply workflow style
    frm.events.apply_workflow_table_style(frm);
    // add default value to other attachments and disable attachment button
    frm.events.attachment_settings(frm);
  },
  validate: function (frm) {
    if (!frm.is_new()) {
      var childTable = frm.doc.item;

      if (!childTable || childTable.length === 0) {
        frappe.msgprint(__("Please enter Product Deails."));
        frappe.validated = false; // Prevent form submission
      }
    }
  },

  way_of_dispatch: function (frm) {
    let way_of_dispatch = frm.doc.way_of_dispatch;
    frm.doc.recipient = undefined;
    frm.doc.phone = undefined;
    frm.doc.courier_number = undefined;
    frm.doc.courier_company = undefined;
    frm.doc.driver_name = undefined;
    frm.doc.contact_number = undefined;
    frm.doc.registration_number = undefined;

    frm.refresh_field("recipient");
    frm.refresh_field("phone");
    frm.refresh_field("courier_number");
    frm.refresh_field("courier_company");
    frm.refresh_field("driver_name");
    frm.refresh_field("contact_number");
    frm.refresh_field("registration_number");
    if (way_of_dispatch == "By Hand") {
      frm.set_df_property("recipient", "read_only", 0);
      frm.set_df_property("phone", "read_only", 0);
      frm.set_df_property("courier_number", "read_only", 1);
      frm.set_df_property("courier_company", "read_only", 1);
      frm.set_df_property("driver_name", "read_only", 1);
      frm.set_df_property("contact_number", "read_only", 1);
      frm.set_df_property("registration_number", "read_only", 1);
    } else if (way_of_dispatch == "Vehicle") {
      frm.set_df_property("driver_name", "read_only", 0);
      frm.set_df_property("contact_number", "read_only", 0);
      frm.set_df_property("registration_number", "read_only", 0);
      frm.set_df_property("recipient", "read_only", 1);
      frm.set_df_property("phone", "read_only", 1);
      frm.set_df_property("courier_number", "read_only", 1);
      frm.set_df_property("courier_company", "read_only", 1);
    } else {
      frm.set_df_property("courier_company", "read_only", 0);
      frm.set_df_property("courier_number", "read_only", 0);
      frm.set_df_property("driver_name", "read_only", 1);
      frm.set_df_property("contact_number", "read_only", 1);
      frm.set_df_property("registration_number", "read_only", 1);
      frm.set_df_property("recipient", "read_only", 1);
      frm.set_df_property("phone", "read_only", 1);
    }
  },

  uploadPrivateFile: async function (frm) {
    let file_doc = await new Promise((resolve, reject) => {
      new frappe.ui.FileUploader({
        doctype: frm.doctype,
        docname: frm.docname,
        allow_multiple: false,
        restrictions: {
          allowed_file_types: [".png", ".jpeg", ".jpg"],
        },
        folder: "Home/Attachments",
        on_success: (file_doc) => {
          console.log("file doc.", file_doc);
          if (file_doc.file_url.includes("/private/")) {
            resolve(file_doc);
          } else {
            frappe.call({
              method:
                "nitta_gatepass.nitta_gatepass.doctype.nitta_gatepass.nitta_gatepass.remove_file_backgroud",
              args: {
                files: [file_doc.name],
              },
              freeze: true,
              callback: (r) => {
                frappe.msgprint("select Private file");
              },
              error: (r) => {
                frappe.msgprint(r);
              },
            });
          }
        },
      });
    });
    return file_doc;
  },
  //////////////////////////////////// Custom methods ////////////////////////////////////

  set_employee_filter: function (frm) {
    frm.fields_dict["workflow"].grid.get_field("user").get_query = function (
      doc,
      cdt,
      cdn
    ) {
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
  set_initiator_data: function (frm) {
    if (frm.is_new()) {
      frappe.call({
        method:
          "nitta_gatepass.nitta_gatepass.doctype.nitta_gatepass.nitta_gatepass.get_employee_details",
        args: {
          name: frappe.user.name,
        },
        callback: function (r) {
          frm.doc.division = r.message[0].division;
          frm.doc.department = r.message[0].department;
          frm.doc.role = r.message[0].roles;
          frm.doc.user = r.message[0].user;
          frm.refresh_field("division");
          frm.refresh_field("department");
          frm.refresh_field("role");
          frm.refresh_field("user");
        },
      });
      frm.set_df_property("workflow_name", "hidden", 1);
      frm.set_df_property("workflow", "hidden", 1);
      frm.set_df_property("next_approved_by", "hidden", 1);
      frm.set_df_property("status", "hidden", 1);
      frm.set_df_property("item", "hidden", 1);
    } else {
      frm.set_df_property("workflow_name", "hidden", 0);
      frm.set_df_property("workflow", "hidden", 0);
      frm.set_df_property("next_approved_by", "hidden", 0);
      frm.set_df_property("status", "hidden", 0);
      frm.set_df_property("item", "hidden", 0);
    }
  },
  hide_emergency: function (frm) {
    if (frm.doc.status == "Draft") {
      frm.set_df_property("is_emergency", "hidden", 0);
    } else if (frm.doc.status != "Draft" && frm.doc.is_emergency != 1) {
      frm.set_df_property("is_emergency", "hidden", 1);
    }
  },
  initiate: function (frm) {
    var itemTable = frm.doc.item;
    if (itemTable && itemTable.length > 0) {
      if (
        !frm.is_new() &&
        frm.doc.status === "Draft" &&
        roles.includes("Gatepass User")
      ) {
        // The child table is not empty, so show the "Initiate" button
        frm.set_df_property("item", "hidden", 0);
        cur_frm.page.add_action_item("Initiate", function () {
          frm.doc.status = "Initiated";
          frm.refresh_field("status");
          frm.dirty();
          frm.save();
        });
        frm.change_custom_button_type("Initiate", null, "primary");
      }
    }
    // else{
    //   frm.msgprint("Please Enter Material Details")
    // }
  },
  disable_forms: function (frm) {

    if (frm.doc.status != "Draft" && !roles.includes("Security")) {
      frm.disable_save();
      frm.disable_form();
    }

    if (frm.doc.status == "Dispatched" && roles.includes("Security")) {
      frm.disable_save();
      frm.disable_form();
    }
    if (frm.doc.status == "Close" && roles.includes("Security")) {
      frm.disable_save();
      frm.disable_form();
    }
    if (
      frm.doc.status != "Initiated" &&
      roles.includes("Security") &&
      frm.doc.is_emergency == "1"
    ) {
      frm.disable_save();
      frm.disable_form();
    }
  },
  hide_security_fields: function (frm) {
    if (
      roles.includes("Security") &&
      frm.doc.status == "Initiated" &&
      frm.doc.is_emergency == "1"
    ) {
      frm.set_df_property("way_of_dispatch", "hidden", 0);
    }
    if (roles.includes("Security")) {
      frm.set_df_property("way_of_dispatch", "hidden", 0);

      frm.set_df_property("from_date", "read_only", 1);
      frm.set_df_property("is_emergency", "read_only", 1);
      frm.set_df_property("vendor", "read_only", 1);
      frm.set_df_property("item", "read_only", 1);
      frm.set_df_property("workflow", "read_only", 1);
    }
    if (!roles.includes("Security")) {
      frm.set_df_property("way_of_dispatch", "read_only", 1);
      frm.set_df_property("courier_company", "read_only", 1);
      frm.set_df_property("courier_number", "read_only", 1);
      frm.set_df_property("driver_name", "read_only", 1);
      frm.set_df_property("contact_number", "read_only", 1);
      frm.set_df_property("registration_number", "read_only", 1);
      frm.set_df_property("recipient", "read_only", 1);
      frm.set_df_property("phone", "read_only", 1);
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
            color: "#05B01F",
            "background-color": "#D9F0D8",
            "font-weight": "bold",
          });
        } else if ($(this).text() === "Rejected") {
          $(this).css({
            color: "#B00505",
            "background-color": "#F0D8D8",
            "font-weight": "bold",
          });
        } else if ($(this).text() === "Modify") {
          $(this).css({
            color: "#FFA500",
            "background-color": "#FBFCDE",
            "font-weight": "bold",
          });
        } else {
          $(this).css({
            color: "black",
            "background-color": "#FFFFFF",
            "font-weight": "bold",
          });
        }
      });
  },
  approve_reject: function (frm) {
    if (
      frm.doc.next_approved_by == frappe.session.user &&
      frm.doc.status != "Dispatched" &&
      frm.doc.status != "Close" &&
      frm.doc.status != "Partially Completed"
    ) {
      frm.page.add_action_item("Approve", () => {
        let index = frm.doc.workflow.findIndex(
          (el) => el.user == frappe.session.user && el.status != "Approved"
        );
        frm.doc.workflow[index].status = "Approved";
        frm.refresh_field("workflow");
        frm.dirty();
        frm.save();
      });
      frm.change_custom_button_type("Approve", null, "primary");

      if (
        frm.doc.status != "Draft" &&
        !frm.doc.is_emergency &&
        !roles.includes("Security")
      ) {
        frm.page.add_action_item("Reject", () => {
          frappe.confirm(
            __("Do you want to reject this document?"),
            function () {
              let index = frm.doc.workflow.findIndex(
                (el) =>
                  el.user == frappe.session.user && el.status != "Rejected"
              );
              frm.doc.workflow[index].status = "Rejected";
              frm.refresh_field("workflow");
              frm.dirty();
              frm.save();
            },
            function () {
              
            }
          );
        });
      }
    }
  },
  add_print: function (frm) {
    if (!frm.is_new()) {
      frm.add_custom_button(__("Print"), function () {
        // Generate and show the PDF using the "nitta" print format
        frappe.call({
          method:
            "nitta_gatepass.nitta_gatepass.doctype.nitta_gatepass.nitta_gatepass.generate_print",
          args: {
            doctype: frm.doctype,
            docname: frm.docname,
          },
          freeze: true,
          callback: (r) => {
            window.open("http://" + window.location.host + "/" + r.message);
          },
          error: (r) => {
            frappe.msgprint(r);
          },
        });
      });
    }
  },

  add_preview: function (frm) {
    if (!frm.is_new()) {
      frm.add_custom_button(__("Preview "), function () {
        // Generate and show the PDF using the "nitta" print format
        frappe.call({
          method:
            "nitta_gatepass.nitta_gatepass.doctype.nitta_gatepass.nitta_gatepass.generate_preview",
          args: {
            doctype: frm.doctype,
            docname: frm.docname,
          },
          freeze: true,
          callback: (r) => {
            window.open("http://" + window.location.host + "/" + r.message);
          },
          error: (r) => {
            frappe.msgprint(r);
          },
        });
      });
    }
  },
});
frappe.ui.form.on("Nitta item", {
  quantity: function (frm, cdt, cdn) {
    var row = locals[cdt][cdn];

    frappe.model.set_value(cdt, cdn, "remaining", row.quantity);
  },

  download: function (frm, cdt, cdn) {
    let child = locals[cdt][cdn];
    window.open(child.attachment);
  },
  upload: async function (frm, cdt, cdn) {
    if (frm.doc.status == "Draft" || frm.is_new()) {
      let file_doc = await frm.events.uploadPrivateFile(frm);
      frappe.model.set_value(cdt, cdn, "attachment", file_doc.file_url);
      frappe.model.set_value(cdt, cdn, "file_name", file_doc.name);
    }
  },
});
