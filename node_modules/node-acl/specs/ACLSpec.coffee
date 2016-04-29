{CRUD,acl} = require '../'


describe "ACL Specs",->
	it "allows an operation according to rules",->
		rules = [
			{ role : "public", model: "test", crudOps : [ CRUD.update ] }
		]
		_acl = acl(rules)
		expect(_acl.validate({ role : "public", model: "test", crudOps : [ CRUD.update ] })).toEqual(null)

	it "blocks an operation according to the rules",->
		rules = [
			{ role : "public", model: "test", crudOps : [ CRUD.update ] }
		]
		_acl = acl(rules)
		expect(_acl.validate({ role : "public", model: "test", crudOps : [ CRUD.delete ] })).toBeTruthy()

	it "allows subset of allowed operations",->
		rules = [
			{ role : "public", model: "test", crudOps : [ CRUD.update, CRUD.delete, CRUD.create ] }
		]
		_acl = acl(rules)
		expect(_acl.validate({ role : "public", model: "test", crudOps : [ CRUD.update, CRUD.delete ] })).toEqual(null)

	it "validates multiple times",->
		rules = [
			{ role : "public", model: "test", crudOps : [ CRUD.read ] }
			{ role : "user", model: "test", crudOps : [ CRUD.update, CRUD.delete, CRUD.read ] }
			{ role : "admin", model: "moon", crudOps : [ CRUD.update, CRUD.delete, CRUD.create, CRUD.read ] }
			{ role : "system", model: "marse", crudOps : [ CRUD.delete, CRUD.create, CRUD.read ] }
			{ role : "pal", model: "girlfriend", crudOps : [ CRUD.delete ] }
		]
		_acl = acl(rules)
		expect(_acl.validate({ role : "public", model: "production", crudOps : [ CRUD.read ] })).toBeTruthy()
		expect(_acl.validate({ role : "user", model: "qa", crudOps : [ CRUD.update ] })).toBeTruthy()
		expect(_acl.validate({ role : "admin", model: "moon", crudOps : [ CRUD.read, CRUD.delete ] })).toEqual(null)
		expect(_acl.validate({ role : "system", model: "marse", crudOps : [ CRUD.update, CRUD.read ] })).toBeTruthy()
		expect(_acl.validate({ role : "pal", model: "girlfriend", crudOps : [ CRUD.delete ] })).toEqual(null)
