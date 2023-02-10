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
