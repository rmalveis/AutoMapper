/// <reference path="../../../tools/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/jasmine-utils.d.ts" />

/// <reference path="../../../dist/automapper-classes.d.ts" />
/// <reference path="../../../dist/automapper-interfaces.d.ts" />
/// <reference path="../../../dist/automapper-declaration.d.ts" />

var globalScope = this;

module AutoMapperJs {
    class PascalCaseToCamelCaseMappingProfile extends Profile {
        public sourceMemberNamingConvention: INamingConvention;
        public destinationMemberNamingConvention: INamingConvention;

        public profileName = 'PascalCaseToCamelCase';

        public configure() {
            this.sourceMemberNamingConvention = new PascalCaseNamingConvention();
            this.destinationMemberNamingConvention = new CamelCaseNamingConvention();

            super.createMap('a', 'b');
        }
    }

    class CamelCaseToPascalCaseMappingProfile extends Profile {
        public sourceMemberNamingConvention: INamingConvention;
        public destinationMemberNamingConvention: INamingConvention;

        public profileName = 'CamelCaseToPascalCase';

        public configure() {
            this.sourceMemberNamingConvention = new CamelCaseNamingConvention();
            this.destinationMemberNamingConvention = new PascalCaseNamingConvention();
        }
    }

    // class ComplexObjectToSimpleObject extends Profile {
    //     public profileName = 'ComplexObjectToSimpleObject';
    //
    //     public configure() {
    //         alert('Complex configuration');
    //         super.createMap('complex', 'simple');
    //     }
    // }

    class ValidatedAgeMappingProfile extends Profile {
        public profileName = 'ValidatedAgeMappingProfile';

        public configure() {
            const sourceKey = '{808D9D7F-AA89-4D07-917E-A528F078E642}';
            const destinationKey = '{808D9D6F-BA89-4D17-915E-A528E178EE64}';

            this.createMap(sourceKey, destinationKey)
                .forMember('proclaimedAge', (opts: IMemberConfigurationOptions) => opts.ignore())
                .forMember('age', (opts: IMemberConfigurationOptions) => opts.mapFrom('ageOnId'))
                .convertToType(Person);
        }
    }

    class ValidatedAgeMappingProfile2 extends Profile {
        public profileName = 'ValidatedAgeMappingProfile2';

        public configure() {
            const sourceKey = '{918D9D7F-AA89-4D07-917E-A528F07EEF42}';
            const destinationKey = '{908D9D6F-BA89-4D17-915E-A528E988EE64}';

            this.createMap(sourceKey, destinationKey)
                .forMember('proclaimedAge', (opts: IMemberConfigurationOptions) => opts.ignore())
                .forMember('age', (opts: IMemberConfigurationOptions) => opts.mapFrom('ageOnId'))
                .convertToType(Person);
        }
    }

    class Person {
        fullName: string = null;
        age: number = null;
    }

    class BeerBuyingYoungster extends Person {
    }

