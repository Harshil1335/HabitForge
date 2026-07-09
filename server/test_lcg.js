function testLCG() {
  for (let hIndex = 0; hIndex < 6; hIndex++) {
    console.log(`\nHabit ${hIndex}:`);
    let trues = 0;
    for (let dIndex = 335; dIndex <= 365; dIndex++) {
      const seed = (hIndex + 1) * (dIndex + 1) * 12345;
      const rand = ((seed * 1103515245 + 12345) % 2147483648) / 2147483648;
      if (rand <= 0.6) trues++;
      // console.log(`  dIndex=${dIndex} rand=${rand}`);
    }
    console.log(`  Trues in last 30 days: ${trues} / 31`);
  }
}
testLCG();
