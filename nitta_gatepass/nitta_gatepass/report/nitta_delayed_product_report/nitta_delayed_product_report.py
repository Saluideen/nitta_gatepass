# Copyright (c) 2023, Ideenkreise and contributors
# For license information, please see license.txt


import frappe


def execute(filters=None):
	columns, data = [], []
	columns=get_column()
	data =get_data(filters)
	summary=get_summary(data)
	return columns, data,None,None,summary
def get_column():
	
	return [
		{
		"fieldname": "gate_pass",
		"label": "gate Pass",
		"fieldtype": "Data",	
		"width": 150
	},{
		"fieldname": "division",
		"label": "Division",
		"fieldtype": "Data",	
		"width": 150
	},{
		"fieldname": "department",
		"label": "Department",
		"fieldtype": "Data",	
		"width": 150
	},{
		"fieldname": "vendor",
		"label": "Vendor",
		"fieldtype": "Data",	
		"width": 150
	},
	
	
	{
		"fieldname": "initiator",
		"label": "Initiator",
		"fieldtype": "Data",	
		"width": 150
	},{
		"fieldname": "product",
		"label": "Product",
		"fieldtype": "Data",	
		"width": 150
	},
	{
		"fieldname": "quantity",
		"label": "Quantity",
		"fieldtype": "Data",	
		"width": 150
	},
	{
		"fieldname": "remaining",
		"label": "Remaining Quantity",
		"fieldtype": "Data",	
		"width": 150
	},
	{
		"fieldname": "work_to_be_done",
		"label": "Work To be done",
		"fieldtype": "Data",	
		"width": 150
	},
	{
		"fieldname": "dispatched_date",
		"label": "Date:of Dispatch ",
		"fieldtype": "Date",	
		"width": 150
	},
	{
		"fieldname": "expected_delivery_date",
		"label": "Expected Delivery Date ",
		"fieldtype": "Date",	
		"width": 150
	},{
		"fieldname": "delay",
		"label": "Delay(In Days)",
		"fieldtype": "Data",	
		"width": 150
	},
	


	]

def get_data(filters):

	data=[]

	# department = filters['department']
	# division = filters['division']
	# if(division=='All'):
	# 	division=''
	# if(department=="All"):
	# 	department=''
	gatepass_filter={}
	gatepass_filter['Status']=['!=','Draft']

	for key in filters:
		if key in ["division","department"]:
			gatepass_filter[key] = filters[key]
			if key == "department" and filters[key] == "All" :
				gatepass_filter["department"]=''
	if 'department' not in filters:
		gatepass_filter['department'] = ''
	if 'division' not in filters:
		gatepass_filter['division'] = ''

	gate_pass_details =frappe.db.sql("""
		select gate_pass.name,gate_pass.division,gate_pass.department,gate_pass.owner,gate_pass.vendor,gate_pass.from_date,
		pdt.pdt_name as item,
		pdt.work_to_be_done,
		pdt.quantity,
		pdt.remaining,
		pdt.expected_delivery_date,
		DATEDIFF(CURDATE(), pdt.expected_delivery_date) AS delay

		from `tabNitta Gatepass`  gate_pass inner join `tabNitta item` pdt on gate_pass.name=pdt.parent
		where (gate_pass.status ="Dispatched" or gate_pass.status ="Partially Completed") and pdt.expected_delivery_date<CURDATE() and pdt.status!='Completed' and pdt.status!='Assembled'
        AND (gate_pass.department = %(department)s OR %(department)s = '')
        AND (gate_pass.division = %(division)s OR %(division)s = '') 
		
		
	""",values={'department':gatepass_filter['department'],'division':gatepass_filter['division']},as_dict=1)
	
	for gate_pass in gate_pass_details:
		data.append({
			'division':gate_pass.division,
			'department':gate_pass.department,
			'gate_pass':gate_pass.name,
			'initiator':gate_pass.owner,
			'product':gate_pass.item,
			'quantity':gate_pass.quantity,
			'work_to_be_done':gate_pass.work_to_be_done,
			'expected_delivery_date':gate_pass.expected_delivery_date,
			'vendor':gate_pass.vendor,
			'delay':gate_pass.delay,
			'remaining':gate_pass.remaining,
			'dispatched_date':gate_pass.from_date
			

		})
	
	return data
def get_summary(datas):
	
	total_count = len(datas)	
	return [
		{
			'value':total_count,
			'indicator':'Red',
			'label':'Total',
			'datatype':'Int'
		},
		
	]


