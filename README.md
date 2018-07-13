# hc-scaffold
Web-based wizard for generating scaffolding for [holochain](https://holochain.org/) applications.

**Status:** Pre-Alpha. Early development and testing.

This is a web interface which walks you through the basic steps and approach for building a holochain-based distributed application. Remember, these applications are completely peer-to-peer with no server or nodes elevated above others in any privileged way, so you need to think about data integrity differently and instead of centralized enforcement of rules, mutual enforcement of shared rules.

The web tool generates a scaffold.json file which the holochain software uses to generate an application framework for you. It will have all the modules, data structures, CRUD, and validation scripts that you specify, but unless your application is extremely simple, you should expect to still need to do some coding. We think of it as an 80/20 thing. The scaffolding system should probably be able to generate about 80% of the code that needs to be written, but that final 20% is where the real programming intelligence comes into play about how your application will behave.

Also, the scaffold system may generate some really basic UI, but it will be extremely primitive. You will still need to do significant interface development if you plan on having users interface with your system directly (you might be able to skip this if your app will mostly be interfaced with via API).

Please see [holochain](https://holochain.org/) for more information on how this can be used as an alternative to blockchain/Ethereum-based applications.

## Usage

To get started quickly, please see the [Hosted Version](https://holochain.github.io/scaffold/) of this code.

To run locally:

```
git clone https://github.com/holochain/scaffold.git
cd hc-scaffold
npm install --production
npm start
```

## Contributing

This project uses [Ninja Build](https://ninja-build.org/). You will need to install it.

```
git clone https://github.com/holochain/scaffold.git
cd hc-scaffold
npm install
npm test
npm start
```

- The `npm test` command includes the browserify / minification step, after making any changes, run this to see them.
- Please make sure `npm test` is successfull before submitting pull requests.
- Please make sure to squash your changes before submitting / updating pull requests.

## i18n / Languages

- All language files are currently compiled into the minified release bundle. After changing a source language file (`src/locale/[iso-2-letter-language-code].json`), you will need to run `npm test` to build the bundle (see "Contributing" above).
- Language json files must be saved as utf-8 encoding
- Strings support sprintf-style replacements, e.g.
  - en `"foo %1$s %2$d"` could output a string like `"foo bar 3"` while
  - ja `"%2$dご飯%1$s"` given the same input would output `"3ご飯bar"`
