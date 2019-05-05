let gulp = require("gulp");
let browserify = require("browserify");
let source = require("vinyl-source-stream");
let tsify = require("tsify");
let uglify = require("gulp-uglify");
let sourcemaps = require("gulp-sourcemaps");
let buffer = require("vinyl-buffer");
let gutil = require("gulp-util");
let connect = require("gulp-connect");
let concat = require('gulp-concat');
let del = require('del')
let preprocess = require('gulp-preprocess');
let inliner = require('gulp-inline');
let rm = require('gulp-rename');

const b64inliner = require("./gulp-inliner/b64inline");

let paths = {
    entries: ["src/index.ts"],
    vendors:[
        "./pixiv5/pixi.min.js",
        "./templates/release/index.html"
    ],
    vendors_dev:[
        "./pixiv5/pixi.js",
        "./pixiv5/pixi.js.map",
        "./pixiv5/pixi-tiled.js",
        "./pixiv5/pixi-spine.js",
        "./pixiv5/pixi-tiled.js.map",
    ],
    concats: [
        "./pixiv5/pixi-tiled.js",
        "./pixiv5/pixi-spine.js"
    ],
    res : "./res/**/*"
};

const brows_pipe = browserify({
	basedir: ".",
	debug: true,
	entries: paths.entries,
	cache: {},
	packageCache: {}
}).plugin(tsify);


gulp.task('clear-release', ()=>{
    return del(['dist']);
});

gulp.task('res-release', ()=>{
    return gulp
            .src([paths.res])
            .pipe(gulp.dest("dist/res"));
});

gulp.task('bundle-release', ()=> {
    return brows_pipe
            .bundle()
            .pipe(source("bundle.js"))
            .pipe(buffer())
            //@ts-ignore
            .pipe(preprocess({
                context:{
                    RES_PATH : "./res"
                }}
            ))
			.pipe(gulp.dest("dist"));
});

gulp.task('bundle-release-nl', ()=> {
    return brows_pipe
            .bundle()
            .pipe(source("bundle.js"))
            .pipe(buffer())
            //@ts-ignore
            .pipe(preprocess({
                context:{
                    RES_PATH : "./res",
                    DEBUG : true
                }}
            ))
			.pipe(gulp.dest("dist"));
});

gulp.task('pack-release', ()=>{
    gulp.src(paths.vendors).pipe(gulp.dest('dist'));
    return gulp.src(["./dist/bundle.js", ...paths.concats])
            .pipe(concat("bundle.js"))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest("dist"));
});

function debug(){

    //copyIfExist(paths.vendors_dev, 'dist-dev');
    gulp.src(paths.vendors_dev).pipe(gulp.dest('dist-dev'));
	 
    return brows_pipe
        .on('error', gutil.log)
        .bundle()
        .on('error', gutil.log)
        .pipe(source("bundle-dev.js"))
        .pipe(buffer())
        //@ts-ignore
        .pipe(preprocess({context:{RES_PATH : '', DEBUG : true}}))
        .on('error', gutil.log)
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest("dist-dev"));
}

const watch_tsc = () => {
    
    connect.server({
        port:8080,
        livereload:true,
        name:"Dev app",
        root: "./",
        
    });

    gutil.log("==Watch==");

    gulp.watch("./dist-dev/index.html", {delay: 2000}, function updateHtml(){
        return gulp.src('./dist-dev/index.html')
                .pipe(connect.reload());
    });

	gulp.watch("./src/**/*.ts", {delay: 2000}, function compile(){
        return debug()
                .on('error', gutil.log)
                .pipe(connect.reload())
    });

};

const tob64 = ()=> {
    return gulp
            .src(paths.res)
            //@ts-ignore
            .pipe(b64inliner({filename: "resources.ts", map_options:{es6: true, base:"base85"}}))
            .pipe(gulp.dest("./src/inline"));
}

const inline = ()=> {
    return gulp
            .src(["./dist/index.html"])
            //@ts-ignore
            .pipe(inliner({base:"dist/"}))
            .pipe(rm("index.inline.html"))
            .pipe(gulp.dest("./dist"))
}

gulp.task("tob64", tob64)
gulp.task("default", watch_tsc);
gulp.task("watch", watch_tsc);
gulp.task("debug", debug);
gulp.task("inline", inline);
gulp.task("release", gulp.series("tob64", 'clear-release', 'bundle-release', 'pack-release', "inline"));
