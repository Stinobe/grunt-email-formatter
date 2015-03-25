/*
 * grunt-email-formatter
 * https://github.com/Gothematic/grunt-email-formatter
 *
 * Copyright (c) 2015 Gothematic
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var async = require('async');
var juice = require('juice');
var chalk = require('chalk');
var minify = require('html-minifier');

// Regular exprssion that will get our link-tags out of the HTML
var cssRegEx = /<link rel="\w*" href="(\w*\.css)">/gm;
// Regular expression that will get our style-tags out of the HTML
var cssInlineRegEx = /<style .*>([.\w\W]*?)<\/style>/gm;
// Regular expression that will get media queries out of our CSS
var mediaQueryRegEx = /@media[^{]+\{([\s\S]+?\})\s*\}/gm;
// Regular expression that will get classes with pseudo-elements out of the CSS
var pseudoRegEx = /(?!\n)+?^[\n\w\s\.:,-]+?:[\w\s]+[\s]*?\{[^}]+\}/gm;
// Regular expression to find the body-tag and add some styles under it!
var bodyRegEx = /<body(.*\s*?)>/gm;

var i = 0;

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    function getCSSfiles(filepath) {
        // Store the directory of the mail so we can find CSS-files that are included.
        var mailDir = path.dirname(filepath);

        // Generate new regular expressions for each time the function is called.
        // (something with cache in my regular expression I couldn't figure out, but this seems to do the trick);
        var cssRegExpr = new RegExp(cssRegEx);
        var cssInlineRegExpr = new RegExp(cssInlineRegEx);

        // Get the contents of the HTML-file
        var fileContents = grunt.file.read(filepath);

        // Get a list of the CSS-files (returns an array with all link-tags in the HTML);
        var cssFiles = fileContents.match(cssRegExpr);

        // Get all inline css (returns an array of CSS between style-tags in the HTML);
        var cssInlineFiles = fileContents.match(cssInlineRegExpr);

        // Store all CSS to send as a parameter in juice.inlineContent();
        var fullCSS = '';

        // Store CSS that has to be preserved (Media queries & pseudo-classes);
        var preservedCSS = '';

        // Render each CSS-file (keep all CSS-files in the same order);
        cssFiles.forEach(function (value, index) {
            // Re-initialize our regular expressions
            // (something with cache in my regular expression I couldn't figure out, but this seems to do the trick);
            var cssFileRegExpr = new RegExp(cssRegEx);
            var mediaQueryRegExpr = new RegExp(mediaQueryRegEx);
            var psuedoClassRegExpr = new RegExp(pseudoRegEx);

            // Now we can find out the path to our CSS-file (returns the value of href-attribute);
            var cssFilePath = cssFileRegExpr.exec(value);

            // Now we've got everything we need, we can just remove the current link-tag.
            fileContents = fileContents.replace(cssFileRegExpr, '');

            // Now get the relative path to our CSS-files and read the content of that file
            var cssLocation = path.join(mailDir, cssFilePath[1]);
            var cssContent = grunt.file.read(cssLocation);

            // Send the end-user some information about the CSS-files we've found.
            console.log('Checking ' + chalk.blue(cssLocation));

            // Get the media queries out of our CSS-file
            var mediaQueries = cssContent.match(mediaQueryRegExpr);
            // Define an empty string just in case no media queries are found
            var mediaQueryiesStr = '';
            if (mediaQueries) {
                mediaQueryiesStr = mediaQueries.join(' ');

                // Update the user about the media queries that were found (in case they want to check);
                // Maybe a little bit to detailled, but might come in very handy for the controll freaks at your agency
                if (mediaQueries.length == 1) {
                    console.log(chalk.dim.white('\t' + mediaQueries.length + ' media query was found.'));
                } else if (mediaQueries.length > 1) {
                    console.log(chalk.dim.white('\t' + mediaQueries.length + ' media queries were found.'));
                }
            } else {
                console.log(chalk.dim.white('\tNo queries found.'));
            }

            // Get all classes with pseudo-elements out of our CSS-file
            var pseudoElements = cssContent.match(psuedoClassRegExpr);
            // Define an empty string just in case no pseudo-elements are found
            var pseudoElementsStr = '';
            if (pseudoElements) {
                pseudoElementsStr = pseudoElements.join(' ');

                // Update the user about the pseudo elements that were found (in case they want to check);
                // Maybe a little bit to detailled, but might come in very handy for the controll freaks at your agency
                if (pseudoElements.length == 1) {
                    console.log(chalk.dim.white('\t' + pseudoElements.length + ' pseudo element was found. ' + chalk.italic('(Classes separated with a comma count as one.)')));
                } else if (pseudoElements.length > 1) {
                    console.log(chalk.dim.white('\t' + pseudoElements.length + ' psuedo elements were found. ' + chalk.italic('(Classes separated with a comma count as one.)')));
                }
            } else {
                console.log(chalk.dim.white('\tNo pseudo elements found.'));
            }

            // The only thing left to do is remove these media queries & pseudo elements out of our CSS
            // Not necessary but just to keep things clean
            cssContent.replace(mediaQueryRegExpr, '');
            cssContent.replace(psuedoClassRegExpr, '');

            // Add the remaining CSS to the string that will be 'inlined'
            fullCSS += cssContent;

            // Add the stored media queries to the string we'll be adding inside the body later
            preservedCSS += mediaQueryiesStr + pseudoElements;

        });

        if (cssInlineFiles.length > 0) {
            console.log('Checking ' + chalk.cyan('inline css'));
        }

        // We want to inform our end-user with how many media queries and pseudo elements were found, but with only 1 log
        var inlineMediaQuery = 0;
        var inlinePseudo = 0;

        // Next in line we want to add inline CSS (keep them in the same order);
        cssInlineFiles.forEach(function (value, index) {
            // Re-initialize our regular expressions
            // (something with cache in my regular expression I couldn't figure out, but this seems to do the trick);
            var mediaQueryRegExpr = new RegExp(mediaQueryRegEx);
            var psuedoClassRegExpr = new RegExp(pseudoRegEx);

            var cssInlineFileRegExpr = new RegExp(cssInlineRegEx);
            var cssInlineContent = cssInlineFileRegExpr.exec(value);

            // We just need the CSS between the style-tags ofcourse
            cssInlineContent = cssInlineContent[1];

            // Get the media queries out of our CSS-file
            var mediaQueries = cssInlineContent.match(mediaQueryRegExpr);
            // Define an empty string just in case no media queries are found
            var mediaQueryiesStr = '';
            if (mediaQueries) {
                mediaQueryiesStr = mediaQueries.join(' ');
                inlineMediaQuery += mediaQueries.length;
            }

            // Get all classes with pseudo-elements out of our CSS-file
            var pseudoElements = cssInlineContent.match(psuedoClassRegExpr);
            // Define an empty string just in case no pseudo-elements are found
            var pseudoElementsStr = '';
            if (pseudoElements) {
                pseudoElementsStr = pseudoElements.join(' ');
                inlinePseudo += pseudoElements.length;
            }

            // The only thing left to do is remove these media queries & pseudo elements out of our CSS
            // Not necessary but just to keep things clean
            cssInlineContent.replace(mediaQueryRegExpr, '');
            cssInlineContent.replace(psuedoClassRegExpr, '');

            //fileContents = fileContents.replace(cssInlineContent[0], '');
            fullCSS += cssInlineContent[1];

            // Add the stored media queries to the string we'll be adding inside the body later
            preservedCSS += mediaQueryiesStr + pseudoElementsStr;

        });

        fileContents = fileContents.replace(cssInlineRegExpr, '');

        // Update the user about the media queries that were found (in case they want to check);
        // Maybe a little bit to detailled, but might come in very handy for the controll freaks at your agency
        if (inlineMediaQuery == 1) {
            console.log(chalk.dim.white('\t' + inlineMediaQuery + ' media query was found.'));
        } else if (inlineMediaQuery > 1) {
            console.log(chalk.dim.white('\t' + inlineMediaQuery + ' media querie were found.'));
        } else {
            console.log(chalk.dim.white('\tNo queries found.'));
        }

        // Update the user about the psuedo elements that were found (in case they want to check);
        // Maybe a little bit to detailled, but might come in very handy for the controll freaks at your agency
        if (inlinePseudo == 1) {
            console.log(chalk.dim.white('\t' + inlinePseudo + ' pseudo element was found. ' + chalk.italic('(Classes separated with a comma count as one.)')));
        } else if (inlineMediaQuery > 1) {
            console.log(chalk.dim.white('\t' + inlinePseudo + ' pseudo elements were found. ' + chalk.italic('(Classes separated with a comma count as one.)')));
        } else {
            console.log(chalk.dim.white('\tNo pseudo elements found.'));
        }

        // Add some style after the body-tag
        var bodyRegExpr = new RegExp(bodyRegEx);
        //preservedCSS = preservedCSS.replace(/\n/gm, '').replace(/\t/gm,'');
        fileContents = fileContents.replace(bodyRegExpr, '<body$1><style type="text/css">'+preservedCSS+'</style>');
        fileContents = fileContents.replace(/\n/gm, '').replace(/\t/gm,'');

        var inlineCode = juice.inlineContent(fileContents, fullCSS, {
            preserveMediaQueries: true,
            applyWidthAttributes: true
        });

        console.log(chalk.magenta.bold(' - CSS merged into HTML - '));

        return inlineCode;
    }

    grunt.registerMultiTask('email_formatter', 'Optimize your HTML for emails. Place all your CSS inline & optimize images.', function () {
        var done = this.async();

        async.eachLimit(this.files, this.files.length, function (file, next) {

            if (!grunt.file.exists(file.src.toString())) {
                console.log('The file ' + chalk.red(file.src) + ' does not exist');
            } else {
                console.log('\n');
                console.log('Processing: ' + chalk.bold(chalk.yellow(file.src)));
                var mergedContent = getCSSfiles(file.src);
                grunt.file.write(file.dest, mergedContent);
            }
        });
    });

};
