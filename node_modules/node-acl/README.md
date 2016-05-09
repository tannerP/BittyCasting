node-acl [![Build Status](https://travis-ci.org/romansky/node-acl.png)](https://travis-ci.org/romansky/node-acl)
====

A tiny ACL toolkit for Node.js

## Usage

First get an instance of node-acl by passing a set of rules to a factory function

	{CRUD,acl} = require 'node-acl'
	myRules = [
		{ role: "public", model : "stories", crudOps : [CRUD.read] }
		{ role: "admin", model : "stories", crudOps : [CRUD.read, CRUD.create, CRUD.delete] }
	]
	aclInstance = acl(myRules)

Use the instance where ever you need the validation in your code

	result = aclInstance.validate({role:"admin", model: "stories", crudOps: [CRUD.create]})
	#> result : null
	result = aclInstance.validate({role:"public", model: "stories", crudOps: [CRUD.update]})
	#> result : failed validation:{"role":"public","model":"stories","crudOps":["update"]}
	
## Installation

	npm install node-acl
