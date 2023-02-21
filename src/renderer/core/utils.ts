import colorMap from '../constants/colorMap';

/* eslint-disable no-plusplus */
export const mergeClasses = (
  inlineArray: string[],
  propArray: string[] | undefined
) => {
  return propArray && propArray.length > 0
    ? inlineArray.concat(
        propArray.filter((item) => inlineArray.indexOf(item) < 0)
      )
    : inlineArray;
};

export const isEmptyObject = (obj: any) => {
  return Object.keys(obj).length > 0;
};

/**
 * Shuffle the given data before picking.
 * The fixed index on usage is intentional and can be any fixed number within range
 * Usage: `shuffle(addresses)[2]`
 * @param {Array} array of data to shuffle
 * @returns {Array} a reshuffled array
 */
export const shuffle = (arr: any) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Pick a color from the color map constant. Color must be a tailwind color.
 * Usage: `pickColor('yellow')`
 * @param {String} colorWanted color wanted from color map
 * @returns {Object} a color map object: `{
    color: 'yellow',
    background: 'bg-yellow-300',
    text: 'text-yellow-800',
  }`
 */
export const pickColor = (colorWanted: string) => {
  return colorMap.find((co) => co.color === colorWanted) || colorMap[0];
};
