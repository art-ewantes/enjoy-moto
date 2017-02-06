var gulp = require("gulp"),
	sass = require("gulp-sass"),
	gutil = require( 'gulp-util' ),  
	ftp = require( 'vinyl-ftp' ),
	browserSync = require("browser-sync"),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglifyjs"),
	cssnano = require("gulp-cssnano"),
	rename = require("gulp-rename"),
	del = require("del")
	imagemin = require("gulp-imagemin"),
	pngquant = require("imagemin-pngquant"),
	cache = require("gulp-cache"),
	autoprefixer = require("gulp-autoprefixer");

gulp.task("sass", function(){
	return gulp.src("app/sass/**/*.sass")
		.pipe(sass())
		.pipe(autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {cascade: true}))
		.pipe(gulp.dest("app/css"))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task("scripts", function(){
	return gulp.src([
		"app/libs/jquery/dist/jquery.min.js",
		"app/libs/html5shiv/dist/html5shiv.min.js",
		"app/libs/respond/dest/respond.min.js",
		"app/libs/scroll2id/PageScroll2id.min.js",
		"app/libs/bootstrap/dist/js/bootstrap.min.js",
		"app/libs/owl.carousel/dist/owl.carousel.min.js",
		])
	.pipe(concat("libs.min.js"))
	.pipe(uglify())
	.pipe(gulp.dest("app/js"));
});

gulp.task("css-libs", ["sass"], function(){
	return gulp.src("app/css/libs.css")
	.pipe(cssnano())
	.pipe(rename({suffix: ".min"}))
	.pipe(gulp.dest("app/css"));
});

gulp.task("css-main", ["sass"], function(){
	return gulp.src("app/css/main.css")
	.pipe(cssnano())
	.pipe(rename({suffix: ".min"}))
	.pipe(gulp.dest("app/css"));
});

gulp.task("browser-sync", function(){
	browserSync({
		server: {
			baseDir: "app"
		},
		notify: false
	});
});

gulp.task("clean", function(){
	return del.sync("dist");
});

gulp.task("clear", function(){
	return cache.clearAll();
});

gulp.task("img", function(){
	return gulp.src("app/img/**/*")
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		une: [pngquant()]
	})))
	.pipe(gulp.dest("dist/img"));
});

gulp.task("watch", ["browser-sync", "css-libs", "scripts", "css-main"], function(){
	gulp.watch("app/sass/**/*.sass", ["sass"]);
	gulp.watch("app/*.html", browserSync.reload);
	gulp.watch("app/js/**/*.js", browserSync.reload);
});

gulp.task("build", ["clean", "img", "sass", "scripts"], function(){

	var buildCss = gulp.src([
		"app/css/main.min.css",
		"app/css/libs.min.css",
	])
	.pipe(gulp.dest("dist/css"));

	var buildFonts = gulp.src("app/fonts/**/*")
	.pipe(gulp.dest("dist/fonts"));

	var buildJs = gulp.src("app/js/**/*")
	.pipe(gulp.dest("dist/js"));

	var buildHtml = gulp.src("app/*.html")
	.pipe(gulp.dest("dist"));



});

/** Configuration ftp**/
var user = 'dimaproz@web-rawwwr.com';  
var password = 'getthere1995';  
var host = 'ftp.web-rawwwr.com';  
var port = 21;  
var localFilesGlob = [
	'dist/**',
];  
// var remoteFolder = 'public_html/make-village.web-rawwwr.com'
var remoteFolder = 'make-village.web-rawwwr.com/wp-content/themes/make_village'


// helper function to build an FTP connection based on our configuration
function getFtpConnection() {  
    return ftp.create({
        host: host,
        port: port,
        user: user,
        password: password,
        parallel: 5,
        log: gutil.log
    });
}

/**
 * Deploy task.
 * Copies the new files to the server
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy`
 */
gulp.task('deploy', function() {

    var conn = getFtpConnection();

    return gulp.src(localFilesGlob, { base: './dist/', buffer: false })
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files 
        .pipe( conn.dest( remoteFolder ) )
    ;
});

/**
 * Watch deploy task.
 * Watches the local copy for changes and copies the new files to the server whenever an update is detected
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy-watch`
 */
gulp.task('ftp-deploy-watch', function() {

    var conn = getFtpConnection();

    gulp.watch(localFilesGlob)
    .on('change', function(event) {
      console.log('Changes detected! Uploading file "' + event.path + '", ' + event.type);

      return gulp.src( [event.path], { base: '.', buffer: false } )
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files 
        .pipe( conn.dest( remoteFolder ) )
      ;
    });
});