// @flow
import { layerCompose, pause, o } from "../../src";

test("A composition can re-wrap another composition (take it's core) ", (done) => {
  const testFn = jest.fn();
  const C = layerCompose({
    assert($, _) {
      testFn(_.key);
    },
  });

  C({ key: "value" }, async (c1) => {
    await c1.assert();
    expect(testFn).toHaveBeenCalledWith("value");
    C(c1, async (c2) => {
      await c2.assert();

      expect(testFn).toHaveBeenCalledWith("value");
      expect(testFn).toHaveBeenCalledTimes(2);

      done();
    });
  });
});

test.skip("A composition will try to find it's own type in the chains of lenses / parents ", (done) => {
  const testFn = jest.fn();

  const C = o.$({
    assertParent(
      $ /*: { [key : 'Child'|'assertParent'|'update'|'then'] : (o: ?any) => void } */,
      _ /*: { key : string , -[string]: any } */,
      o /*: ?any */
    ) {
      testFn(_.key);
    },
    update(
      $ /*: { [key : 'assertParent'|'update'|'then'] : (o: ?any) => void } */,
      _ /*: { key : string , -[string]: any } */,
      o /*: ?any */
    ) {
      _.key = o;
    },
  });

  const Child = layerCompose({
    assertChild($, _) {
      const resume = pause($);
      C($, async (p) => {
        await p.assertParent();
        expect(testFn).toHaveBeenCalledWith("value");

        p.update("diff");
        await p.assertParent();
        expect(testFn).toHaveBeenCalledWith("diff");

        resume();
      });
    },
  });

  const Test = layerCompose(
    {
      Child,
    },

    C
  );

  Test({ key: "value" }, async (c1) => {
    await c1.assertParent();
    expect(testFn).toHaveBeenCalledWith("value");
    c1.Child(async (child) => {
      await child.assertChild();

      expect(testFn).toHaveBeenCalledTimes(3);

      done();
    });
  });
});
