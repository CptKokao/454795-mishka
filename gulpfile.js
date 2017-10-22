"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var webp = require("gulp-webp");
var imagemin = require("gulp-imagemin");
var run = require("run-sequence");
var del = require("del");
var uglify = require('gulp-uglify');
var pump = require('pump');

// ОТДЕЛЬНЫЕ ЗАДАЧИ
// Показ сайта в браузере ------------------------------------------------------
gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch("less/**/*.less", ["style"]);
  gulp.watch("*.html", ["html"]);
  gulp.watch("js/*.js", ["minjs"]);
});

// Создание webp-версий изображений --------------------------------------------
gulp.task("webp", function () {
  return gulp.src("img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("img"));
});

// Минимизация изображений -----------------------------------------------------
gulp.task("images", function () {
  return gulp.src("img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("img"));
});

// ЗАДАЧИ СБОРКИ
// Очистка продакшн-папки ------------------------------------------------------
gulp.task("clean", function () {
  return del("build");
});

// Копирование шрифтов, изображений, скриптов в продакшн-папку -----------------
gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**"
  ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});

// Создание и минимизация CSS --------------------------------------------------
gulp.task("style", function() {
  gulp.src("less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
});

// Минимизация JS --------------------------------------------------------------
gulp.task("minjs", function () {
  // pump([
        gulp.src("js/*.js")
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest("build/js"))
    // ],
    // cb
  // );
});

// Сборка векторного спрайта ---------------------------------------------------
gulp.task("sprite", function () {
  return gulp.src("img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

// Вставка векторного спрайта во все HTML-файлы --------------------------------
gulp.task("html", function () {
  return gulp.src("*.html")
    .pipe(posthtml([
      include()
    ]))
  .pipe(gulp.dest("build"));
});

// Сборка ----------------------------------------------------------------------
gulp.task("build", function (done) {
  run("clean", "copy", "style", "minjs", "sprite", "html", done);
});
