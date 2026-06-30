export function randomInteger(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function shuffleArray<T>(array: T[]): T[] {
  // BASED ON: Fisher–Yates Shuffle Algorithm
  for (
    let shuffleFromIndex = array.length - 1;
    shuffleFromIndex > 0;
    shuffleFromIndex -= 1
  ) {
    const shuffleToIndex = randomInteger(0, shuffleFromIndex);
    const shuffleToValue = array[shuffleToIndex];

    array[shuffleToIndex] = array[shuffleFromIndex];
    array[shuffleFromIndex] = shuffleToValue;
  }

  return array;
}
