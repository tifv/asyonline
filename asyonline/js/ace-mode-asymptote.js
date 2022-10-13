// TODO add license here. sorry :(
//      this file is based on other modes of ace editor, obviously
//      identifier lists are taken from Asymptote sources, also obviously
// TODO look at javascript highlight rules and make use of stack to
//      (a) highlight types only at appropriate places
//      (b) not hightlight keyword arguments to functions
//          (or do it consistently)
// TODO highlight LaTeX strings (at least show errors when math is not
//      complete, and maybe track groups)
// XXX  fix "-" in "x-0.5"


define("ace/mode/asymptote_highlight_rules", [], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules =
    require("./text_highlight_rules").TextHighlightRules;

var asymptoteHighlightRules = function() {

    var keywordMapper = this.$keywords = this.createKeywordMapper({
        "keyword.control" :
            "if|else|while|for|do|return|break|continue",
        "keyword.import" :
            "access|from|unravel|import|include",
        "keyword.path" :
            "cycle|controls|and|tension|atleast|curl",
        "keyword.other" :
            "new|operator",
        "storage.type" :
            "struct|typedef|" +
            "var|void|bool|int|real|string|" +
            "pair|triple|transform|guide|path|pen|frame|picture|" +
            "file",
        "storage.modifier" :
            "static|public|restricted|private|explicit",
        "variable.language" :
            "this",
        "constant.language" :
            "true|false|null",
        "support.type.language" :
            "Label|Legend|ScaleT|align|arrowhead|autoscaleT|bool3|" +
            "bounds|coord|coords2|coords3|cputime|filltype|" +
            "hsv|light|marginT|marker|node|object|" +
            "pairOrTriple|path3|position|processtime|" +
            "projection|scaleT|scaling|side|simplex|slice|" +
            "transformation",
        "support.function.language" :
            "AND|ArcArrow|ArcArrows|Arrow|Arrows|AtA|AvantGarde|Bar|Bars|" +
            "BeginArcArrow|BeginArrow|BeginBar|BeginDotMargin|BeginMargin|" +
            "BeginPenMargin|Blank|Bookman|CLZ|CTZ|Ceil|Cos|Courier|" +
            "DOSendl|DOSnewl|Degrees|DotMargin|DotMargins|Dotted|Draw|" +
            "Embed|EndArcArrow|EndArrow|EndBar|EndDotMargin|EndMargin|" +
            "EndPenMargin|Fill|FillDraw|Floor|Helvetica|HookHead|Jn|" +
            "Landscape|Margin|Margins|Mark|MidArcArrow|MidArrow|" +
            "NOT|NewCenturySchoolBook|NoMargin|None|OR|Palatino|Pen|" +
            "PenMargin|PenMargins|Pentype|Portrait|RGB|RadialShade|" +
            "RadialShadeDraw|Relative|Rotate|Round|Scale|Seascape|Shift|" +
            "Sin|Slant|Symbol|Tan|TeXify|TimesRoman|TrueMargin|UnFill|" +
            "UpsideDown|XOR|Yn|ZapfChancery|ZapfDingbats|aCos|aSin|aTan|" +
            "abort|abs|accel|acos|acosh|activatequote|add|addArrow|" +
            "addSaveFunction|adjust|alias|all|angle|animate|arc|" +
            "arcarrowsize|arcdir|arclength|arcpoint|arctime|array|arrow|" +
            "arrow2|arrowbase|arrowbasepoints|arrowsize|ascii|asin|asinh|" +
            "ask|assert|asy|asydir|atan|atan2|atanh|atbreakpoint|atexit|" +
            "attach|atupdate|axialshade|azimuth|bar|barsize|basealign|" +
            "baseline|bbox|beep|begin|beginclip|begingroup|beginpoint|" +
            "bezier|bezierP|bezierPP|bezierPPP|bitreverse|blend|box|brace|" +
            "breakpoint|breakpoints|buildRestoreDefaults|" +
            "buildRestoreThunk|buildcycle|byte|calculateScaling|cast|cbrt|" +
            "cd|ceil|change2|choose|circle|clear|clip|close|cmyk|" +
            "colatitude|colorless|colors|colorspace|comma|complement|" +
            "concat|conj|controlSpecifier|controls|convert|copy|" +
            "copyPairOrTriple|cos|cosh|cross|cubicroots|curl|" +
            "curlSpecifier|cut|cyclic|deactivatequote|debugger|" +
            "deconstruct|defaultformat|defaultpen|degrees|delete|" +
            "deletepreamble|determinant|diagonal|dir|dirSpecifier|dirtime|" +
            "dot|dotframe|dotsize|downcase|draw|drawPRCcylinder|" +
            "drawPRCdisk|drawPRCsphere|drawPRCtube|drawarrow|drawarrow2|" +
            "drawbeziertriangle|drawpixel|drawstrokepath|ecast|ellipse|" +
            "embed3|empty|enclose|end|endclip|endgroup|endgroup3|endl|" +
            "endpoint|eof|eol|erase|erf|erfc|error|eval|exit|exitfunction|" +
            "exp|expi|expm1|extension|fabs|factorial|fft|fill|" +
            "filldraw|filloutside|fillrule|find|findall|finite|" +
            "firstcut|fit|fit2|fixedscaling|floor|flush|fmod|font|" +
            "fontcommand|fontsize|format|functionshade|gamma|" +
            "generate_random_backtrace|getc|getint|getpair|getreal|" +
            "getstring|gettriple|gouraudshade|graphic|graphicscale|gray|" +
            "grestore|gsave|hex|history|hypot|identity|incircle|init|" +
            "initdefaults|initialized|input|insert|inside|insphere|" +
            "interactive|interior|interp|intersect|intersectionpoint|" +
            "intersectionpoints|intersections|inverse|invisible|is3D|" +
            "isnan|italic|jobname|label|labelmargin|labels|lastcut|latex|" +
            "latitude|latticeshade|layer|ldexp|legend|legenditem|length|" +
            "linecap|linejoin|lineskip|linetype|linewidth|list|" +
            "locale|locatefile|location|log|log10|log1p|longitude|" +
            "makedraw|makepen|map|margin|marknodes|markthin|" +
            "markuniform|math|max|max3|maxAfterTransform|maxbezier|" +
            "maxbound|maxcoords|maxratio|maxtimes|mean|midpoint|min|min3|" +
            "minAfterTransform|minbezier|minbound|minipage|minratio|" +
            "mintimes|miterlimit|mktemp|nativeformat|newl|newpage|newton|" +
            "nib|none|norm|nosetpagesize|nowarn|nurb|offset|" +
            "opacity|orient|orientation|outformat|outname|outprefix|" +
            "output|overloadedMessage|overwrite|pack|pairs|pattern|" +
            "pause|pdf|perp|phantom|piecewisestraight|point|polar|polygon|" +
            "popcount|postcontrol|postscript|pow10|prc|prc0|prconly|" +
            "precision|precontrol|prepend|printBytecode|" +
            "print_random_addresses|progress|project|purge|" +
            "quadraticroots|quotient|radialshade|radians|radius|rand|" +
            "randompath|readline|realmult|rectify|reflect|relative|" +
            "relativedistance|reldir|relpoint|reltime|remainder|rename|" +
            "replace|resetdefaultpen|restore|restoredefaults|reverse|" +
            "rfind|rgb|rgba|rotate|rotation|round|roundbox|save|" +
            "savedefaults|saveline|scale|scale3|scaleless|search|" +
            "seconds|seek|seekeof|sequence|sgn|shift|shiftless|shipout|" +
            "shipout3|simpson|sin|sinh|size|size3|slant|sleep|" +
            "solve|sort|sourceline|spec|split|sqrt|srand|stop|straight|" +
            "straightness|stripdirectory|stripextension|stripfile|" +
            "stripsuffix|strokepath|subpath|substr|sum|system|tab|tan|" +
            "tanh|tell|tension|tensionSpecifier|tensorshade|tex|texify|" +
            "texpath|texpreamble|texreset|texsize|textpath|thick|thin|" +
            "time|times|toplocation|transpose|" +
            "triangulate|tridiagonal|trim|truepoint|tuple|unfill|uniform|" +
            "unit|unitrand|unitsize|unstraighten|upcase|updatefunction|" +
            "uptodate|usepackage|usersetting|usetypescript|usleep|" +
            "verbatim|view|warn|warning|windingnumber|write|xasyKEY|" +
            "xmap|xpart|xscale|ypart|yscale|zpart",
        "support.constant.language" :
            // XXX sort through this and move some more to variable
            "N|S|E|W|NE|NW|SE|SW|NNE|NNW|SSE|SSW|ENE|ESE|WNW|WSW|" +
            "Align|Allow|Aspect|BeginPoint|Black|Center|Cyan|" +
            "DefaultHead|Dotted|Draw|EndPoint|Fill|FillDraw|" +
            "HookHead|I|IgnoreAspect|JOIN_IN|JOIN_OUT|LeftSide|" +
            "Magenta|Mark|MarkFill|MarkPath|MidPoint|Move|MoveQuiet|" +
            "NoAlign|NoFill|NoSide|RightSide|" +
            "SimpleHead|Suppress|SuppressQuiet|TeXHead|UnFill|VERSION|" +
            "Yellow|arcarrowangle|arrow2sizelimit|" +
            "arrowangle|arrowbarb|arrowdir|arrowlength|arrowsizelimit|" +
            "basealign|beveljoin|black|blue|bp|bracedefaultratio|" +
            "braceinnerangle|bracemidangle|braceouterangle|brown|chartreuse|" +
            "circleprecision|circlescale|cm|colorPen|count|cputimeformat|" +
            "cyan|darkblue|darkbrown|darkcyan|darkgray|" +
            "darkgreen|darkgrey|darkmagenta|darkolive|darkred|dashdotted|" +
            "dashed|debuggerlines|debugging|deepblue|deepcyan|deepgray|" +
            "deepgreen|deepgrey|deepmagenta|deepred|deepyellow|default|" +
            "defaultfilename|defaultformat|defaultpen|defaultseparator|" +
            "dotframe|dotted|down|evenodd|" +
            "extendcap|file3|fuchsia|green|grey|heavyblue|heavycyan|" +
            "heavygray|heavygreen|heavygrey|heavymagenta|heavyred|" +
            "identity|identity4|ignore|implicitshipout|inch|inches|inf|" +
            "infinity|intMax|intMin|invert|invisible|labelmargin|left|" +
            "lightblue|lightcyan|" +
            "lightgray|lightgreen|lightgrey|lightmagenta|lightolive|" +
            "lightred|lightyellow|longdashdotted|longdashed|magenta|" +
            "mantissaBits|mediumblue|mediumcyan|mediumgray|mediumgreen|" +
            "mediumgrey|mediummagenta|mediumred|mediumyellow|miterjoin|mm|" +
            "monoPen|nan|nobasealign|nomarker|nullpath|nullpen|ocgindex|" +
            "olive|orange|paleblue|palecyan|palegray|palegreen|palegrey|" +
            "palemagenta|palered|paleyellow|pi|pink|plain|plain_bounds|" +
            "plain_scaling|plus|pt|purple|randMax|realDigits|realEpsilon|" +
            "realMax|realMin|red|right|roundcap|roundjoin|royalblue|" +
            "salmon|settings|solid|spinner|springgreen|" +
            "sqrtEpsilon|squarecap|squarepen|stdin|stdout|undefined|" +
            "unitcircle|unitsquare|up|version|viewportmargin|viewportsize|" +
            "white|yellow|zeroTransform|zerowinding",
        "support.variable.language" :
            "currentlight|currentpatterns|currentpen|currentpicture|" +
            "currentprojection|" +
            "legendhskip|legendlinelength|legendmargin|" +
            "legendmaxrelativewidth|legendvskip|" +
            "arcarrowfactor|arrowfactor|arrowhookfactor|arrowtexfactor|" +
            "barfactor|camerafactor|dotfactor|expansionfactor",
        "support.function.marker" :
            "StickIntervalMarker|TildeIntervalMarker|CrossIntervalMarker|" +
            "CircleBarIntervalMarker|stickframe|stickmarkspace|tildeframe|" +
            "crossframe|circlebarframe|stickmarksize|tildemarksize|" +
            "crossmarksize|circlemarkradius|barmarksize|duplicate|" +
            "markangle|markinterval",
        "support.variable.marker" :
            "stickmarksizefactor|stickmarkspacefactor|tildemarksizefactor|" +
            "crossmarksizefactor|circlemarkradiusfactor|barmarksizefactor|" +
            "markangleradius|markangleradiusfactor|markanglespace|" +
            "markanglespacefactor",
        "support.type.geometry" :
            "coordsys|point|vector|mass|line|segment|" +
            "conic|circle|ellipse|parabola|hyperbola|bqe|arc|" +
            "abscissa|inversion|polarconicroutine|" +
            "triangle|side|vertex|trilinear",
        "support.function.geometry" :
            // XXX sort through this to maybe detect private or duplicate
            "Ox|Oy|addMargins|addpenarc|" +
            "addpenline|altitude|angabscissa|angpoint|" +
            "anticomplementary|antipedal|approximate|arccircle|" +
            "arcfromcenter|arcfromfocus|arclength|arcnodesnumber|" +
            "arcsubtended|arcsubtendedcenter|arctopath|attract|bangles|" +
            "between|binomial|bisector|bisectorpoint|canonical|" +
            "canonicalcartesiansystem|cartesiansystem|centerToFocus|" +
            "centroid|cevian|changecoordsys|circlenodesnumber|" +
            "circumcenter|circumcircle|clipdraw|collinear|compassmark|" +
            "complementary|concurrent|conicnodesnumber|conictype|" +
            "coordinates|curabscissa|curpoint|" +
            "currentpolarconicroutine|defined|degenerate|degrees|dir|" +
            "distance|drawline|elle|ellipsenodesnumber|" +
            "equation|excenter|excircle|exradius|extend|extouch|fermat|" +
            "finite|focusToCenter|foot|fromCenter|fromFocus|gergonne|" +
            "hline|hprojection|hyperbolanodesnumber|incenter|" +
            "incentral|incircle|inradius|inside|intersect|" +
            "intersectionpoint|intersectionpoints|intouch|inverse|" +
            "isogonal|isogonalconjugate|isotomic|" +
            "isotomicconjugate|isparabola|lineinversion|" +
            "linemargin|locate|markangle|markarc|markrightangle|" +
            "masscenter|massformat|medial|median|midpoint|nodabscissa|" +
            "onpath|opposite|origin|orthic|orthocentercenter|" +
            "parabolanodesnumber|parallel|pedal|perpendicular|" +
            "perpendicularmark|ppoint|" +
            "radicalcenter|radicalline|rd|realquarticroots|" +
            "relabscissa|relpoint|rf|rotate|rotateO|samecoordsys|" +
            "sameside|scaleO|sector|sgnd|sharpangle|" +
            "sharpdegrees|show|simeq|square|standardizecoordsys|symmedial|" +
            "symmedian|tangent|tangential|tangents|triangleAbc|" +
            "triangleabc|tricoef|vline|vprojection|" +
            "xscale|xscaleO|yscale|yscaleO",
        "support.constant.geometry" :
            "defaultcoordsys|" +
            "byfoci|byvertices|" +
            "relativesystem|curvilinearsystem|angularsystem|nodesystem|" +
            "fromCenter|fromFocus",
        "support.variable.geometry" :
            "currentcoordsys|" +
            "conicnodesfactor|" +
            "ellipsenodesnumberfactor|circlenodesnumberfactor|" +
            "hyperbolanodesnumberfactor|parabolanodesnumberfactor|" +
            "epsgeo|linemargin|perpfactor|defaultmassformat",
        /* old version
        "support.function.geometry" :
            "Ox|Oy|addMargins|altitude|angabscissa|angpoint|" +
            "anticomplementary|antipedal|arccircle|arcfromcenter|" +
            "arcfromfocus|arclength|arcnodesnumber|arcsubtended|" +
            "arcsubtendedcenter|attract|bangles|between|binomial|bisector|" +
            "bisectorpoint|canonical|canonicalcartesiansystem|" +
            "cartesiansystem|centerToFocus|centroid|cevian|changecoordsys|" +
            "circlenodesnumber|circumcenter|circumcircle|clipdraw|" +
            "collinear|compassmark|complementary|concurrent|" +
            "conicnodesnumber|conictype|coordinates|curabscissa|curpoint|" +
            "defined|distance|drawline|elle|ellipsenodesnumber|equation|" +
            "excenter|excircle|exradius|extend|extouch|fermat|finite|" +
            "focusToCenter|foot|gergonne|hline|hprojection|" +
            "hyperbolanodesnumber|incenter|incircle|inradius|inside|" +
            "intersect|intouch|inverse|isogonal|isogonalconjugate|" +
            "isotomic|isotomicconjugate|isparabola|length|locate|" +
            "markangle|markarc|markrightangle|masscenter|massformat|" +
            "medial|median|midpoint|nodabscissa|onpath|opposite|origin|" +
            "orthic|orthocentercenter|parabolanodesnumber|parallel|pedal|" +
            "perpendicular|perpendicularmark|radicalcenter|" +
            "radicalline|rd|bangles|realquarticroots|reflect|relabscissa|" +
            "relpoint|rf|rotateO|samecoordsys|sameside|scaleO|sector|sgnd|" +
            "sharpangle|sharpdegrees|show|simeq|standardizecoordsys|" +
            "symmedial|symmedian|tangent|tangential|tangents|triangleAbc|" +
            "triangleabc|tricoef|vline|vprojection|xscaleO|yscaleO",
        */
    }, "identifier");

    this.$rules = {
        "start" : [
            {
                stateName : "comment1", // single line comment
                token : "comment",
                regex : "\\/\\/",
                next : [
                    {
                        token : "comment",
                        regex : /$/,
                        next : "start"
                    }, {
                        defaultToken: "comment"
                    }
                ]
            }, {
                stateName : "comment", // multi line comment
                token : "comment",
                regex : "\\/\\*",
                next : [
                    {
                        token : "comment",
                        regex : "\\*\\/",
                        next : "start"
                    }, {
                        defaultToken : "comment"
                    }
                ]
            }, {
                stateName : "qstring", // single-quote string
                token : "string.start",
                regex : "'",
                next : [
                    {
                        token : "constant.character.escape",
                        regex : "\\\\(?:" +
                            "['\"?\\\\abfnrtv]|" +
                            "[0-3][0-7][0-7]|[0-7][0-7]|[0-7]|" +
                            "x[0-9A-F][0-9A-F]|x[0-9A-F])"
                    }, {
                        token : "string.end",
                        regex : "'",
                        next : "start"
                    }, {
                        defaultToken: "string"
                    }
                ]
            }, {
                stateName : "qqstring", // double-quote string
                token : "string.start",
                regex : '"',
                next : [
                    {
                        token : "constant.character.escape",
                        regex : '\\\\"'
                    }, {
                        token : "string.end",
                        regex : '"',
                        next : "start"
                    }, {
                        defaultToken: "string"
                    }
                ]
            }, {
                token : "constant.numeric", // int / float
                regex : "(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?"
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_][a-zA-Z0-9_]*"
            }, {
                token : "keyword.operator",
                regex : "==|!=|<>|<[<=]?|>[>=]?|" +
                    "&&?|\\|\\|?|\\^\\^|\\.\\.(?!\\.\\d)|::|\\$\\$?|@@?|!|---|" +
                    "--|\\+\\+|[+\\-/#%\\^]=?|" +
                    "\\*\\*(?!=)|\\*=|=|\\*(?!\\*)"
            }, {
                token : "paren.lparen",
                regex : "[[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ]
    };

    this.normalizeRules();
};

oop.inherits(asymptoteHighlightRules, TextHighlightRules);

exports.asymptoteHighlightRules = asymptoteHighlightRules;
});

ace.define("ace/mode/asymptote", [], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var asymptoteHighlightRules = require("./asymptote_highlight_rules").asymptoteHighlightRules;

var Mode = function() {
    this.HighlightRules = asymptoteHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};
    this.$id = "ace/mode/asymptote";
}).call(Mode.prototype);

exports.Mode = Mode;
});

// vim: set filetype=javascript foldmethod=marker :
