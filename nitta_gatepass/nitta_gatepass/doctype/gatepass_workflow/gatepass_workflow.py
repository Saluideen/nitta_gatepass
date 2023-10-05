# Copyright (c) 2023, Ideenkreise and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class GatepassWorkflow(Document):
	pass
@frappe.whitelist()
def get_employee(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql("""SELECT  em.user from `tabNitta User` em inner join `tabNitta User Role` er on em.name=er.parent
	WHERE er.division = %(division)s AND er.departmentfunction=%(department)s AND er.role=%(role)s
	
	 """.format(**{
				'key': searchfield
			}), {
			'txt': "%{}%".format(txt),
			'_txt': txt.replace("%", ""),
			'start': start,
			'page_len': page_len,
			'division':filters["division"],
			'department':filters['department'],
			'role':filters['role']

		})