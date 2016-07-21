var gulp = require("gulp");
var gutil = require("gulp-util");
var iconfont = require("gulp-iconfont");
var iconfontCss = require("gulp-iconfont-css");
var modifyCssUrls = require("gulp-modify-css-urls");
var runTimestamp = Math.round(Date.now() / 1000);


function string_src(filename, string) {
    var src = require("stream").Readable({ objectMode: true });
    src._read = function () {
        this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }));
        this.push(null);
    }
    return src;
}


var umbIcons = {
    "fontName": "skttl",
    "pathToSvgs": "./BackofficeIcons/",
    "umbracoPath": "../Umbraco.Web/",
    "iconPath": "App_Plugins/BackofficeIcons/",
    "cssFileName": "icons-ecreo.css"
}

gulp.task("generateIconFont",
    function() {
        return gulp.src(umbIcons.pathToSvgs + "*.svg")
            .pipe(iconfontCss({
                fontName: umbIcons.fontName,
                path: umbIcons.pathToSvgs + "template.css",
                targetPath: umbIcons.cssFileName,
                fontPath: "/" + umbIcons.iconPath,
                cssClass: "icon-" + umbIcons.fontName
            }))
            .pipe(iconfont({
                fontName: umbIcons.fontName,
                prependUnicode: true,
                timestamp: runTimestamp,
                normalize: true
            }))
            .pipe(gulp.dest(umbIcons.umbracoPath + umbIcons.iconPath));
    }
);

gulp.task("cachebustFontUrls",
    ["generateIconFont"],
    function() {
        return gulp.src(umbIcons.umbracoPath + umbIcons.iconPath + umbIcons.cssFileName)
            .pipe(modifyCssUrls({
                append: "?v=" + runTimestamp
            }))
            .pipe(gulp.dest(umbIcons.umbracoPath + umbIcons.iconPath));
    }
);

gulp.task("generatePackageManifest",
    ["cachebustFontUrls"],
    function () {
        return string_src("package.manifest",
                JSON.stringify({ "css": ["~/" + umbIcons.iconPath + umbIcons.cssFileName + "?v=" + runTimestamp] }))
            .pipe(gulp.dest(umbIcons.umbracoPath + umbIcons.iconPath));
    }
);

gulp.task("generateBackofficeIcons",
    ["generatePackageManifest"]
);
