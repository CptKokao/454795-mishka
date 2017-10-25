var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber"); //После найденой ошибки (показывает) программа продолжается работать
var postcss = require("gulp-postcss"); //автоматически проставляет браузерные префиксы префиксы для браузеров browserslist (package.json)
var autoprefixer = require("autoprefixer"); //автоматически проставляет браузерные префиксы
var server = require("browser-sync"); //запускает сервер
var minify = require("gulp-csso");  // минимизирует css
var rename = require("gulp-rename"); // переименовывает файл
var imagemin = require("gulp-imagemin");//оптимизирует картинки

//работает с style.less
gulp.task("style", function() {
  gulp.src("less/style.less")
    .pipe(plumber())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest("css")) //Выплюнуть в формате css
    .pipe(server.stream()) //обновляет страницу после изменения
    .pipe(minify())
    .pipe(rename("style.min.css")) // переименовывает файл, чтобы не стерся css gulp.dest("css")
    .pipe(gulp.dest("css"));
});

//запускает сервер, отслеживает файлы
gulp.task("serve", ["style"], function() {
  server.init({
    server: "." // путь до кореня сайта (index.html) .тажа самая папка в которой мы находимся
  });

  gulp.watch("less/**/*.less", ["style"]) // файлы за которыми надо следить **любое количесвто подпапок, *любое. Если есть изменения то запускает задачу Style gulp.task("style")
  gulp.watch("*.html")
    .on("change", server.reload); // тоже самое только для html
});

//оптимизирует картинки
gulp.task("images", function() {
  return gulp.src("img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo ()
  ]))
  .pipe(gulp.dest("img"));
});
