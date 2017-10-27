var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber"); //После найденой ошибки (показывает) программа продолжается работать
var postcss = require("gulp-postcss"); //автоматически проставляет браузерные префиксы префиксы для браузеров browserslist (package.json)
var autoprefixer = require("autoprefixer"); //автоматически проставляет браузерные префиксы
var server = require("browser-sync").create(); //запускает сервер
var minify = require("gulp-csso");  // минимизирует css
var rename = require("gulp-rename"); // переименовывает файл
var imagemin = require("gulp-imagemin"); //оптимизирует картинки
var svgstore = require("gulp-svgstore"); //оптимизирует картинки
var webp = require("gulp-webp"); //добавляем изображения в формате webp
var posthtml = require("gulp-posthtml"); //
var include = require("posthtml-include"); //
var del = require("del"); //удаляет папку
var uglify = require('gulp-uglify'); //минимизирует js
var pump = require('pump'); //минимизирует js
var run = require("run-sequence"); //запускает последовательно процессы

//формирует из less => css
gulp.task("style", function() {
  gulp.src("less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([autoprefixer()])) //подставить автопрефиксы
    .pipe(gulp.dest("build/css")) //положить в формате css (в папку build для production)
    .pipe(server.stream()) //обновляет страницу после изменения
    .pipe(minify())
    .pipe(rename("style.min.css")) // переименовывает файл, чтобы не стерся css gulp.dest("css")
    .pipe(gulp.dest("build/css")); //положить в формате css мини.файл (в папку build для production)
});

//запускает сервер, отслеживает файлы
gulp.task("serve", function() {
  server.init({
    server: "build/" // путь до кореня сайта (index.html) .тажа самая папка в которой мы находимся
  });

  gulp.watch("less/**/*.less", ["style"]) // файлы за которыми надо следить **любое количесвто подпапок, *любое. Если есть изменения то запускает задачу Style gulp.task("style")
  gulp.watch("*.html", ["html"])
    .on("change", server.reload); // тоже самое только для html
});

//оптимизирует картинки
gulp.task("images", function() {
  return gulp.src("img/**/*.{png,jpg,svg}") //форматы с которые нужно оптимизировать
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true}), //прогрессивная загрузка
    imagemin.optipng({optimizationLevel: 3}), //уровень сжатия безопасный
    imagemin.svgo ()
  ]))
  .pipe(gulp.dest("img")); //положить в папку img
});

//создаем svg спрайт
gulp.task("sprite", function() {
  return gulp.src("img/icon-*.svg")
  .pipe(svgstore({
    inlineSvg: true  // инлайн свг
  }))
  .pipe(rename("sprite.svg")) // переименовывает файл
  .pipe(gulp.dest("build/img")); //положить спрайт (в папку build для production)
});

//добавляем изображения в формате webp
gulp.task("webp", function() {
  return gulp.src("img/**/*.{png,jpg}")
  .pipe(webp({quality: 90})) //уровень сжатия
  .pipe(gulp.dest("img")); //положить в папку img
});

gulp.task("html", function() {
  return gulp.src("*.html")
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest("build")); //положить в папку build для production
});

//минимизирует js
gulp.task("minjs", function () {
  return gulp.src("js/*.js")
  .pipe(uglify())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest("build/js"))
});

//копирование файлов в папку build (шрифты с расширением, изображения, js)
gulp.task("copy", function() {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**"
  ], {
    base: "."
  })
 .pipe(gulp.dest("build"))
});

//удаляет папку build
gulp.task("clean", function(){
  return del("build");
});

//Запуск
gulp.task("build", function (done) {
  run (
    "clean",
    "copy",
    "style",
    "minjs",
    "sprite",
    "html",
    done
  );
});
