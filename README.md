This is a fork of [Vinny](https://github.com/k2l8m11n2/vinny) for the private TechHOUNDS Discord server, with various unnecessary features cut and selfroles reworked for TechHOUNDS's "division" system.

# Installation

1. Do `yarn install` to install dependencies
2. Copy the example `secrets.yaml` and `config.yaml` files and edit to taste
3. Run with CONFIG, SECRETS and SQLITE environment variables, e.g.
   `CONFIG=/home/vinny-config.yaml SECRETS=/home/vinny-secrets.yaml SQLITE=/home/vinny.sqlite node src/index.js`
   (SQLITE is a path to where the database is stored)
