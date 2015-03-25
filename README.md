# grunt-email-formatter

This plugin currently places CSS inline, but preserves media queries and classes with pseudo elements.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-email-formatter --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-email-formatter');
```

## The "email_formatter" task

### Overview
In your project's Gruntfile, add a section named `email_formatter` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  email_formatter: {
    your_target: {
      files: [{
            expand: true,
            cwd: 'mails/',
            src: ['**/*.{html,htm}'],
            dest: 'build/',
            ext: '.inline.html'
        },]
    },
  },
});
```

### Options

At this moment options are not supported, but it's the first thing on our todo-list!

## Our todo-list
* Make options available
* Optimize images
* Create a zip-file for tools like Email on acid, Silverpop, ...
* ...

## Used NPM packages

* [Path](https://www.npmjs.com/package/path)
* [Async](https://www.npmjs.com/package/async)
* [Juice](https://www.npmjs.com/package/juice)
* [Chalk](https://www.npmjs.com/package/chalk)
* [HTML Minifier](https://www.npmjs.com/package/html-minifier)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
March 25th 2015 - First initial commit
