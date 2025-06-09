const { src, dest, series, parallel, watch, on } = require('gulp')

//Importowanie paczek
const sass = require('gulp-sass')(require('sass'))
const cssnano = require('gulp-cssnano')
const autoprefixer = require('gulp-autoprefixer')
const rename = require('gulp-rename')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
const sourcemaps = require('gulp-sourcemaps')
const clean = require('gulp-clean')
const kit = require('gulp-kit')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

//Zdefiniowanie ścieżek
const paths = {
	sass: {
		src: './src/sass/**/*.scss',
		dest: './dist/css',
	},
	js: {
		src: './src/js/**/*.js',
		dest: './dist/js',
	},
	img: {
		src: './src/img/*',
		dest: './dist/img',
	},
	dist: './dist',
	kit: {
		src: './html/**/*.kit',
		dest: './',
	},
}

//Funkcja do kompresji SASS
function sassCompiler(done) {
	src(paths.sass.src)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cssnano())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sass.dest))
	done()
}

//Fukcja do kompresji JS
function jsCompiler(done) {
	src(paths.js.src)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.js.dest))
	done()
}

//Funkcja do kompresji obrazów
// function imageMinifier(done) {
// 	src(paths.img.src).pipe(imagemin()).pipe(dest(paths.img.dest))
// 	done()
// }

//Funcja do kopiowania obrazów
const fs = require('fs')
const path = require('path')

function copyImagesManually(done) {
	const sourceDir = path.join(__dirname, 'src/img')
	const destDir = path.join(__dirname, 'dist/img')

	// Upewnij się, że katalog docelowy istnieje
	fs.mkdirSync(destDir, { recursive: true })

	// Wczytaj wszystkie pliki w katalogu źródłowym
	const files = fs.readdirSync(sourceDir)

	files.forEach(file => {
		// Obsłuż tylko pliki graficzne
		if (/\.(jpe?g|png|gif|svg)$/i.test(file)) {
			const srcFile = path.join(sourceDir, file)
			const destFile = path.join(destDir, file)
			fs.copyFileSync(srcFile, destFile)
			console.log(`✅ Skopiowano: ${file}`)
		}
	})

	done()
}
const imageMinifier = copyImagesManually

//Funkcja do czyszczenia katalogu docelowego
function cleanStuff(done) {
	src(paths.dist, { read: false }).pipe(clean())
	done()
}

//Funcja do uruchomienia serwera
function startServer(done) {
	browserSync.init({
		server: {
			baseDir: './',
		},
	})
	done()
}

//Funkcja do kompilacji plików .kit
function kitCompiler(done) {
	src(paths.kit.src).pipe(kit()).pipe(dest(paths.kit.dest))
	done()
}
//Funkcja do obserwacji zmian
function watchForChanges(done) {
	watch('./*.html').on('change', reload)
	watch(paths.sass.src, sassCompiler).on('change', reload)
	watch(paths.js.src, jsCompiler).on('change', reload)
	watch(paths.img.src, imageMinifier).on('change', reload)
	watch(paths.kit.src, kitCompiler).on('change', reload)
	done()
}

const mainfunction = parallel(kitCompiler, sassCompiler, jsCompiler, imageMinifier)

exports.cleanStuff = cleanStuff
exports.default = series(mainfunction, startServer, watchForChanges)
