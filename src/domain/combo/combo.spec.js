import Combo from './combo';

describe('Combo', () => {
  it('returns 0 when once called', () => {
    const combo = new Combo();

    expect(combo.checkCombo()).toBe(0);
  });

  it('returns 0 when twice called', () => {
    const combo = new Combo();

    expect(combo.checkCombo()).toBe(0);
    expect(combo.checkCombo()).toBe(0);
  });

  it('returns 3 (the combo number) when three times called', () => {
    const combo = new Combo();

    expect(combo.checkCombo()).toBe(0);
    expect(combo.checkCombo()).toBe(0);
    expect(combo.checkCombo()).toBe(3);
  });

  it('returns 4 (the combo number) when four times called', () => {
    const combo = new Combo();

    expect(combo.checkCombo()).toBe(0);
    expect(combo.checkCombo()).toBe(0);
    expect(combo.checkCombo()).toBe(3);
    expect(combo.checkCombo()).toBe(4);
  });

  it('returns 5 (the combo number) when five times called', () => {
    const combo = new Combo();

    expect(combo.checkCombo()).toBe(0);
    expect(combo.checkCombo()).toBe(0);
    expect(combo.checkCombo()).toBe(3);
    expect(combo.checkCombo()).toBe(4);
    expect(combo.checkCombo()).toBe(5);
  });

  it('returns 0 again if more than 1500 msecs are passed', () => {
    const DATE_START = new Date(1466424490000);
    const DATE_CHECK_1 = new Date(1466424490000 + 100);
    const DATE_CHECK_2 = new Date(1466424490000 + 110);
    const DATE_CHECK_3 = new Date(1466424490000 + 120);
    const DATE_CHECK_4_1500_SECS_MORE = new Date(1466424490000 + 1501);

    const spy = jest.spyOn(global, 'Date')
      .mockImplementationOnce(() => DATE_START)
      .mockImplementationOnce(() => DATE_CHECK_1)
      .mockImplementationOnce(() => DATE_CHECK_2)
      .mockImplementationOnce(() => DATE_CHECK_3)
      .mockImplementationOnce(() => DATE_CHECK_4_1500_SECS_MORE);

    const combo = new Combo();

    expect(combo.checkCombo()).toBe(0);
    expect(combo.checkCombo()).toBe(0);
    expect(combo.checkCombo()).toBe(3);
    expect(combo.checkCombo()).toBe(0);

    spy.mockRestore();
  });
});
