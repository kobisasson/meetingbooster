"use strict";
var abstractWriter = require('./../lib/utility/abstractWriter.js')
var C = require('./../lib/utility/contracts.js')
var assert = require('assert');

var fragments = {
    "1": '{}',
    "2": '{"key":"value""key":"value"}',
    "3": '{{"key":"value"}}',
    "4": '{{"key":"value"{"key":"value"}}}'
}

describe('AbstractWriter test', function () {

    describe('Test basic APIs', function () {
        var writer = abstractWriter();
        beforeEach(function(){
            writer.initialize();
        })
        it('Flat tags test', function () {
            writer.beginNode("{","}");
            writer.endNode();
            assert.equal(writer.serialize(), fragments["1"])
        });

        it('Add tag test', function () {
            writer.beginNode("{","}");
                writer.addLine('"key":"value"');
                writer.addLine('"key":"value"');
            writer.endNode();
            assert.equal(writer.serialize(), fragments["2"])
        });

        it('Add nested tag test', function () {
            writer.beginNode("{","}");
                writer.beginNode("{","}");
                    writer.addLine('"key":"value"');
                writer.endNode();
            writer.endNode();
            assert.equal(writer.serialize(), fragments["3"])
        });
        it('Add nested tag test', function () {
            writer.beginNode("{","}");
                writer.beginNode("{","}");
                    writer.addLine('"key":"value"');
                    writer.beginNode("{","}");
                        writer.addLine('"key":"value"');
                    writer.endNode();
                writer.endNode();
            writer.endNode();
            assert.equal(writer.serialize(), fragments["4"])
        });

    });
});
