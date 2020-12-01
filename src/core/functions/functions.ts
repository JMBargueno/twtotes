/**
 * Return a random number
 * 
 * @param min Minimun random number
 * @param max Max random number
 */
export function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}
