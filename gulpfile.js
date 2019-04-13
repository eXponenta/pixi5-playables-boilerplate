let gulp = require("gulp");
let browserify = require("browserify");
let source = require("vinyl-source-stream");
let tsify = require("tsify");
let babelify = require("babelify");
let uglify = require('gulp-uglify-es').default;
let sourcemaps = require("gulp-sourcemaps");
let buffer = require("vinyl-buffer");
let gutil = require("gulp-util");
let connect = require("gulp-connect");
let concat = require("gulp-concat");
let del = require("del");
let preprocess = require("gulp-preprocess");

const b64inliner = require("./b64inline");

let paths = {
	entries: ["src/index.ts"],
	vendors: ["./templates/release/index.html"],
	vendors_dev: [],
	concats: [],
	res: "./res/**/*"
};

const brows_pipe = browserify({
	basedir: ".",
	debug: true,
	entries: paths.entries,
	cache: {},
	packageCache: {}
})
	.plugin(tsify, { target: "es6" })
	.transform(babelify, {
		extensions: [".tsx", ".ts"],
		presets: [
			["@babel/preset-env",
			{
				exclude: ["babel-plugin-transform-async-to-generator", "babel-plugin-transform-regenerator"]
			}]
		]
	});

gulp.task("clear-release", () => {
	return del(["dist"]);
});

gulp.task("res-release", () => {
	return gulp.src([paths.res]).pipe(gulp.dest("dist/res"));
});

gulp.task("bundle-release", () => {
	return (
		brows_pipe
			.bundle()
			.pipe(source("bundle.js"))
			.pipe(buffer())
			//@ts-ignore
			.pipe(
				preprocess({
					context: {
						RES_PATH: "./res"
					}
				})
			)
			.pipe(gulp.dest("dist"))
	);
});

gulp.task("bundle-release-fake", () => {
	return (
		brows_pipe
			.bundle()
			.pipe(source("bundle.js"))
			.pipe(buffer())
			//@ts-ignore
			.pipe(
				preprocess({
					context: {
						RES_PATH: "./res",
						FAKEAPI: true
					}
				})
			)
			.pipe(gulp.dest("dist"))
	);
});

gulp.task("pack-release", () => {
	gulp.src(paths.vendors).pipe(gulp.dest("dist"));
	return gulp
		.src(["./dist/bundle.js", ...paths.concats])
		.pipe(concat("bundle.js"))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest("dist"));
});

function debug() {
	//copyIfExist(paths.vendors_dev, 'dist-dev');
	if (paths.vendors_dev && paths.vendors_dev.length > 0) gulp.src(paths.vendors_dev).pipe(gulp.dest("dist-dev"));

	return (
		brows_pipe

			.on("error", gutil.log)
			.bundle()
			.on("error", gutil.log)
			.pipe(source("bundle-dev.js"))
			.pipe(buffer())
			//@ts-ignore
			.pipe(preprocess({ context: { RES_PATH: "", FAKEAPI: true } }))
			.on("error", gutil.log)
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(sourcemaps.write("./"))
			.pipe(gulp.dest("dist-dev"))
	);
}

const watch_tsc = () => {
	connect.server({
		port: 8080,
		livereload: true,
		name: "Dev app",
		root: "./"
	});

	gutil.log("==Watch==");

	gulp.watch("./dist-dev/index.html", { delay: 2000 }, function updateHtml() {
		return gulp.src("./dist-dev/index.html").pipe(connect.reload());
	});

	gulp.watch("./src/**/*.ts", { delay: 2000 }, function compile() {
		return debug()
			.on("error", gutil.log)
			.pipe(connect.reload());
	});
};

const tob64 = () => {
	return gulp
		.src(paths.res)
		.pipe(b64inliner({ filename: "resources.ts", map_options: { es6: true } }))
		.pipe(gulp.dest("./src/inline"));
};
gulp.task("tob64", tob64);
gulp.task("default", watch_tsc);
gulp.task("watch", watch_tsc);
gulp.task("debug", debug);
gulp.task("release", gulp.series("clear-release", "res-release", "bundle-release", "pack-release"));
gulp.task("release-fake", gulp.series("clear-release", "res-release", "bundle-release-fake", "pack-release"));
