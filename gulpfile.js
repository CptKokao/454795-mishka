var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber"); //После найденой ошибки (показывает) программа продолжается работать
var autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов
var server = require("browser-sync"); //запускает сервер
var minify = require("gulp-csso");  // минимизирует css
var rename = require("gulp-rename"); // переименовывает файл
var imagemin = require("gulp-imagemin"); //оптимизирует картинки
var svgstore = require("gulp-svgstore"); // svg спрайт
var webp = require("gulp-webp"); //добавляем изображения в формате webp
var include = require("posthtml-include"); //
var del = require("del"); //удаляет папку
var uglify = require('gulp-uglify'); //минимизирует js
var pump = require('pump'); //минимизирует js
var run = require("run-sequence"); //запускает последовательно процессы

//формирует из less => css, минимизирует css
gulp.task("style", function() {
  gulp.src("less/style.less") //берем источник
    .pipe(plumber()) //отлавливает ошибки и не тормозит сервер
    .pipe(less()) //формирует из less => css
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
    .pipe(gulp.dest("build/css")) //положить в формате css (в папку build для production)
    .pipe(server.stream()) //говорит что изменился css файл и нужно обновить страницу
    .pipe(minify()) // минимизирует css
    .pipe(rename("style.min.css")) // переименовывает файл, чтобы не стерся css gulp.dest("css")
    .pipe(gulp.dest("build/css")); //положить в формате css мини.файл (в папку build для production)
});

//запускает browser-sync, отслеживает файлы
gulp.task("serve", function() {
  server.init({
    server: "build/" // путь до кореня сайта (index.html) .тажа самая папка в которой мы находимся
  });

  gulp.watch("less/**/*.less", ["style"]) // файлы за которыми надо следить **любое количесвто подпапок, *любое. Если есть изменения то запускает задачу Style gulp.task("style")
  gulp.watch("*.html", ["html"]) // тоже самое только для html
});

//оптимизирует картинки, верезает информацию
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
    "img/**",
    "*.html"
  ], {
    base: "."
  })
 .pipe(gulp.dest("build"))
});

//удаляет папку build
gulp.task("clean", function(){
  return del("build");
});

//Запуск "build": "gulp build" в package.json
gulp.task("build", function (done) {
  run (
    "clean",
    "copy",
    "style",
    "minjs",
    "sprite",
    done
  );
});
