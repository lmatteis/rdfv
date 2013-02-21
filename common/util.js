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
        var reg = '(\\r?\\n)' + //              # $1: CODE must be preceded by blank line
                    '(' + //                    # $2: CODE contents
                      '(?:' + //                # Group for multiple lines of code.
                        '(?:\\r?\\n)+' + //     # Each line preceded by a newline,
                        '(?:[ ]{2}|\\t).*' + // # and begins with two spaces or tab.
                      ')+' + //                 # One or more CODE lines
                      '\\r?\\n' + //            # CODE folowed by blank line.
                    ')' + //                    # End $2: CODE contents
                    '(?=\\r?\\n)'; //           # CODE folowed by blank line.
    
        return text.replace(new RegExp(reg, 'g'), function(code) {
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
