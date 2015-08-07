var tape = require('tape');

tape('smoke test', function (assert) {
    assert.plan(1);

    assert.fail('failed');
});
