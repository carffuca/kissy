function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/navigation-view/bar.js']) {
  _$jscoverage['/navigation-view/bar.js'] = {};
  _$jscoverage['/navigation-view/bar.js'].lineData = [];
  _$jscoverage['/navigation-view/bar.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[11] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[13] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[14] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[16] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[18] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[20] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[21] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[22] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[27] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[39] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[50] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[51] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[78] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[79] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[83] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[84] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[86] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[87] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[90] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[93] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[99] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[102] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[122] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[128] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[130] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[131] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[132] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[139] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[143] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[144] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[145] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[146] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[147] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[148] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[149] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[150] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[152] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[154] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[155] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[159] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[160] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[164] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[165] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[169] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[173] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[177] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[178] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[179] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[180] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[181] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[183] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[186] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[187] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[188] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[189] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[190] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[191] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[192] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[193] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[195] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[196] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[197] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[198] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[199] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[200] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[201] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[202] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[204] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[205] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[207] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[208] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[209] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[210] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[213] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[214] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[216] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[217] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[218] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[223] = 0;
}
if (! _$jscoverage['/navigation-view/bar.js'].functionData) {
  _$jscoverage['/navigation-view/bar.js'].functionData = [];
  _$jscoverage['/navigation-view/bar.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[8] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[9] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[10] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[11] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[12] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[13] = 0;
}
if (! _$jscoverage['/navigation-view/bar.js'].branchData) {
  _$jscoverage['/navigation-view/bar.js'].branchData = {};
  _$jscoverage['/navigation-view/bar.js'].branchData['50'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['79'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['83'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['86'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['95'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['145'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['146'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['147'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['149'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['180'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['192'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['201'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['207'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['207'][1] = new BranchData();
}
_$jscoverage['/navigation-view/bar.js'].branchData['207'][1].init(1241, 37, 'ghostBackEl.css(\'display\') !== \'none\'');
function visit15_207_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['201'][1].init(1013, 32, 'backEl.css(\'display\') !== \'none\'');
function visit14_201_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['192'][1].init(601, 16, 'self.ghostBackEl');
function visit13_192_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['180'][1].init(137, 16, 'self.ghostBackEl');
function visit12_180_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['149'][1].init(200, 17, 'align === \'right\'');
function visit11_149_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['147'][1].init(90, 16, 'align === \'left\'');
function visit10_147_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['146'][1].init(45, 22, 'config.align || \'left\'');
function visit9_146_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['145'][1].init(133, 34, '!config.elBefore && !config.render');
function visit8_145_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['95'][1].init(77, 19, 'omega !== undefined');
function visit7_95_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['86'][1].init(77, 19, 'omega !== undefined');
function visit6_86_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['83'][1].init(1468, 7, 'reverse');
function visit5_83_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['79'][1].init(1376, 19, 'titleWidth > titleX');
function visit4_79_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['50'][1].init(533, 7, 'reverse');
function visit3_50_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view/bar.js'].functionData[0]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[6]++;
  var Control = require('component/control');
  _$jscoverage['/navigation-view/bar.js'].lineData[7]++;
  var BarRender = require('./bar-render');
  _$jscoverage['/navigation-view/bar.js'].lineData[8]++;
  var Button = require('button');
  _$jscoverage['/navigation-view/bar.js'].lineData[10]++;
  function createGhost(elem) {
    _$jscoverage['/navigation-view/bar.js'].functionData[1]++;
    _$jscoverage['/navigation-view/bar.js'].lineData[11]++;
    var ghost, width;
    _$jscoverage['/navigation-view/bar.js'].lineData[13]++;
    ghost = elem.clone(true);
    _$jscoverage['/navigation-view/bar.js'].lineData[14]++;
    ghost[0].id = elem[0].id + '-proxy';
    _$jscoverage['/navigation-view/bar.js'].lineData[16]++;
    elem.parent().append(ghost);
    _$jscoverage['/navigation-view/bar.js'].lineData[18]++;
    var offset = elem.offset();
    _$jscoverage['/navigation-view/bar.js'].lineData[20]++;
    ghost.css('position', 'absolute');
    _$jscoverage['/navigation-view/bar.js'].lineData[21]++;
    ghost.offset(offset);
    _$jscoverage['/navigation-view/bar.js'].lineData[22]++;
    ghost.css({
  width: width = elem.css('width'), 
  height: elem.css('height')});
    _$jscoverage['/navigation-view/bar.js'].lineData[27]++;
    return ghost;
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[30]++;
  function anim(el, props, complete) {
    _$jscoverage['/navigation-view/bar.js'].functionData[2]++;
    _$jscoverage['/navigation-view/bar.js'].lineData[31]++;
    el.animate(props, {
  duration: 0.25, 
  useTransition: true, 
  easing: 'ease-in-out', 
  complete: complete});
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[39]++;
  function getAnimProps(self, backEl, backElProps, reverse) {
    _$jscoverage['/navigation-view/bar.js'].functionData[3]++;
    _$jscoverage['/navigation-view/bar.js'].lineData[40]++;
    var barElement = self.get('el'), titleElement = self.get('titleEl'), minOffset = Math.min(barElement[0].offsetWidth / 3, 200), newLeftWidth = backEl[0].offsetWidth, barWidth = barElement[0].offsetWidth, titleX = titleElement.offset().left - barElement.offset().left, titleWidth = titleElement[0].offsetWidth, oldBackWidth = backElProps.width, newOffset, oldOffset, backElAnims, titleAnims, omega, theta;
    _$jscoverage['/navigation-view/bar.js'].lineData[50]++;
    if (visit3_50_1(reverse)) {
      _$jscoverage['/navigation-view/bar.js'].lineData[51]++;
      newOffset = -oldBackWidth;
      _$jscoverage['/navigation-view/bar.js'].lineData[52]++;
      oldOffset = Math.min(titleX - oldBackWidth, minOffset);
    } else {
      _$jscoverage['/navigation-view/bar.js'].lineData[55]++;
      oldOffset = -oldBackWidth;
      _$jscoverage['/navigation-view/bar.js'].lineData[56]++;
      newOffset = Math.min(titleX, minOffset);
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[60]++;
    backElAnims = {
  element: {
  from: {
  transform: 'translateX(' + newOffset + 'px) translateZ(0)'}, 
  to: {
  transform: 'translateX(0) translateZ(0)', 
  opacity: 1}}, 
  ghost: {
  to: {
  transform: 'translateX(' + oldOffset + 'px) translateZ(0)', 
  opacity: 0}}};
    _$jscoverage['/navigation-view/bar.js'].lineData[78]++;
    theta = -titleX + newLeftWidth;
    _$jscoverage['/navigation-view/bar.js'].lineData[79]++;
    if (visit4_79_1(titleWidth > titleX)) {
      _$jscoverage['/navigation-view/bar.js'].lineData[80]++;
      omega = -titleX - titleWidth;
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[83]++;
    if (visit5_83_1(reverse)) {
      _$jscoverage['/navigation-view/bar.js'].lineData[84]++;
      oldOffset = barWidth - titleX - titleWidth;
      _$jscoverage['/navigation-view/bar.js'].lineData[86]++;
      if (visit6_86_1(omega !== undefined)) {
        _$jscoverage['/navigation-view/bar.js'].lineData[87]++;
        newOffset = omega;
      } else {
        _$jscoverage['/navigation-view/bar.js'].lineData[90]++;
        newOffset = theta;
      }
    } else {
      _$jscoverage['/navigation-view/bar.js'].lineData[93]++;
      newOffset = barWidth - titleX - titleWidth;
      _$jscoverage['/navigation-view/bar.js'].lineData[95]++;
      if (visit7_95_1(omega !== undefined)) {
        _$jscoverage['/navigation-view/bar.js'].lineData[96]++;
        oldOffset = omega;
      } else {
        _$jscoverage['/navigation-view/bar.js'].lineData[99]++;
        oldOffset = theta;
      }
      _$jscoverage['/navigation-view/bar.js'].lineData[102]++;
      newOffset = Math.max(0, newOffset);
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[104]++;
    titleAnims = {
  element: {
  from: {
  transform: 'translateX(' + newOffset + 'px) translateZ(0)'}, 
  to: {
  transform: 'translateX(0) translateZ(0)', 
  opacity: 1}}, 
  ghost: {
  to: {
  transform: 'translateX(' + oldOffset + 'px) translateZ(0)', 
  opacity: 0}}};
    _$jscoverage['/navigation-view/bar.js'].lineData[122]++;
    return {
  back: backElAnims, 
  title: titleAnims};
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[128]++;
  return Control.extend({
  renderUI: function() {
  _$jscoverage['/navigation-view/bar.js'].functionData[4]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[130]++;
  var prefixCls = this.get('prefixCls');
  _$jscoverage['/navigation-view/bar.js'].lineData[131]++;
  var backBtn;
  _$jscoverage['/navigation-view/bar.js'].lineData[132]++;
  this.set('backBtn', backBtn = new Button({
  prefixCls: prefixCls + 'navigation-bar-', 
  elCls: prefixCls + 'navigation-bar-back', 
  elBefore: this.get('contentEl')[0].firstChild, 
  visible: false, 
  content: this.get('backText')}).render());
  _$jscoverage['/navigation-view/bar.js'].lineData[139]++;
  this._buttons = {};
}, 
  addButton: function(name, config) {
  _$jscoverage['/navigation-view/bar.js'].functionData[5]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[143]++;
  var prefixCls = this.get('prefixCls');
  _$jscoverage['/navigation-view/bar.js'].lineData[144]++;
  config.prefixCls = prefixCls + 'navigation-bar-';
  _$jscoverage['/navigation-view/bar.js'].lineData[145]++;
  if (visit8_145_1(!config.elBefore && !config.render)) {
    _$jscoverage['/navigation-view/bar.js'].lineData[146]++;
    var align = config.align = visit9_146_1(config.align || 'left');
    _$jscoverage['/navigation-view/bar.js'].lineData[147]++;
    if (visit10_147_1(align === 'left')) {
      _$jscoverage['/navigation-view/bar.js'].lineData[148]++;
      config.elBefore = this.get('centerEl');
    } else {
      _$jscoverage['/navigation-view/bar.js'].lineData[149]++;
      if (visit11_149_1(align === 'right')) {
        _$jscoverage['/navigation-view/bar.js'].lineData[150]++;
        config.render = this.get('contentEl');
      }
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[152]++;
    delete config.align;
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[154]++;
  this._buttons[name] = new Button(config).render();
  _$jscoverage['/navigation-view/bar.js'].lineData[155]++;
  return this._buttons[name];
}, 
  insertButtonBefore: function(name, config, button) {
  _$jscoverage['/navigation-view/bar.js'].functionData[6]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[159]++;
  config.elBefore = button.get('el');
  _$jscoverage['/navigation-view/bar.js'].lineData[160]++;
  return this.addButton(name, config);
}, 
  removeButton: function(name) {
  _$jscoverage['/navigation-view/bar.js'].functionData[7]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[164]++;
  this._buttons[name].destroy();
  _$jscoverage['/navigation-view/bar.js'].lineData[165]++;
  delete this._buttons[name];
}, 
  getButton: function(name) {
  _$jscoverage['/navigation-view/bar.js'].functionData[8]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[169]++;
  return this._buttons[name];
}, 
  forward: function(title) {
  _$jscoverage['/navigation-view/bar.js'].functionData[9]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[173]++;
  this.go(title, true);
}, 
  go: function(title, hasPrevious, reverse) {
  _$jscoverage['/navigation-view/bar.js'].functionData[10]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[177]++;
  var self = this;
  _$jscoverage['/navigation-view/bar.js'].lineData[178]++;
  var backEl = this.get('backBtn').get('el');
  _$jscoverage['/navigation-view/bar.js'].lineData[179]++;
  backEl.stop(true);
  _$jscoverage['/navigation-view/bar.js'].lineData[180]++;
  if (visit12_180_1(self.ghostBackEl)) {
    _$jscoverage['/navigation-view/bar.js'].lineData[181]++;
    self.ghostBackEl.stop(true);
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[183]++;
  var backElProps = {
  width: backEl[0].offsetWidth};
  _$jscoverage['/navigation-view/bar.js'].lineData[186]++;
  var ghostBackEl = createGhost(backEl);
  _$jscoverage['/navigation-view/bar.js'].lineData[187]++;
  self.ghostBackEl = ghostBackEl;
  _$jscoverage['/navigation-view/bar.js'].lineData[188]++;
  backEl.css('opacity', 0);
  _$jscoverage['/navigation-view/bar.js'].lineData[189]++;
  backEl[hasPrevious ? 'show' : 'hide']();
  _$jscoverage['/navigation-view/bar.js'].lineData[190]++;
  var titleEl = this.get('titleEl');
  _$jscoverage['/navigation-view/bar.js'].lineData[191]++;
  titleEl.stop(true);
  _$jscoverage['/navigation-view/bar.js'].lineData[192]++;
  if (visit13_192_1(self.ghostBackEl)) {
    _$jscoverage['/navigation-view/bar.js'].lineData[193]++;
    self.ghostBackEl.stop(true);
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[195]++;
  var ghostTitleEl = createGhost(titleEl.parent());
  _$jscoverage['/navigation-view/bar.js'].lineData[196]++;
  self.ghostTitleEl = ghostTitleEl;
  _$jscoverage['/navigation-view/bar.js'].lineData[197]++;
  titleEl.css('opacity', 0);
  _$jscoverage['/navigation-view/bar.js'].lineData[198]++;
  this.set('title', title);
  _$jscoverage['/navigation-view/bar.js'].lineData[199]++;
  var anims = getAnimProps(self, backEl, backElProps, reverse);
  _$jscoverage['/navigation-view/bar.js'].lineData[200]++;
  backEl.css(anims.back.element.from);
  _$jscoverage['/navigation-view/bar.js'].lineData[201]++;
  if (visit14_201_1(backEl.css('display') !== 'none')) {
    _$jscoverage['/navigation-view/bar.js'].lineData[202]++;
    anim(backEl, anims.back.element.to);
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[204]++;
  titleEl.css(anims.title.element.from);
  _$jscoverage['/navigation-view/bar.js'].lineData[205]++;
  anim(titleEl, anims.title.element.to);
  _$jscoverage['/navigation-view/bar.js'].lineData[207]++;
  if (visit15_207_1(ghostBackEl.css('display') !== 'none')) {
    _$jscoverage['/navigation-view/bar.js'].lineData[208]++;
    anim(ghostBackEl, anims.back.ghost.to, function() {
  _$jscoverage['/navigation-view/bar.js'].functionData[11]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[209]++;
  ghostBackEl.remove();
  _$jscoverage['/navigation-view/bar.js'].lineData[210]++;
  self.ghostBackEl = null;
});
  } else {
    _$jscoverage['/navigation-view/bar.js'].lineData[213]++;
    ghostBackEl.remove();
    _$jscoverage['/navigation-view/bar.js'].lineData[214]++;
    self.ghostBackEl = null;
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[216]++;
  anim(ghostTitleEl, anims.title.ghost.to, function() {
  _$jscoverage['/navigation-view/bar.js'].functionData[12]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[217]++;
  ghostTitleEl.remove();
  _$jscoverage['/navigation-view/bar.js'].lineData[218]++;
  self.ghostTitleEl = null;
});
}, 
  back: function(title, hasPrevious) {
  _$jscoverage['/navigation-view/bar.js'].functionData[13]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[223]++;
  this.go(title, hasPrevious, true);
}}, {
  xclass: 'navigation-bar', 
  ATTRS: {
  handleMouseEvents: {
  value: false}, 
  focusable: {
  value: false}, 
  xrender: {
  value: BarRender}, 
  centerEl: {}, 
  contentEl: {}, 
  titleEl: {}, 
  title: {
  value: '', 
  view: 1}, 
  backText: {
  value: 'Back', 
  view: 1}}});
});
