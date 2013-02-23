// https://github.com/schmidek/News-aggregator/blob/master/views/rank/reduce.js
exports.findScore =  function(points, jsonDate) { 
    var s = points + 1; 
    var order = Math.log(Math.max(Math.abs(s),1)) / Math.log(10);
    var sign = s > 0 ? 1 : (s<0 ? -1 : 0);
    var seconds = (new Date(jsonDate).getTime()    /1000) - 1134028003;
    return Math.round((order + sign * seconds / 45000) * 10000000) / 10000000; 
}
exports.getUnique = function(arr){
   var u = {}, a = [];
   for(var i = 0, l = arr.length; i < l; ++i){
      if(arr[i] in u)
         continue;
      a.push(arr[i]);
      u[arr[i]] = 1;
   }
   return a;
}
exports.getPoints = function(voted) {
    if(!voted) voted = [];
    var arr = exports.getUnique(voted);
    var points = arr.length;
    return points;
}

exports.getDomain = function(url) {
    return url.match(/:\/\/(www\.)?(.[^/:]+)/)[2];
}

exports.getNumComments = function(comments) {
    if(comments && comments.length) {
        return comments.length;
    } else {
        return 0;
    }
}

exports.inArray = function(value, arr) {
    if(!arr) return false;
    var i;
    for (i=0; i<arr.length; i++) { 
        if (arr[i] === value) return true; 
    }
    return false;
}

exports.timeDifference = function(current, previous, config) {
    
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
    
    var elapsed = current - previous;
    
    if (elapsed < msPerMinute) {
        var val = Math.round(elapsed/1000); 
        if(val == 1) {
            val += ' ' + config.conf_secondago;
        } else {
            val += ' ' + config.conf_secondsago;
        }
        return val;   
    }
    
    else if (elapsed < msPerHour) {
        var val =  Math.round(elapsed/msPerMinute);   
        if(val == 1) {
            val += ' ' + config.conf_minuteago;
        } else {
            val += ' ' + config.conf_minutesago;
        }
        return val;
    }
    
    else if (elapsed < msPerDay ) {
        var val = Math.round(elapsed/msPerHour );   
        if(val == 1) {
            val += ' ' + config.conf_hourago;
        } else {
            val += ' ' + config.conf_hoursago;
        }
        return val;
    }

    else if (elapsed < msPerMonth) {
        var val = Math.round(elapsed/msPerDay);   
        if(val == 1) {
            val += ' ' + config.conf_dayago;
        } else {
            val += ' ' + config.conf_daysago;
        }
        return val;
    }
    
    else if (elapsed < msPerYear) {
        var val = Math.round(elapsed/msPerMonth);   
        if(val == 1) {
            val += ' ' + config.conf_monthago;
        } else {
            val += ' ' + config.conf_monthsago;
        }
        return val;
    }
    
    else {
        var val = Math.round(elapsed/msPerYear );   
        if(val == 1) {
            val += ' ' + config.conf_yearago;
        } else {
            val += ' ' + config.conf_yearsago;
        }
        return val;
    }
}


