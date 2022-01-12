// @flow
import { layerCompose, pause, o } from "../../src";

test("Layers can be reordered", (done) => {
  const _layer = layerCompose({
    _($, _) {
      _.key = "v";
    },
  });

  const Composition = layerCompose(
    {
      _($, _) {
        if (_.not) {
          expect("key" in _).not.toBeTruthy();
        } else {
          expect(_.key).toBeTruthy();
        }
      },
    },

    _layer
  );

  const Reordered = o.$(_layer).$(Composition);

  // testing base composition, should fail
  Composition({ not: true }, (c) => {
    // once that test is done, testing the reordered
    Reordered({ not: false }, (r) => {
      done();
    });
  });
});

test("Lenses do not loose [new, existing] order", (done) => {
  const _layer = layerCompose({
    Lens: o.$({
      fn(
        $ /*: { [key : 'fn'|'top'|'then'] : (o: ?any) => void } */,
        _ /*: {-[string]: any } */,
        o /*: ?any */
      ) {
        _.key = "v";
      },
      top($, _) {
        /* debugging marker */
      },
    }),
  });

  const Composition = layerCompose(_layer, {
    Lens: o.$({
      fn($, _) {
        expect(_.key).toBe("v");
      },
    }),
  });

  // testing base composition, should fail
  Composition({}, (c) => {
    // once that test is done, testing the reordered
    c.Lens({}, (l) => {
      l.fn().then(done);
    });
  });
});
