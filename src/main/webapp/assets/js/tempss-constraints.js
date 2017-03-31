window.constraints = {
		
	constraintStack: [],
	
	setup: function(data, $nameNode, $treeRoot) {
		log("Request to setup constraints for template...");
		if(!data.constraints) {
			log("There is no constraints information in the provided data object.");
			return;
		}
		// Store the initial constraint state for this solver
		if(!window.hasOwnProperty("constraints")) window.constraints = {};
		var solverName = $nameNode.text();
		window.constraints[solverName] = this.getInitialConstraintState(data, solverName, $treeRoot);
		
		// Add a comment to the root node with a link to display the constraint
		// information
    	var $constraintHtml = $('<div class="constraint-header">' + 
    		'<i class="glyphicon glyphicon-link"></i> This template ' +
    		'has constraints set. Click <a href="#" ' + 
    		'class="constraint-info-link">here</a> for details. &nbsp;&nbsp;' +
    		'<button class="btn btn-xs btn-default reset-constraints-btn">'+
    		'Reset constraints</button></div>');
    	$constraintHtml.insertAfter($nameNode);
    	
    	// Build a string for each element that has constraints listing the 
    	// other element(s) it is linked to. This will be displayed as a 
    	// tooltip alongside the link icon
    	var constraintMessages = {}
    	for(var key in data.constraintInfo) {
    		var mappings = data.constraintInfo[key];
    		// Split and get the last item from the variable fq name
    		var node = key.split(".").pop();
    		var msg = node + " has a constraint relationship with ";
    		for(var i = 0; i < mappings.length; i++) {
    			msg += mappings[i].split(".").pop();
    			if(i == mappings.length-1) msg+= ".";
    			else if(i == mappings.length-2) msg+= " and ";
    			else msg += ", ";
    		}
    		constraintMessages[key] = msg;
    	}
    	
    	// Add a constraint icon to each template node involved in a 
    	// constraint relationship. The constraint FQ name doesn't include the 
    	// top-level name - we search down from the top level.
    	var $rootLi = $treeRoot.children("li.parent_li");
    	for(var key in data.constraintInfo) {
    		//log("Handling key <" + key + ">...");
    		var pathItems = key.split(".");
    		// Search for the element that needs the constraint icon adding...
    		var $li = $rootLi;
    		for(var i = 0; i < pathItems.length; i++) {
    			$li = $li.find('> ul > li[data-fqname="' + pathItems[i] + '"]');
    		}
    		var $link = $('<i class="glyphicon glyphicon-link link-icon"' +
    				' title="' + constraintMessages[key] + 
    				'" data-toggle="tooltip" data-placement="right"></i>');
    		var $firstUl = $li.children('ul:first');
    		if($firstUl.length == 0) {
    			$li.append($link);
    		}
    		else {
    			$link.insertBefore($firstUl);
    		}
    		$li.addClass('constraint');
    	}
	},
	
	// Get the initial constraint state as a dict of parameters an all their values
	getInitialConstraintState: function(data, solverName, $treeRoot) {
		var constraintData = {};
		for(var prop in data.constraintInfo) {
			if(data.constraintInfo.hasOwnProperty(prop)) {
				// Find the element relating to property and if it is a select
				// with a list of options, store the options.
				var $element = $treeRoot.find('span[data-fqname="' + solverName + '"]').parent();
				var propPath = prop.split(".");
				var targetName = propPath[propPath.length-1];
				for(var i = 0; i < propPath.length; i++) {
					$element = $element.find('> ul > li.parent_li[data-fqname="' + propPath[i] + '"]');
				}
				if($element.length == 0) {
					log("Error finding node <" + targetName + "> during setup of initial constraints.");
					continue;
				}
				if($element.children('select').length > 0) {
					var $select = $element.children('select');
					var selectHTML = $select.html();
					constraintData[prop] = selectHTML;
				}
			}
		}
		return constraintData;
	},

	// Display a modal showing constraint information for the current template.
	showConstraintInfo: function(e) {
		var $target = $(e.currentTarget);
		var templateName = $target.parent().parent().children('span[data-fqname]').data('fqname');
		var templateId = $('input[name="componentname"]').val();
		log("Constraint info requested for solver template <" + templateName + "> with ID <" + templateId + ">...");
		e.preventDefault();
	
		// Get the constraint info and display in a BootstrapDialog
		BootstrapDialog.show({
			title: "Constraint information",
	        message: function(dialog) { 
	        	var $message = $('<div></div>');
	        	
	        	// Try to load the constraint data and show an error if loading fails
	        	$message.load('/tempss/api/constraints/' + templateId, 
	        			function( response, status, xhr ) {
	        				if (status=="error") {
	        					$message.html('<div class="alert alert-danger"><b>Unable to access constraint information.</b> An error has occurred accessing the constraint data from TemPSS for this template.</div>');
	        				}
	      		});
	        	return $message
	        }
	    });
	},
	
	updateConstraints: function(templateName, templateId, $triggerElement) {
		log("Constraints update triggered for template <" + templateName 
				+ "> with ID <" + templateId + "> and trigger element <" 
				+ $triggerElement.data('fqname') + ">");
		if($triggerElement.data("runSolver") !== undefined && !$triggerElement.data("runSolver")) {
			log("Data attribute directed solver not to run.");
			$triggerElement.removeAttr("data-run-solver");
			$triggerElement.removeData("runSolver");
			return;
		}
		// Find all the constraint items and prepare a form request to 
		// submit them to the server.
		// Create form data object to post the params to the server
	    var formDict = {};
		$('.constraint').each(function(index, el) {
			// constraint elements are li.parent_li nodes
			// data-fqname attribute only gives us the local name so we need
			// to search up the tree to build the correct fq name.
			var name = "";
			var $element = $(el);
			while($element.attr("data-fqname") && $element.data('fqname') != templateName) {
				log("Processing name: " + $element.data('fqname'));
				if(name == "") name = $element.data('fqname'); 
				else name = $element.data('fqname') + "." + name;
				$element = $element.parent().closest('li.parent_li');
				if($element.length == 0) break;
				
			}
			var value = "";
			var $el = $(el);
			if($el.children('select.choice').length > 0) {
				log("Preparing constraints - we have a select node...");
				var $option = $el.children('select.choice').find('option:selected');
				value = $option.val();
				if(value == "Select from list") value = "NONE";
				// Map NotProvided values back to off.
				else if(value == "NotProvided") value = "Off";
			}
			else if($el.children('span.toggle_button').length > 0) {
				log("Preparing constraints - we have an on/off node...");
				var $iEl = $el.find('> span.toggle_button > i.toggle_button');
				// FIXME: For now, we only want to set the actual value of the
				// on/off item when it has been set by a constraint result or
				// when it is the element that triggered the update
				// FIXME: For now, we only want to set the actual value of the
				// on/off item when it has been set by a constraint result or
				// when it is the element that triggered the update
				if($el.is($triggerElement)) {
					log("This is on/off node is the trigger element...");
					value = ($iEl.hasClass("enable_button")) ? "Off" : "On";
					$el.addClass("set_by_constraint");
				}
				else if(!$iEl.hasClass("set_by_constraint")) {
					value = "NONE";
				}
				else if($iEl.hasClass("enable_button")) {
					value = "Off";
				}
				else value = "On";
			}
			log("Name: " + name + "    Value: " + value);
			formDict[name] = value;
		});
		
		var csrfToken = $('input[name="_csrf"]').val();
		
		// Now we need to post the constraintParams to the server
		var solveRequest = $.ajax({
			beforeSend: function(jqxhr, settings) {
	        	jqxhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
	        },
			method: 'POST',
			url: '/tempss/api/constraints/' + templateId + '/solver',
			data: formDict
		});
		
		solveRequest.done(function(data) {
			if(data.hasOwnProperty("result") && 
			   data.hasOwnProperty("solutions") && 
			   data["result"] == "OK") {
				
				log("solve request completed successfully." + JSON.stringify(data));
				// Iterate through solutions and update the values
				for(var i = 0; i < data.solutions.length; i++) {
					var solution = data.solutions[i];
					log("Processing constraint variable: " + solution['variable']);
					var name = solution['variable'];
					var nameParts = name.split(".");
					var $targetEl = window.treeRoot.find('li.parent_li[data-fqname="' + nameParts[0] + '"]');
					for(var j = 1; j < nameParts.length; j++) {
						$targetEl = $targetEl.find('li.parent_li[data-fqname="' + nameParts[j] + '"]')
					}
					if(!$targetEl.length) {
						log("ERROR, couldn't find tree node for variable <" + name + ">");
						continue;
					}
					// See if we have a select element or on/off
					if($targetEl.children('select.choice').length) {
						var $selectEl = $targetEl.children('select.choice');
						var selectHTML = '';
						if(solution['values'].length > 1) {
							selectHTML = '<option value="Select from list">Select from list</option>';
						}
						for(var j = 0; j < solution['values'].length; j++) {
							// Remap "Off" values for select elements to NotProvided
							var solutionValue = (solution['values'][j] == "Off") ? "NotProvided" : solution['values'][j]; 
							selectHTML += '<option value="' + solutionValue + 
							'">' + solutionValue + '</option>';
						}
						$selectEl.html(selectHTML);
						// Can't trigger change here since this will put is in
						// an infinite loop since triggering change calls the 
						// solver and then that would trigger another change to
						// re-validate. Instead, we call validate here manually.
						// Depending on whether this is a choice option, an 
						// enumeration select list or a text input, the 
						// way that validation is called is slightly different.
						var changeStr = $selectEl.attr("onchange");
						if(changeStr.indexOf("validateEntries") == 0) {
							// We have a select dropdown (text inputs also use
							// this approach but we've already filtered for 
							// select above).
							// Restrictions JSON needs to be passed as a string
							var restrictionsJSON = changeStr.substring(
									changeStr.indexOf("\'\{")+1,
									changeStr.lastIndexOf("\}\'")+1
							);
							// If the select is now set to a specific value,
							// call the validation function
							if($selectEl.find('option:selected').val() != "Select from list")
								validateEntries($selectEl, 'xs:string', restrictionsJSON);
						}
						else if(changeStr.indexOf("selectChoiceItem") == 0) {
							// Can't trigger the change event on the choice 
							// select directly but need to call selectChoiceItem
							var event = {target: $selectEl[0]};
							selectChoiceItem(event);
						}
					}
					// Else if we have an on/off node
					else if($targetEl.children('span.toggle_button').length > 0) {
						var $toggleSpan = $targetEl.children('span.toggle_button');
						var solutionValue = "";
						if(solution['values'].length == 1) {
							solutionValue = solution['values'][0];
							log("We have a fixed value for on/off node that needs to be set.");
							if(solutionValue == "Off" && $toggleSpan.children('i').hasClass('disable_button')) {
								$targetEl.data("run-solver", false);
								$toggleSpan.trigger('click');
							}
							else if(solutionValue == "On" && $toggleSpan.children('i').hasClass('enable_button')) {
								$targetEl.data("run-solver", false);
								$toggleSpan.trigger('click');
							}
							$targetEl.addClass('set_by_constraint');
						}						
					}
				}
			}
			else {
				log("solve request failed: " + JSON.stringify(data));
			}
		}).fail(function(data) {
			log("solve request returned error: " + JSON.stringify(data));
		});
	},

	resetConstraintsConfirmation: function(e) {
		BootstrapDialog.show({
			title: "Reset constraints",
			message: "<strong>Are you sure you want to reset constraints?</strong><br/><br/>This will reset all values that have constraints within this tempalte to their default values.",
			type: BootstrapDialog.TYPE_WARNING,
			buttons: [{
                label: 'Close',
                cssClass: 'btn-danger',
                action: function(dialog) {
                    dialog.close();
                }
            },{
                label: 'Confirm',
                action: (function(dialog) {
                	this.resetConstraints(e);
                	dialog.close();
                }).bind(this)
            }]
		});
	},
	
	resetConstraints: function(e) {
		var $rootUl = $('#template-container ul[role="tree"]');
		var $templateNameNode = $rootUl.find("> li.parent_li > span[data-fqname]");
		var templateName = $templateNameNode.data('fqname');
		if(!window.hasOwnProperty("constraints") && !window.constraints.hasOwnProperty(templateName)) {
			log("ERROR: Cannot reset constraints - base constraint data for template <" + templateName + "> this doesn't exist");
			return;
		}
		var constraintData = window.constraints[templateName];
		for(var key in constraintData) {
			var $element = $($templateNameNode.parent()[0]);
			var keyElements = key.split('.');
			for(var i = 0; i < keyElements.length; i++) {
				$element = $element.find('> ul > li.parent_li[data-fqname="' + keyElements[i] + '"]');
			}
			if($element.children('select').length > 0) {
				var $select = $element.children('select');
				$select.html(constraintData[key]);
				// Now re-initialise this select field
				var changeStr = $select.attr("onchange");
				if(changeStr.indexOf("validateEntries") == 0) {
					// We have a select dropdown (text inputs also use
					// this approach but we've already filtered for 
					// select above).
					// Restrictions JSON needs to be passed as a string
					var restrictionsJSON = changeStr.substring(
							changeStr.indexOf("\'\{")+1,
							changeStr.lastIndexOf("\}\'")+1
					);
					// Run the validation
					validateEntries($select, 'xs:string', restrictionsJSON);
				}
				else if(changeStr.indexOf("selectChoiceItem") == 0) {
					// Can't trigger the change event on the choice 
					// select directly but need to call selectChoiceItem
					var event = {target: $select[0]};
					selectChoiceItem(event);
				}
			}
		}
		// Remove the set_by_constraint from any toggle nodes...
		$rootUl.find('li.parent_li.constraint').removeClass('set_by_constraint');
	
	},
	
	/**
	 * Undo a constraint change. We maintain a stack of constraint changes and
	 * this pops the stack and resets all constraint items to their previous
	 * values. It is then necessary to trigger validation on these items. 
	 */
	undoConstraintChange: function(e) {
		log("Undo constraint change requested.");
		// Check the constraint stack has a size of >= 1 and if so, 
		// pop the value and apply the data to the fields.
		var size = this.constraintStack.length;
		if(size < 1) {
			log("The stack is empty, there's nothing to undo.");
			return;
		}
		// Pop the value and handle the data
		var value = this.constraintStack.pop();
		
	},
	
	redoConstraintChange: function(e) {
		log("The redo constraint change feature is not yet implemented...");
	}
}