exports.getTriplesRegex = function(escaped) {
    if(escaped) {
        var re = /(&lt;([^\s]+)&gt;|_:([A-Za-z][A-Za-z0-9\-_]*))[ ]*&lt;[^\s]+&gt;[ ]*(&lt;[^\s]+&gt;|_:([A-Za-z][A-Za-z0-9\-_]*)|"((?:\\"|[^"])*)"(@([a-z]+[\-A-Za-z0-9]*)|\^\^&lt;([^&gt;]+)&gt;)?)[ ]*./ig;
    } else {
        var re = /(<([^\s]+)>|_:([A-Za-z][A-Za-z0-9\-_]*))[ ]*<[^\s]+>[ ]*(<[^\s]+>|_:([A-Za-z][A-Za-z0-9\-_]*)|"((?:\\"|[^"])*)"(@([a-z]+[\-A-Za-z0-9]*)|\^\^<([^>]+)>)?)[ ]*./ig;
    }
    return re;
}

var reg = '(' + //                    # $2: CODE contents
                      '(?:' + //                # Group for multiple lines of code.
                        '(?:\\r?\\n)+' + //     # Each line preceded by a newline,
                        '(?:[ ]{2}|\\t).*' + // # and begins with two spaces or tab.
                      ')+' + //                 # One or more CODE lines
                    ')'; //                    # End $2: CODE contents
exports.codeRegex = new RegExp(reg, 'g');

exports.formatdoc = function(content) {
    // does away with nasty characters
    var escapeHTML = function(s) {
      s = String(s === null ? "" : s);
      return s.replace(/&(?!\w+;)|["<>\\]/g, function(s) {
        switch(s) {
        case "&": return "&amp;";
        case "\\": return "\\\\";
        case '"': return '\"';
        case "<": return "&lt;";
        case ">": return "&gt;";
        default: return s;
        }
      });
    }
    content = escapeHTML(content);

    function afterHash(str) {
        var indexOf = str.indexOf("#");
        if(indexOf == -1) return false;
        return str.substr(indexOf + 1); 
    }
    // find n-triples
    function replaceNTriples(text) {
        var re = exports.getTriplesRegex(true);
        return text.replace(re, function(triple) {
            var subject = arguments[2];
            var hash = afterHash(subject);
            var ret = '<code>' + triple + '</code>';
            if(hash) {
                ret = '<a name="' + hash + '"></a>' + ret;
            }
            return ret;
        }); 
    }
    //content = replaceNTriples(content);

    function trimNewlines(str) {
        var newlines = '[\\r\\n]+';
        // first remove the newlines from the beginning and end of the content
        str = str.replace(new RegExp('^' + newlines, 'g'), '');
        str = str.replace(new RegExp(newlines + '$', 'g'), '');
        return str;
    }

    // replace 2 or more indented spaces with code
    function replaceCode(text) {
        return text.replace(exports.codeRegex, function(code) {
            code = trimNewlines(code);
            code = code.replace(/\r\n/g, "\n");
            return '<pre><code>' + code + '</code></pre>';
        })
    }
    content = replaceCode(content);

    // first remove the newlines from the beginning and end of the content
    content = trimNewlines(content);

    // then replace 2 or more newlines with the paragraphs
    content = '<p>' + content.replace(/(\r\n){2,}/g, '</p><p>') + '</p>';

    // convert URL to actual urls trimmed 60 chars
    function replaceURLWithHTMLLinks(text) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#;\/%=~_|])/ig;
        return text.replace(exp, function(url) {
            var last = url[url.length - 4] + url[url.length - 3] + url[url.length - 2] + url[url.length - 1];
            if(last == '&gt;') {
                url = url.slice(0,-4);
            }
            var ret = '<a href="' + url + '">' + url + '</a>';
            if(last == '&gt;') {
                ret += '&gt;';
            }
            // no need for short urls in N-Triples
            //if(shortUrl.length > 60) shortUrl = shortUrl.substring(0, 60) + '...';
            return ret
        }); 
    }
    content = replaceURLWithHTMLLinks(content);

    return content;
}

exports.findTurtle = function(comments) {
    var turtle = new ParseTurtle;
    
    var allValidTurtle = '';

    for(var i in comments) {
        var commentText = comments[i].text;
        var arr = commentText.match(exports.codeRegex);
        if(!arr) continue;
        // if there's code in this comment, check if it's turtle
        if(arr.length && arr[0]) {
            // check if it's turtle
            var codeBlock = arr[0];
            if(!codeBlock) continue;
            try {
                var rdf = turtle.parse(codeBlock);
                // it's valid! add it to the global var
                allValidTurtle += codeBlock;
            } catch(e) {
            }
        }
    }

    // now we have allValidTurtle! let's turn it into JSON!

    return allValidTurtle;
}

//--------------------- about this script -------------------------
ParseTurtle.prototype.meta = {
"@prefix": "<http://purl.org/net/ns/doas#>",
"@about": "<http://www.kanzaki.com/parts/turtle.js>", a: ":JavaScript",
 title: "An experimental Turtle parser",
 shortdesc: "Parse Turtle as simple as possible. Not perfect.",
 created: "2006-02-22",  release: {revision: "0.45.1", created: "2006-03-11"},
 author: {name: "KANZAKI, Masahide", homepage: "<http://www.kanzaki.com/>"},
 page: "<http://www.kanzaki.com/works/2006/misc/0308turtle.html>",
 license: "<http://creativecommons.org/licenses/LGPL/2.1/>"};
//-----------------------------------------------------------------

/**
 * Constructor: ex) var turtle = new ParseTurtle;
 */
function ParseTurtle(){
	return this;
}

/**
 * Receives RDF/Turtle string and returns array of triples
 * Usually, call this function to get RDF triples array from Turtle string: 
 * ex) rdf = turtle.parse(turtle_string);
 * @param	str : Turtle string
 * @return	RDF triples as JSON array.
 */
ParseTurtle.prototype.parse = function (str){
	this.triples = [];
	this.ns = {
		"rdf:":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"xsd:":"http://www.w3.org/2001/XMLSchema#",
		"_:":"genid:"
	};
	this.bid = 0;
	var status = 's'; // s,p,o or et(end triple)-- status of current token
	var arg = {
		'line': str,
		'type': '',
		'lang': '',
		'datatype': ''
	}; 
	this.loopcount = 0; //debug

	this.parse_triple(arg, '', status);
	if(arg.line) this.parseError("Unbalanced parse end: " + arg.line,arg);
	return this.triples;
}


/**
 * Parses string and generates JSON array.
 * @param	arg : object reference of {line,type..} to return updated value
 * @param	subj : subject uri or qname
 * @param	status : starting (caller's) status of the token
 */
ParseTurtle.prototype.parse_triple = function (arg, subj, status){
	var token;//, pfx = '';
	var tmp = {}; // temporary stores p-o list for each p as array
	var tmp_po_obj = {}; // temporary p-o object to pass by reference 
	var prop, obj; // property uri or qname
	var init_status = status; // determins who calls this function
	
	while(arg.line){
		token = this.get_token(arg);
		if(arg.type == 'skip') continue;
		//else if(arg.type == 'separator')
		//	status = 'et'; // e.g. bnode subject might be followed by '.'
		
		switch(status){
		case 's':
			if(arg.type == 'at'){
				if(token == '@prefix'){
					status = 'pfx';
				}else
					this.tokenError(token,"not a Turtle directive.",arg);
			}else if(token == '['){
				subj = this.gen_bnodeid();
				this.parse_triple(arg, subj, 'p');
				status = 'pbn'; // predicate for bnode
			}else if(arg.type == 'syntax'){
				this.tokenError(token,"cannot have this token here (subject).",arg);
			}else if(arg.type == 'literal'){
				this.tokenError(token,"cannot have literal as subject.",arg);
			}else{
				if(arg.type == 'qname'){
					subj = this.qname2uri(token);
				}else{
					subj = token;
				}
				status = 'p'; // next token should be predicate
			}
			break;
		case 'pfx':
			if(! token.match(/:$/))
				this.tokenError(token, "prefix must end with ':'.",arg);
			prop = token;
			status = 'ns'; // next token should be ns uri
			break;
		case 'pbn': 
			if(token == '.'){
				// if '.' after bnode subject, next should be a subject
				status = 's';break;}
		case 'p': 
			if(token == ']'){
				return; // parse predicate again
			}else if(arg.type == 'syntax'){
				this.tokenError(token, "cannot have this token here (predicate).",arg);
			}else if(arg.type == 'literal')
				this.tokenError(token,"cannot have literal as predicate.",arg);
			prop = token;
			if(prop == 'a') prop = 'rdf:type';
			if(arg.type == 'qname'){
				if(token.substr(0,2) == '_:')
					this.tokenError(token, "cannot have bnode here (predicate).",arg);
				prop = this.qname2uri(prop);
			}
			status = 'o'; // next token should be object
			break;
		case 'ns':
			this.ns[prop] = token;
			status = 'et';
			break;
		case 'o':
			if(token == '['){
				obj = this.gen_bnodeid();
				this.parse_triple(arg, obj, 'p');
				arg.type = 'bnode';
			}else if(token == '('){
				obj = this.gen_bnodeid();
				var isNil = this.parse_collection(arg, obj);
				if(isNil) obj = isNil;
				//this.bid--; // moved to parse_collection()
			}else if(arg.type == 'syntax'){
				this.tokenError(token, "cannot have this token here (object).", arg);
			}else if(arg.type == 'qname'){
				obj = this.qname2uri(token);
			}else{
				obj = token;
			}
			this.add_triple(subj, prop, obj, arg);
			status = 'et';
			break;
		case 'et':
			switch(token){
			case ';':
				status = 'p'; break;
			case ',':
				status = 'o'; break;
			case '.':
				status = 's'; break;
			case ']':
				return; // exit from recursive call -- maybe need nest check
			default:
			this.tokenError(token, "cannot have this token here (end of triple).", arg);
			}
			break;
		}
	}
	if(status != 's')
		this.parseError("Unexpected end status: "+status,arg);
}

/**
 * Parses RDF Collection, i.e. inside ( ... ) of Turtle
 * @param	arg : object reference of {line,type..} to return updated value
 * @param	subj : subject bnode of the collection
 */
ParseTurtle.prototype.parse_collection = function (arg, subj){
	var token, obj, fnode, nodetype;
	var RDFNS = this.ns['rdf:'];
	while(arg.line){
		token = this.get_token(arg)
		if(arg.type == 'qname') token = this.qname2uri(token);
		if(token == ')'){
			this.bid--; // didn't use bnode obj, so decrement index
			if(obj)
				this.add_triple(subj, RDFNS+'rest', RDFNS+'nil', arg);
			else
				return RDFNS+'nil';
			break;
		}else {
			if(obj){
				this.add_triple(subj, RDFNS+'rest', obj, arg, 'resource');
				subj = obj;
			}
			if(token == '['){
				fnode = this.gen_bnodeid();
				this.parse_triple(arg, fnode, 'p');
				arg.type = 'bnode';
			}else if(token == '('){
				fnode = this.gen_bnodeid();
				var isNil = this.parse_collection(arg, fnode);
				if(isNil) fnode = isNil;
				arg.type = 'bnode';
			}else if(arg.type == 'syntax'){
				this.tokenError(token, "not allowed in Collection.",arg);
			}else{
				fnode = token;
			}
			this.add_triple(subj, RDFNS+'first', fnode, arg);
			obj = this.gen_bnodeid();
		}
	}
	return '';
}


/**
 * Adds resulting triple to array (this.triples) in the same manner as JimLey's RDF parser
 * @param	s : triple's subject
 * @param	p : triple's predicate
 * @param	o : triple's object
 * @param	arg : object reference of {line,type,lang,datatype}
 * @param	type : explicit type of object (optional. usually get from arg.type)
 */
ParseTurtle.prototype.add_triple = function (s, p, o, arg, type){
	if(arg.type == 'number')
		type = 'literal';
	if(! type)
		type = (arg.type == 'literal') ? 'literal' : 'resource';

	this.triples.push({
		"subject":s,
		"predicate":p,
		"object":o,
		"type":type,
		"lang":arg.lang,
		"datatype":arg.datatype
	});
}


/**
 * Tokenize string into Trutle tokens. Trims line after tokenize.
 * @param	arg : object reference of {line,type} to return updated value
 * @return	a Turtle token.
 */
ParseTurtle.prototype.get_token = function (arg){
	var val, line = arg.line.replace(/^[\n\s]*/,'');
	if(this.loopcount++ > 5000)
		this.parseError("too much loop -- possibly error ?",arg);
	switch(line.charAt(0)){
	case '#': // rest of the line is comment
		arg.line = line.replace(/#(.*?)$/m,'');
		arg.type = 'skip';
		return '';
	case '':
		arg.line = line.substr(1);
		arg.type = 'skip';
		return '';
	case '"':
		if(line.substr(1,2) == '""'){
			//longString
			// complicated because javascript doesn't have 's' switch
			if(line.substr(1,5) == '"""""'){
				arg.line = line.substr(6);
				val = '';
			}else{
				while(! line.match(/"""(.*?)([^\\])"""/)){
					if(!RegExp.rightContext)
						this.matchError('"""','longString',arg);
					line = line.replace(/\n/,'\\n');
				}
				arg.line = RegExp.rightContext;
				val = RegExp.$1 + RegExp.$2;
				val = val.replace(/\\\"/g, '"');
			}
		}else{
			//String
			if(line.charAt(1) == '"'){
				arg.line = line.substr(2);
				val = '';
			}else if(line.match(/"(.*?)([^\\])"/)){
					arg.line = RegExp.rightContext;
					val = RegExp.$1 + RegExp.$2;
			}else
				this.matchError('"', "literal",arg);
		}
		//val = val.replace(/\t/g,"\\t");
		this.get_literal_info(arg);
		arg.type = 'literal';
		return val;
	case '<':
		arg.type = 'uri';
		arg.lang = null;
		arg.datatype = null;
		if(line.match(/(.*?)>/)){
			arg.line = RegExp.rightContext;
			return RegExp.$1.substr(1); // omit '<'
		}else
			this.matchError(">","URI",arg);
	case '@':
		arg.type = 'at';
		arg.line = line.replace(/([^\s]+)/,''); // match at least '@'
		return RegExp.$1;
	case '^':
		if(line.charAt(1) == '^'){
			arg.type = 'datatype';
			arg.line = line.substr(2);
			return '^^';
		}else
			this.tokenError('^', "not allowed here.",arg);
	case '?':
		if(arg.q == 'sparql'){
			arg.type = 'variable';
			if(line.match(/\?([^\s]+)/)){
				arg.line = RegExp.rightContext;
				return '?' + RegExp.$1;
			}else
				this.tokenError('?', "variable name not found",arg);
		}else
			this.tokenError('?', "not allowed here.",arg);
	case '.':
	case ';':
	case ',':
//		arg.type = 'separator';
//		arg.line = line.substr(1);
//		return line.charAt(0);
	case '[':
	case ']':
	case '(':
	case ')':
		arg.type = 'syntax';
		arg.line = line.substr(1);
		return line.charAt(0);
	default:
		//arg.line = line.replace(/([^\s\;\.\,\]\)\^]+)/,'');
		if(! line.match(/^([^\s\x21-\x2a,\.\/\x3b-\x40\x5b-\x5e\x60\x7b-\x7f]+)/)){
			val = line.match(/^[^\s\.\;\:\,]+/);
			this.tokenError(val, "Unrecognized token",arg);
		}arg.line = RegExp.rightContext;
		val = RegExp.$1;
		arg.lang = null;
		if(val == 'true' || val == 'false'){
			arg.type = 'literal'
			arg.datatype = this.ns['xsd:'] + 'boolean'
		}else if(isNaN(val))
			arg.type = 'qname'
		else{
			arg.type = 'number';
			if(arg.line.match(/^(\.[0-9eE]+)/)){
				arg.line = RegExp.rightContext;
				val += RegExp.$1;
			}
			if(val.match(/[eE]/))
				arg.datatype = this.ns['xsd:'] + 'double'
			else if(val.indexOf('.') > -1)
				arg.datatype = this.ns['xsd:'] + 'decimal'
			else 
				arg.datatype = this.ns['xsd:'] + 'integer';
			if(val.charAt(0) == '0') val = val * 1;
			return val;
		}
		return val;
	}
}
/**
 * Test for lang tag and datatype for literal token
 * @param	arg : object reference of {line,type,lang,datatype}
 * to return updated value and lang or datatype
 */

ParseTurtle.prototype.get_literal_info = function (arg){
	switch(arg.line.charAt(0)){
		case '@':
			arg.line = arg.line.substr(1);
			arg.lang = this.get_token(arg);
			arg.datatype = null;
			break;
		case '^':
			this.get_token(arg); // trim second '^';
			var dt = this.get_token(arg);
			arg.datatype = arg.type == 'qname' ? this.qname2uri(dt) : dt;
			arg.lang = null;
			break;
		default:
			arg.datatype = null;
			arg.lang = null;
	}
}

/**
 * Generates an incremented blank node id, as the same form as JimLey's parser
 */
ParseTurtle.prototype.gen_bnodeid = function (){
	this.bid++;
	return 'genid:' + this.bid ;
}

/**
 * Expands QName to fully qualified URI
 * @param	qname : QName
 * @return	expanded URI
 */
ParseTurtle.prototype.qname2uri = function (qname){
	if(!qname.match(/^(.*?):/))
		this.tokenError(qname, 'No prefix where QName expected.');
	return this.ns[RegExp.$1+':'] + RegExp.rightContext;
}

/**
 * Throws exception on regular expression matching error, otherwise
 * browser will be trapped by infinite loop.
 * @param	etag : missing closing token
 * @param	type : processing token type
 * @param	arg : context object
 */
ParseTurtle.prototype.matchError = function (etag, type, arg){
	this.parseError("Could not find closing " + etag +" for " + type, arg);
}

ParseTurtle.prototype.tokenError = function (token, msg, arg){
	this.parseError("'"+token + "' --> " + msg, arg);
}


/**
 * Throws exception and reports an error
 * @param	srt : error message
 * @param	arg : context object
 */
ParseTurtle.prototype.parseError = function (str, arg){
	var msg = arg ? str + "\nwhen processing: " + arg.line.substr(0,40) + "\ntype: " + arg.type : str
	throw msg;
}



/*************************************
 * Experiments to map Turtle to JSON
 **************************************/


/**
 * Receives RDF/Turtle triples and returns corresponding hierarchy JSON tree.
 * Usually, call this function to get JSON representation from Turtle string: 
 * ex) json = turtle.parse_to_json(turtle_string);
 * @param	str : Turtle string
 * @return	RDF triples as JSON object.
 */
ParseTurtle.prototype.parse_to_json = function (str){
	this.rdf = {};
	var status = 's'; // s,p,o or et(end triple)-- status of current processing token
	var arg = {
		'line': str,
		'type':''}; 
	this.parse_subtree(arg, this.rdf, status);
	return this.rdf;
}


/**
 * Parses string and generates JSON subtree.
 * @param	arg : object reference of {line,type} to return updated value
 * @param	dest : destination object to add resulting JSON prop-value
 */
ParseTurtle.prototype.parse_subtree = function (arg, dest, status){
	var token, pfx = '';
	var tmp = {}; // temporary stores p-o list for each p as array
	var tmp_po_obj = {}; // temporary p-o object to pass by reference 
	var prop; // property name for JSON object
	var init_status = status; // determins who calls this function
	
	while(arg.line){
		token = this.get_token(arg);
		switch(status){
		case 's':
		case 'c':
			//later
			if(arg.type == 'at'){
				pfx = token;
				status = 'pfx';
			}else{
				if(arg.type == 'uri') dest["@about"] = token;
				status = 'p';
			}
			break;
		case 'pfx':
			prop = token == ':' ? pfx : pfx + ':' + token.slice(0,-1);
			status = 'o';
			break;
		case 'p':
			prop = token.replace(/^:/,'');
			status = 'o';
			break;
		case 'o':
			if(typeof(tmp[prop]) == "undefined") tmp[prop] = [];
			if(token == '['){
				tmp_po_obj = {};
				this.parse_subtree(arg, tmp_po_obj, 'p');
				tmp[prop].push(tmp_po_obj);
				status = 'et';
			}else if(token == '('){
				tmp_po_obj = {};
				this.parse_subtree(arg, tmp_po_obj, 'c');
				tmp[prop].push(tmp_po_obj);
				this.flush_property(tmp,dest);
				status = 'o';
			}else if(token == ')'){
				//init_status = 'p';
				return;
			}else if(arg.type == 'syntax'){
				;
				;
			}else{
				if(arg.type == 'uri') token = '<' + token + '>';
				tmp[prop].push(token);
				//status = init_status == 'o' ? 'o' : 'et';
				status = init_status == 'c' ? 'o' : 'et';
			}
			break;
		case 'et':
			switch(token){
				case ';':
					status = 'p'; break;
				case ',':
					status = 'o'; break;
				case '.':
					status = 's';
					this.flush_property(tmp,dest);
					break;
				case ']':
				case ')':
					this.flush_property(tmp,dest);
					return;
			}
			break;
		}
	}
	if(tmp) this.flush_property(tmp,dest);
}

/**
 * Add property-value to destination object, so that the result will be
 * simple value if only one member, array otherwise
 * @param	tmp : object that temporary holds p-v array for each property
 * @param	dest : destination object to add resulting JSON prop-value
 */
ParseTurtle.prototype.flush_property = function (tmp,dest){
	for(key in tmp)
		//alert('p = '+key + ', o = '+tmp[key][0]);
		if(tmp[key].length == 1)
			dest[key] = tmp[key][0];
		else
			dest[key] = tmp[key];
	tmp = {};
}
