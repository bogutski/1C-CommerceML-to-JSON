const app = require('../app');
const expect = require('expect');

it('add func', () => {
    let res = app.add(12, 2);
    expect(res).toBe(14).toBeA('number') ;

});