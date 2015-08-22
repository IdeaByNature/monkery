# Monkery

Modifies a Monk connection to save to multiple MongoDB instances.

## Installation

    npm install git@IdeaByNature/monkery.git --save
    
## Usage

    var monk = require('monk')
    var monkery = require('monkery')

    var db = monk('127.0.0.1:27017/monkery-business')
    var backup = monk('192.168.1.123:27017/more-monkery-business')
    monkery.add_destination(db, backup)
    
You can also optionally customize which monk methods are mirrored:

    monkery.add_destination(db, backup, ['update', 'insert', 'summon_monastery'])
    
The default methods are 'update' and 'insert'.