    describe('AutoMapper.initialize', () => {
        beforeEach(() => {
            utils.registerTools(globalScope);
            utils.registerCustomMatchers(globalScope);
        });

        it('should use created mapping profile', () => {
            // arrange
            var fromKey = '{5700E351-8D88-A327-A216-3CC94A308EDE}';
            var toKey = '{BB33A261-3CA9-A8FC-85E6-2C269F73728C}';

            automapper.initialize((config: IConfiguration) => {
                config.createMap(fromKey, toKey);
            });

            // act
            automapper.map(fromKey, toKey, {});

            // assert
        });

        it('should be able to use a naming convention to convert Pascal case to camel case', () => {
            automapper.initialize((config: IConfiguration) => {
                config.addProfile(new PascalCaseToCamelCaseMappingProfile());
            });

            const sourceKey = 'PascalCase';
            const destinationKey = 'CamelCase';

            const sourceObject = {FullName: 'John Doe'};

            automapper
                .createMap(sourceKey, destinationKey)
                .withProfile('PascalCaseToCamelCase');

            var result = automapper.map(sourceKey, destinationKey, sourceObject);

            expect(result).toEqualData({fullName: 'John Doe'});
        });

        it('should be able to use a naming convention to convert camelCase to PascalCase', () => {
            automapper.initialize((config: IConfiguration) => {
                config.addProfile(new CamelCaseToPascalCaseMappingProfile());
            });

            const sourceKey = 'CamelCase2';
            const destinationKey = 'PascalCase2';

            const sourceObject = {fullName: 'John Doe'};

            automapper
                .createMap(sourceKey, destinationKey)
                .withProfile('CamelCaseToPascalCase');

            var result = automapper.map(sourceKey, destinationKey, sourceObject);

            expect(result).toEqualData({FullName: 'John Doe'});
        });

        it('should be able to use forMember besides using a profile', () => {
            automapper.initialize((config: IConfiguration) => {
                config.addProfile(new CamelCaseToPascalCaseMappingProfile());
            });

            const sourceKey = 'CamelCase';
            const destinationKey = 'PascalCase';

            const sourceObject = {fullName: 'John Doe', age: 20};

            automapper
                .createMap(sourceKey, destinationKey)
                .forMember('theAge', (opts: IMemberConfigurationOptions) => opts.mapFrom('age'))
                .withProfile('CamelCaseToPascalCase');

            var result = automapper.map(sourceKey, destinationKey, sourceObject);

            expect(result).toEqualData({FullName: 'John Doe', theAge: sourceObject.age});
        });

        it('should use profile when only profile properties are specified', () => {
            automapper.initialize((config: IConfiguration) => {
                config.addProfile(new ValidatedAgeMappingProfile2());
            });

            const sourceKey = '{918D9D7F-AA89-4D07-917E-A528F07EEF42}';
            const destinationKey = '{908D9D6F-BA89-4D17-915E-A528E988EE64}';

            const sourceObject = {fullName: 'John Doe', proclaimedAge: 21, ageOnId: 15};

            automapper
                .createMap(sourceKey, destinationKey)
                .withProfile('ValidatedAgeMappingProfile2');

            var result = automapper.map(sourceKey, destinationKey, sourceObject);

            expect(result).toEqualData({fullName: 'John Doe', age: sourceObject.ageOnId});
            expect(result instanceof Person).toBeTruthy();
            expect(result instanceof BeerBuyingYoungster).not.toBeTruthy();
        });

        it('should fail when using a non-existimg profile', () => {
            // arrange
            var caught = false;
            var profileName = 'Non-existing profile';
            const sourceKey = 'should fail when using ';
            const destinationKey = 'a non-existimg profile';
            const sourceObject = {};

            // act
            try {
                automapper
                    .createMap(sourceKey, destinationKey)
                    .withProfile(profileName);
                var result = automapper.map(sourceKey, destinationKey, sourceObject);
            } catch (e) {
                caught = true;

                // assert
                expect(e.message).toEqual('Could not find profile with profile name \'' + profileName + '\'.');
            }

            if (!caught) {
                // assert
                expect().fail('Using a non-existing mapping profile should result in an error.');
            }
        });

        it('should merge forMember calls when specifying the same destination property normally and using profile', () => {
            automapper.initialize((config: IConfiguration) => {
                config.addProfile(new ValidatedAgeMappingProfile());
            });

            const sourceKey = '{808D9D7F-AA89-4D07-917E-A528F078E642}';
            const destinationKey = '{808D9D6F-BA89-4D17-915E-A528E178EE64}';

            const sourceObject = {fullName: 'John Doe', proclaimedAge: 21, ageOnId: 15};

            automapper
                .createMap(sourceKey, destinationKey)
                .forMember('ageOnId', (opts: IMemberConfigurationOptions) => opts.ignore())
                .forMember('age', (opts: IMemberConfigurationOptions) => opts.mapFrom('proclaimedAge'))
                .convertToType(BeerBuyingYoungster)
                .withProfile('ValidatedAgeMappingProfile');

            var result = automapper.map(sourceKey, destinationKey, sourceObject);

            expect(result).toEqualData({fullName: 'John Doe', age: sourceObject.ageOnId});
            expect(result instanceof Person).toBeTruthy();
            expect(result instanceof BeerBuyingYoungster).not.toBeTruthy();
        });

        it('should be able to use currying when calling initialize(cfg => cfg.createMap)', () => {
            // arrange
            var fromKey = '{808D9D7F-AA89-4D07-917E-A528F078EE64}';
            var toKey1 = '{B364C0A0-9E24-4424-A569-A4C14102147C}';
            var toKey2 = '{1055CA5A-4FC4-44CA-B4D8-B004F43D4440}';

            var source = {prop: 'Value'};

            // act
            var mapFromKeyCurry: (destinationKey: string) => ICreateMapFluentFunctions;

            automapper.initialize((config: IConfiguration) => {
                mapFromKeyCurry = config.createMap(fromKey);

                mapFromKeyCurry(toKey1)
                    .forSourceMember('prop', (opts: ISourceMemberConfigurationOptions) => {
                        opts.ignore();
                    });

                mapFromKeyCurry(toKey2);
            });

            var result1 = automapper.map(fromKey, toKey1, source);
            var result2 = automapper.map(fromKey, toKey2, source);

            // assert
            expect(typeof mapFromKeyCurry === 'function').toBeTruthy();
            expect(result1.prop).toBeUndefined();
            expect(result2.prop).toEqual(source.prop);
        });

        // it('should be able to convert Complex Objects to Simple Objects', ()=> {
        //     automapper.initialize((config: IConfiguration) => {
        //         config.addProfile(new ComplexObjectToSimpleObject());
        //     });
        //
        //     const sourceKey = '{74d523ee-8dbb-4e72-bdf1-db8fa3b27d07}';
        //     const destinationKey = '{cf7bbaa0-14f9-400d-a59a-65313651db6b}';
        //
        //     automapper
        //         .createMap(sourceKey, destinationKey)
        //         .withProfile('ValidatedAgeMappingProfile');
        //
        //
        //
        // });
    });
}
