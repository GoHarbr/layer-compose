// @flow
import { $, layerCompose, enableDebug } from '../../src/index';

enableDebug();

describe('Regressions affecting lens additions', function () {

  test('Adding initializer', (done) => {
    const testFn = jest.fn();

    const C2 = layerCompose({
      _($, _) {
        console.log('C2._');
      } },

    {
      fn($, _) {
        console.log('fn');
      } });



    const C1 = layerCompose({
      _($ /*: { [key : '_'|'then'] : (o: ?any) => void } */, _ /*: {-[string]: any } */, o /*: ?any */) {
        console.log('C.$');
      } },


    C2);


    const UsedBy = $({
      C: $(C1).$({
        _: ($, _) => {
          console.log('UsedBy.C._');
          testFn();
        } }) });




    UsedBy({}, (u) => {
      u.C((c) => {
        console.log('1');
      });
      u.C((c) => {
        console.log('2');
        done();
      });
    });

  });

});