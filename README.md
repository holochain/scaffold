# hc-scaffold
Web-based wizard for generating scaffolding for [holochain](http://github.com/metacurrency/holochain) applications.

**Status:** Pre-Alpha. Early development and testing.

This is a web interface which walks you through the basic steps and approach for building a holochain-based distributed application. Remember, these applications are completely peer-to-peer with no server or nodes elevated above others in any privileged way, so you need to think about data integrity differently and instead of centralized enforcement of rules, mutual enforcement of shared rules.

The web tool generates a scaffold.json file which the holochain software uses to generate an application framework for you. It will have all the modules, data structures, CRUD, and validation scripts that you specify, but unless your application is extremely simple, you should expect to still need to do some coding. We think of it as an 80/20 thing. The scaffolding system should probably be able to generate about 80% of the code that needs to be written, but that final 20% is where the real programming intelligence comes into play about how your application will behave.

Also, the scaffold system may generate some really basic UI, but it will be extremely primitive. You will still need to do significant interface development if you plan on having users interface with your system directly (you might be able to skip this if your app will mostly be interfaced with via API).

Please see the [holochain repository](http://github.com/metacurrency/holochain) for more information on how this can be used as an alternative blockchain/Ethereum-based applications.
