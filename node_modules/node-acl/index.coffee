logr = require('node-logr').getLogger(__filename)

### @param [ { role:"..", model:"..", crudOps:[..] }, .. ]  rulesList ###
exports.acl = (rulesList)->
	new ACL(rulesList)

exports.CRUD = {
	"create"
	"read"
	"update"
	"delete"
	"patch"
}

class ACL

	### @type { role : { model: {[crudOps,..]} } }  ###
	rules : null

	constructor : (rulesList)->
		@rules = {}
		for rule in rulesList
			if not ( rule.role of @rules ) then @rules[ rule.role ] = {}
			if not ( rule.model of @rules[rule.role] ) then @rules[rule.role][rule.model] = []
			@rules[rule.role][rule.model].push(crudOp) for crudOp in rule.crudOps

	### @param { role:"..", model:"..", crudOps:[..] } options ###
	### @return String - null if validation passed OK ###
	validate : (options)=>
		allowedOps = @rules[ options.role ]?[ options.model ]
		if not allowedOps || ( options.crudOps.filter( (ao)-> allowedOps.indexOf(ao) == -1 ).length > 0 )
			logr.notice "failed validation:#{JSON.stringify(options)}"
			return "failed validation:#{JSON.stringify(options)}"
		else return null


